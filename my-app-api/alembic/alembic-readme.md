# Alembic Migrations Guide (Beginner-Friendly)

A complete guide to managing database schema changes safely with **Alembic** in a **FastAPI + SQLAlchemy + PostgreSQL** project on **Windows 11**.

---

## What Is a Database Migration (and Why Use Alembic)?

When your app grows, your database tables change—you might add a `phone` column to `users`, add a `posts` table, or change a column's length.

* **Without migrations:** You have to run manual SQL commands (`ALTER TABLE ...`) in `psql` or DBeaver and try to remember what changed on each machine or container.
* **With Alembic:** Every database change is saved as a versioned Python script inside `alembic/versions/`. You can apply changes (`upgrade`), undo changes (`downgrade`), check what version your database is on (`current`), and keep local, Docker, and team databases in sync.

---

## Prerequisites & Project Layout

Make sure you have:
* Virtual environment `.venv` created and activated in PowerShell (`.\.venv\Scripts\Activate.ps1`).
* `DATABASE_URL` configured in `.env` (for example, `postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/myapp`).
* SQLAlchemy models defined in `app/models.py` and `Base` defined in `app/database.py`.

Expected folder structure:

```text
my-app-api/
├── .env
├── alembic.ini
├── requirements.txt
├── main.py
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
└── app/
    ├── __init__.py
    ├── database.py
    ├── models.py
    ├── schemas.py
    └── routers/
        └── users.py
```

---

## Initial Setup

### 1. Install Alembic
With `(.venv)` active in PowerShell:

```powershell
pip install alembic
```

Add `alembic` to `requirements.txt` as well so Docker builds include it.

### 2. Initialize Alembic
From your project root:

```powershell
alembic init alembic
```

### 3. Configure `alembic/env.py`
Update `alembic/env.py` so Alembic loads `DATABASE_URL` from `.env` and sees all models registered on `Base.metadata`:

