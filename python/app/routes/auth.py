from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from ..database import get_db
from ..models import User
from ..schemas import (
    RegisterRequest, LoginRequest, UpdateProfileRequest,
    AuthResponse, UserResponse, MessageResponse
)
from ..middleware import get_current_user
from ..config import settings

from passlib.context import CryptContext
from jose import jwt
from uuid import UUID

router = APIRouter(prefix='/auth', tags=['auth'])
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def create_token(user: User) -> str:
    payload = {
        'id': str(user.id),
        'email': user.email,
        'exp': datetime.now(timezone.utc).timestamp() + settings.JWT_EXPIRES_IN
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post('/register', response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail='Senha deve ter no mínimo 6 caracteres')

    exists = db.query(User).filter(User.email == data.email).first()
    if exists:
        raise HTTPException(status_code=409, detail='Email já cadastrado')

    hashed = pwd_context.hash(data.password)
    user = User(name=data.name, email=data.email, password=hashed, phone=data.phone)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user)
    return AuthResponse(token=token, user=UserResponse.model_validate(user))


@router.post('/login', response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=401, detail='Credenciais inválidas')

    token = create_token(user)
    return AuthResponse(token=token, user=UserResponse.model_validate(user))


@router.get('/me', response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put('/me', response_model=UserResponse)
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.avatar is not None:
        current_user.avatar = data.avatar
    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
