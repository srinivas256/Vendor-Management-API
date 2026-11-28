from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


def auth_response(user: models.User) -> schemas.AuthResponse:
    return schemas.AuthResponse(
        access_token=create_access_token(user.id),
        user=user,
    )


@router.post("/register", response_model=schemas.AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    existing_user = db.execute(
        select(models.User).where(models.User.email == email)
    ).scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")

    user = models.User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
        location=payload.location,
        skills=payload.skills if payload.role == "labor" else None,
        experience_years=payload.experience_years if payload.role == "labor" else 0,
    )
    db.add(user)
    try:
        db.flush()
        access_token = create_access_token(user.id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        ) from None
    db.refresh(user)
    return schemas.AuthResponse(access_token=access_token, user=user)


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    user = db.execute(
        select(models.User).where(models.User.email == email)
    ).scalar_one_or_none()
    if (
        user is None
        or user.password_hash is None
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_response(user)


@router.get("/me", response_model=schemas.UserProfile)
def read_current_user(user: models.User = Depends(get_current_user)):
    return user
