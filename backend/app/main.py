from fastapi import FastAPI
from .db import get_connection
from app.api.health import router as health_router

app = FastAPI(title="RenSeller API")

@app.get("/")
def home():
    return {"message": "backend works"}

@app.get("/database-test")
def test():
    return {"message": "Will test this next time"}

app.include_router(health_router)