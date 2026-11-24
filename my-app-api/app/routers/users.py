from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[schemas.UserResponse])
def list_users(db: Session = Depends(get_db)):
    stmt = select(models.User).order_by(models.User.id)
    return db.execute(stmt).scalars().all()


@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = models.User(name=user_in.name, email=user_in.email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user