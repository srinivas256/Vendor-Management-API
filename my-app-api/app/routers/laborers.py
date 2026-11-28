from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import require_vendor

router = APIRouter(prefix="/laborers", tags=["Laborers"])


@router.get("/", response_model=list[schemas.LaborerResponse])
def list_laborers(
    search: str | None = Query(default=None, max_length=120),
    location: str | None = Query(default=None, max_length=120),
    skill: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _vendor: models.User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    stmt = select(models.User).where(models.User.role == "labor")
    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            models.User.name.ilike(term)
            | models.User.skills.ilike(term)
            | models.User.location.ilike(term)
        )
    if location:
        stmt = stmt.where(models.User.location.ilike(f"%{location.strip()}%"))
    if skill:
        stmt = stmt.where(models.User.skills.ilike(f"%{skill.strip()}%"))

    stmt = stmt.order_by(models.User.name, models.User.id).offset(offset).limit(limit)
    return db.execute(stmt).scalars().all()
