from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints, field_validator


Role = Literal["labor", "vendor"]
Password = Annotated[str, StringConstraints(min_length=8, max_length=128)]


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: Password
    role: Role
    phone: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=120)
    skills: str | None = Field(default=None, max_length=500)
    experience_years: int = Field(default=0, ge=0, le=80)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Name cannot be blank")
        return value.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: Password


class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    role: Role
    location: str | None
    skills: str | None
    experience_years: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class LaborerResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    location: str | None
    skills: str | None
    experience_years: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)