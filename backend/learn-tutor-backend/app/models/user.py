from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ── Register ──
class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    provider: str = "email"  # email, phone, google


# ── Login ──
class UserLogin(BaseModel):
    identifier: str  # email or phone or username
    password: str


# ── Google Sign-in ──
class GoogleSignIn(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = ""


# ── Profile Update ──
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


# ── Response ──
class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = ""
    provider: str = "email"
    created_at: datetime


# ── Token ──
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