```python
import os
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from app import models  # noqa: F401 - ensures models register with Base.metadata
from app.database import Base

load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL is not set in environment or .env")
    return url


def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

---

## Scenario 1: Fresh Database (Tables Do Not Exist Yet)

Use this when starting against a brand-new or empty database.

1. Make sure your models are defined in `app/models.py`.
2. Generate the initial migration:
   ```powershell
   alembic revision --autogenerate -m "create initial tables"
   ```
3. Inspect the generated file inside `alembic/versions/` to verify `upgrade()` and `downgrade()`.
4. Apply the migration:
   ```powershell
   alembic upgrade head
   ```
5. Confirm the current revision:
   ```powershell
   alembic current
   ```

---

## Scenario 2: Existing Database (Tables Already Exist, No Alembic History Yet)

Use this when your table (such as `users`) was already created manually in `psql` or DBeaver and `alembic current` shows no revision ID yet.

1. Generate the baseline revision:
   ```powershell
   alembic revision --autogenerate -m "initial users table"
   ```
2. **Stamp** the database as already at `head` so Alembic records the baseline without trying to recreate existing tables:
   ```powershell
   alembic stamp head
   ```
3. Verify:
   ```powershell
   alembic current
   ```

> **Important:** Only use `alembic stamp head` when the schema in the database **already matches** the target revision.

---

## Scenario 3: Adding a New Nullable (Optional) Column

Use this when a new column can be `NULL` for existing and new rows.

1. Update `app/models.py` (for example, adding an optional `bio` column):
   ```python
   bio: Mapped[str | None] = mapped_column(String(255), nullable=True)
   ```
2. Generate the migration:
   ```powershell
   alembic revision --autogenerate -m "add bio to users"
   ```
3. Review the script in `alembic/versions/` and apply it:
   ```powershell
   alembic upgrade head
   ```
4. Update Pydantic schemas (`app/schemas.py`) and endpoints (`app/routers/`) if the API should accept/return the field.

---

## Scenario 4: Adding a Required (`NOT NULL`) Column When Rows Already Exist

If a table already has rows and you add a `NOT NULL` column without a default/backfill, PostgreSQL fails with:
`psycopg.errors.NotNullViolation: column "..." of relation "..." contains null values`

### Safe Way to Handle Existing Rows
1. Update `app/models.py` with the new required field (for example, `phone` on `User`).
2. Generate the revision:
   ```powershell
   alembic revision --autogenerate -m "add phone to users"
   ```
3. Edit the generated migration file in `alembic/versions/` so `upgrade()` adds the column as nullable first, backfills existing rows, and then sets `nullable=False` (and keep only the intended changes):
   ```python
   def upgrade() -> None:
       op.add_column(
           "users",
           sa.Column("phone", sa.String(length=20), nullable=True),
       )
       op.execute("UPDATE users SET phone = '' WHERE phone IS NULL")
       op.alter_column(
           "users",
           "phone",
           existing_type=sa.String(length=20),
           nullable=False,
       )


   def downgrade() -> None:
       op.drop_column("users", "phone")
   ```
4. Run the migration:
   ```powershell
   alembic upgrade head
   ```
5. Update `app/schemas.py` and `app/routers/users.py` so `POST /users/` and responses include `phone`.

---

## Scenario 5: Going Back / Downgrading / Reverting a Mistake

### Check Where You Are
```powershell
alembic current
alembic history
alembic heads
```

### Step Back One Revision
```powershell
alembic downgrade -1
```

### Go to a Specific Revision ID (e.g., Initial Revision)
```powershell
alembic downgrade <revision_id>
```
*(Replace `<revision_id>` with the revision hash shown in `alembic history`, such as `0f383ca47ae0`.)*

### Go All the Way Back to Empty Schema
```powershell
alembic downgrade base
```

### Removing an Unwanted Migration File
If a migration script was created by mistake and is **not** applied to the database:
1. Confirm `alembic current` does **not** point to that revision.
2. Delete the unwanted `.py` file from `alembic/versions/`.
3. Revert any temporary changes in `app/models.py` so your models match your active migration head.

---

## Scenario 6: Running Migrations With Docker Compose

If your PostgreSQL container runs via Docker Compose (for example, `myapp-postgres` on port `5433` and `myapp-api` on port `8000`):

### Option A: Run Alembic From Your Host Pointing to Docker's Exposed Port
If `docker-compose.yml` maps `"5433:5432"`:

```powershell
$env:DATABASE_URL="postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5433/myapp"
alembic upgrade head
```

### Option B: Run Alembic Inside the `api` Container
After rebuilding the image so `alembic/` and `alembic.ini` are inside the container (`docker compose up --build -d`):

```powershell
docker exec -it myapp-api alembic upgrade head
```

> **Tip:** Remember that your local Windows PostgreSQL (`localhost:5432`) and Docker PostgreSQL (`localhost:5433` / `db:5432`) are **separate databases**. Always check which one `DATABASE_URL` targets before running `upgrade`, `downgrade`, or `stamp`.

---

## Scenario 7: Reviewing Autogenerated Migrations Before Upgrading

`--autogenerate` is a helper, not magic. Always open the generated script in `alembic/versions/` before running `alembic upgrade head` because autogenerate:
* May miss column renames (it often sees a rename as a drop + add).
* May detect extra index/constraint differences if your table was originally created by hand rather than via SQLAlchemy.
* Needs explicit backfill SQL when adding `NOT NULL` columns to populated tables.

---

## Quick Command Cheat Sheet

| Command | What It Does |
| :--- | :--- |
| `alembic current` | Shows the current migration revision applied to the database |
| `alembic history` | Lists all migration revisions and how they link together |
| `alembic heads` | Shows the latest revision(s) in `alembic/versions/` |
| `alembic revision --autogenerate -m "msg"` | Creates a new migration file by comparing models to the DB |
| `alembic upgrade head` | Applies all pending migrations up to the latest version |
| `alembic downgrade -1` | Reverts the most recently applied migration |
| `alembic downgrade <rev_id>` | Moves to a specific revision ID |
| `alembic stamp head` | Marks the database as being at `head` without running SQL |