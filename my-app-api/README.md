# MyApp Backend (FastAPI + PostgreSQL)

A beginner-friendly guide to setting up and running this FastAPI backend and PostgreSQL database on **Windows 11**, whether you are new to Python, PostgreSQL, or Docker.

---

## What Is Included in This Project?

* **FastAPI (`main.py` & `app/`):** A fast Python web framework used to build API endpoints and interactive documentation (`/docs`).
* **PostgreSQL (`myapp` database & `users` table):** A relational database used to store application data permanently.
* **SQLAlchemy + `psycopg`:** Python libraries that let your FastAPI code talk to PostgreSQL without writing raw SQL for every operation.
* **Docker & Docker Compose (`Dockerfile` & `docker-compose.yml`):** Tools that package and run your API and database together inside isolated containers.

---

## Project Structure

```text
my-app-api/
├── .env
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── main.py
└── app/
    ├── __init__.py
    ├── database.py
    ├── models.py
    ├── schemas.py
    └── routers/
        ├── __init__.py
        └── users.py
```

---

## Prerequisites (For Beginners)

1. **Python 3.13+ (for running locally without Docker):** Download from [python.org](https://www.python.org/downloads/windows/) and check **"Add python.exe to PATH"** during installation.
2. **PostgreSQL (for running locally without Docker):** Installed on Windows 11 and running as a background service on port `5432`.
3. **Docker Desktop (for running with Docker):** Installed and **running** in the background (check that the Docker whale icon in the Windows system tray is active).

---

## Option 1: Run With Docker (Recommended)

Docker runs both the PostgreSQL database (`myapp`) and the FastAPI app together in containers so you don't have to manage local database conflicts.

### Step 1: Configure Your Database Password
Copy `.env.example` to `.env`, then set `POSTGRES_PASSWORD` to a strong URL-safe password. Use that same password in `DATABASE_URL`. Keep `.env` private; it is excluded from Git.
Also set `JWT_SECRET_KEY` to a private random value of at least 32 characters. Generate one with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.

```powershell
Copy-Item .env.example .env
```

Inside Docker, the API connects to PostgreSQL using `db` as the hostname. On your Windows host machine, the database is available on port `5432`. If you already have a `pgdata` volume, keep its existing database password or change the PostgreSQL role password before changing `.env`.

### Step 2: Build and Start the Containers
Open **PowerShell** in your project folder (`D:\Python\my-app-api`) and run:

```powershell
docker compose up --build -d
```

* `-d` runs the containers in the background (**detached mode**).
* `--build` builds the FastAPI image from the `Dockerfile`.

### Step 3: Apply Database Migrations
Run this command to create or update the tables in the containerized `myapp` database:

```powershell
docker exec myapp-api python -m alembic upgrade head
```

### Step 4: Check Status and Open the API Docs
Check that both containers are running:

```powershell
docker compose ps
```

Open your browser and go to:
* **Interactive API Docs (Swagger UI):** `http://127.0.0.1:8000/docs`
* **Root Endpoint:** `http://127.0.0.1:8000/`

In `/docs`, you can click **Try it out** on `POST /users/` to add a user and `GET /users/` to view saved users.

### Start the Worklink React App
The sibling `D:\Python\labor-connect` project provides laborer and vendor registration, login, and dashboards. After the API and database are running and migrations have been applied:

```powershell
Set-Location D:\Python\labor-connect
npm.cmd install
npm.cmd run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Register as a laborer to create a discoverable worker profile, or as a vendor to search profiles and contact workers. Only authenticated vendor accounts can access the labor directory. The API requires `JWT_SECRET_KEY` in `.env` for registration and login.

### Helpful Docker Commands
* **View live API logs:** `docker compose logs -f api` (press `Ctrl + C` to exit)
* **Stop containers (keeps database data):** `docker compose down`
* **Stop containers and delete database data volume:** `docker compose down -v`

---

## Option 2: Run Locally on Windows 11 (Without Docker)

Use this option if you want to run Python directly on Windows 11 and connect to your local PostgreSQL installation (`localhost:5432`).

### Step 1: Create the Database in PostgreSQL
Open `psql` in Command Prompt (make sure PostgreSQL's `bin` folder is in your Windows `PATH`, e.g., `C:\Program Files\PostgreSQL\17\bin`) and run:

```sql
CREATE DATABASE myapp;
```

### Step 2: Create and Activate a Virtual Environment
A virtual environment keeps this project's Python packages separate from other projects. In PowerShell inside `D:\Python\my-app-api`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

You should see `(.venv)` at the start of your prompt.

### Step 3: Install Required Python Packages
With `(.venv)` active, install the dependencies:

```powershell
pip install -r requirements.txt
```

### Step 4: Create a `.env` File
Create a `.env` file in the root project folder (`D:\Python\my-app-api\.env`) and set your local connection string:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/myapp
```

*(If your password has special characters like `@`, `:`, `/`, `?`, or `#`, URL-encode them—for example, `@` becomes `%40`.)*

### Step 5: Apply Database Migrations
With `(.venv)` active, create or update the database tables:

```powershell
python -m alembic upgrade head
```

### Step 6: Start the FastAPI Development Server
With `(.venv)` active, run:

```powershell
fastapi dev main.py
```

*(Fallback if `fastapi` is not recognized in PowerShell: `python -m uvicorn main:app --reload`)*

Then open **`http://127.0.0.1:8000/docs`** in your browser to test the endpoints.

---

## Troubleshooting Quick Reference

* **`fastapi` is not recognized:** Make sure `.venv` is activated (`.\.venv\Scripts\Activate.ps1`) and `fastapi[standard]` is installed, or run `python -m uvicorn main:app --reload`.
* **Docker pipe / daemon error (`dockerDesktopLinuxEngine`):** Open **Docker Desktop** and wait until it finishes starting before running `docker` or `docker compose` commands.
* **Tables not showing in DBeaver:** Make sure you expanded the **`myapp`** database (not `postgres`), navigated to **Schemas > `public` > Tables**, and pressed **F5** (Refresh).

docker compose up -d
docker compose ps