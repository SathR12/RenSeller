from fastapi import FastAPI
from .db import get_connection
from app.api.health import router as health_router

app = FastAPI(title="RenSeller API")

@app.get("/")
def home():
    return {"message": "backend works"}

@app.get("/database-test")
def test():
    try:
        conn = get_connection()

        cursor = conn.cursor()
        cursor.execute("SELECT NOW();")
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        return {
            "message": "Database connected!",
            "database_time": result[0]
        }

    except Exception as e:
        return {
            "error": str(e)
        }

app.include_router(health_router)