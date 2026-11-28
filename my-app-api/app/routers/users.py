from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..security import require_vendor

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[schemas.UserResponse])
def list_users(
    _vendor: models.User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    stmt = select(models.User).order_by(models.User.id)
    return db.execute(stmt).scalars().all()


@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: schemas.UserCreate,
    _vendor: models.User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    email = str(user_in.email).lower()
    existing_user = db.execute(
        select(models.User).where(models.User.email == email)
    ).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = models.User(name=user_in.name.strip(), email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user