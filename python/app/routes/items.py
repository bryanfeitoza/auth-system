from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
import math

from ..database import get_db
from ..models import Item
from ..schemas import ItemCreate, ItemUpdate, ItemResponse, MessageResponse, PaginatedResponse
from ..middleware import get_current_user
from ..models import User

router = APIRouter(prefix='/items', tags=['items'])


@router.get('/', response_model=PaginatedResponse[ItemResponse])
def list_items(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(None),
    status: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Item).filter(Item.user_id == current_user.id)

    if status:
        query = query.filter(Item.status == status)

    if search:
        query = query.filter(
            or_(
                Item.title.ilike(f'%{search}%'),
                Item.description.ilike(f'%{search}%')
            )
        )

    total = query.count()
    items = query.order_by(Item.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return PaginatedResponse(
        data=[ItemResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        total_pages=math.ceil(total / limit) if total > 0 else 0
    )


@router.post('/', response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(data: ItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = Item(user_id=current_user.id, title=data.title, description=data.description, status=data.status)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemResponse.model_validate(item)


@router.get('/{item_id}', response_model=ItemResponse)
def get_item(item_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Item não encontrado')
    return ItemResponse.model_validate(item)


@router.put('/{item_id}', response_model=ItemResponse)
def update_item(item_id: str, data: ItemUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Item não encontrado')

    if data.title is not None:
        item.title = data.title
    if data.description is not None:
        item.description = data.description
    if data.status is not None:
        item.status = data.status
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return ItemResponse.model_validate(item)


@router.delete('/{item_id}', response_model=MessageResponse)
def delete_item(item_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id, Item.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail='Item não encontrado')
    db.delete(item)
    db.commit()
    return MessageResponse(message='Item removido com sucesso')
