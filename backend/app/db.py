import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_connection():
    # An empty URL uses libpq's PG* environment variables (set by Compose).
    return psycopg.connect(DATABASE_URL, connect_timeout=3)