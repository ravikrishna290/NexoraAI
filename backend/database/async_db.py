"""
Async Database Session & Connection Manager using SQLAlchemy 2.0.
"""

import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from backend.database.models import Base
from backend.utils.logger import logger

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./nexora_enterprise.db")

# Create Async Engine with Connection Pooling
if "sqlite" in DATABASE_URL:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def init_db():
    """Initialize database tables asynchronously."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("[AsyncDB] Initialized database schemas cleanly.")

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing AsyncSession to FastAPI routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()
