import psycopg
from fastapi import APIRouter, HTTPException

from app.db import get_connection

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.get("/health/ready")
def readiness_check():
    try:
        with get_connection() as connection:
            connection.execute("SELECT 1")
    except psycopg.Error as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ready"}
