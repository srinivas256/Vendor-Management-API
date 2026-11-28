import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from . import models
from .database import get_db

password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)
ACCESS_TOKEN_LIFETIME = timedelta(hours=12)


def get_jwt_secret() -> str:
    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY must be configured before authentication can be used.")
    if len(secret_key) < 32:
        raise RuntimeError("JWT_SECRET_KEY must contain at least 32 characters.")
    return secret_key


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": str(user_id), "iat": now, "exp": now + ACCESS_TOKEN_LIFETIME},
        get_jwt_secret(),
        algorithm="HS256",
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    try:
        payload = jwt.decode(credentials.credentials, get_jwt_secret(), algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise unauthorized from None

    user = db.get(models.User, user_id)
    if user is None or user.password_hash is None:
        raise unauthorized
    return user


def require_vendor(
    user: models.User = Depends(get_current_user),
) -> models.User:
    if user.role != "vendor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vendor access required",
        )
    return user
