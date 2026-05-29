from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import secrets

from ..database import get_db
from ..models import User, RefreshToken
from ..schemas import (
    RegisterRequest, LoginRequest, RefreshRequest, UpdateProfileRequest,
    AuthResponse, UserResponse, MessageResponse
)
from ..middleware import get_current_user
from ..config import settings

from passlib.context import CryptContext
from jose import jwt

router = APIRouter(prefix='/auth', tags=['auth'])
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

ACCESS_EXPIRE_MINUTES = 15
REFRESH_EXPIRE_DAYS = 7


def create_access_token(user: User) -> str:
    payload = {
        'id': str(user.id),
        'email': user.email,
        'type': 'access',
        'exp': datetime.now(timezone.utc).timestamp() + ACCESS_EXPIRE_MINUTES * 60
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user: User, db: Session) -> tuple[str, datetime]:
    raw = secrets.token_hex(40)
    token_hash = pwd_context.hash(raw)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)

    rt = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.add(rt)
    db.commit()

    return raw, expires_at


def build_auth_response(user: User, db: Session) -> AuthResponse:
    access_token = create_access_token(user)
    refresh_token, expires_at = create_refresh_token(user, db)
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=expires_at,
        user=UserResponse.model_validate(user)
    )


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

    return build_auth_response(user, db)


@router.post('/login', response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=401, detail='Credenciais inválidas')

    return build_auth_response(user, db)


@router.post('/refresh', response_model=AuthResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    tokens = db.query(RefreshToken).filter(
        RefreshToken.revoked == False
    ).order_by(RefreshToken.created_at.desc()).all()

    matched = None
    now = datetime.now(timezone.utc)
    for t in tokens:
        if t.expires_at < now:
            t.revoked = True
            db.add(t)
            continue
        if pwd_context.verify(data.refresh_token, t.token_hash):
            matched = t
            break

    db.commit()

    if not matched:
        raise HTTPException(status_code=401, detail='Refresh token inválido ou expirado')

    matched.revoked = True
    db.add(matched)
    db.commit()

    user = db.query(User).filter(User.id == matched.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')

    return build_auth_response(user, db)


@router.post('/logout', response_model=MessageResponse)
def logout(data: RefreshRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tokens = db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.revoked == False
    ).all()

    for t in tokens:
        if pwd_context.verify(data.refresh_token, t.token_hash):
            t.revoked = True
            db.add(t)
            break

    db.commit()
    return MessageResponse(message='Logout realizado')


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
