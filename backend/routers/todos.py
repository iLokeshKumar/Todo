from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..models import Todo, TodoCreate, TodoRead, TodoUpdate, User
from ..auth import get_current_user

router = APIRouter(
    prefix="/todos",
    tags=["todos"],
)

@router.post("/", response_model=TodoRead)
def create_todo(todo: TodoCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_todo = Todo.from_orm(todo)
    db_todo.owner_id = current_user.id
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

@router.get("/", response_model=List[TodoRead])
def read_todos(skip: int = 0, limit: int = 100, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Todo).where(Todo.owner_id == current_user.id).offset(skip).limit(limit)
    todos = session.exec(statement).all()
    return todos

@router.get("/{todo_id}", response_model=TodoRead)
def read_todo(todo_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Todo).where(Todo.id == todo_id).where(Todo.owner_id == current_user.id)
    todo = session.exec(statement).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.patch("/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, todo: TodoUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Todo).where(Todo.id == todo_id).where(Todo.owner_id == current_user.id)
    db_todo = session.exec(statement).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    todo_data = todo.dict(exclude_unset=True)
    for key, value in todo_data.items():
        setattr(db_todo, key, value)
    
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

@router.delete("/{todo_id}")
def delete_todo(todo_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Todo).where(Todo.id == todo_id).where(Todo.owner_id == current_user.id)
    todo = session.exec(statement).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    session.delete(todo)
    session.commit()
    return {"ok": True}
