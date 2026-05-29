from pydantic import BaseModel
from typing import Optional, Generic, TypeVar
from uuid import UUID
from datetime import datetime

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    total: int
    page: int
    total_pages: int


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: datetime
    user: UserResponse


class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = 'pending'


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ItemResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}


class MessageResponse(BaseModel):
    message: str
