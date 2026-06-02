"""
Database configuration and session management.
Uses SQLAlchemy with PostgreSQL via psycopg3.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://deepak:ZRyCaLoAMP6ZAiwWQOHuYXIuCKXP1spC@dpg-d8fhekmq1p3s73ep2ib0-a.virginia-postgres.render.com/inventory_db_02cw",
)

# Handle Render-style postgres:// URLs (SQLAlchemy requires postgresql+psycopg://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
