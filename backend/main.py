from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .routers import auth, todos, users

app = FastAPI(title="Todo App")

# Allow specific origins for development
origins = [
    "http://localhost:8081",
    "http://192.168.0.26:8081",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Todo App"}
