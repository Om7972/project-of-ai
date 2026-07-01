from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, inspect
from app.core.config import settings
from app.models.models import Base
import logging

logger = logging.getLogger(__name__)

_engine_kwargs = {"echo": settings.DEBUG, "pool_pre_ping": True}
if not settings.DATABASE_URL.startswith("sqlite"):
    _engine_kwargs.update(pool_size=10, max_overflow=20)

engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Columns to add when upgrading from v1 schema
_MIGRATIONS = {
    "patients": {
        "patient_uid": "VARCHAR(36)",
    },
    "predictions": {
        "user_id": "INTEGER",
        "explain_json": "TEXT",
        "model_version": "VARCHAR(64) DEFAULT 'v1.0'",
    },
}


def _migrate_schema_sync(connection):
    """Add missing columns/tables for v2 schema on existing databases."""
    inspector = inspect(connection)
    existing_tables = inspector.get_table_names()

    for table, columns in _MIGRATIONS.items():
        if table not in existing_tables:
            continue
        existing_cols = {c["name"] for c in inspector.get_columns(table)}
        for col_name, col_type in columns.items():
            if col_name not in existing_cols:
                try:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))
                    logger.info("Added column %s.%s", table, col_name)
                except Exception as e:
                    logger.warning("Could not add %s.%s: %s", table, col_name, e)

    # Backfill patient_uid for rows missing it
    if "patients" in existing_tables:
        try:
            import uuid
            rows = connection.execute(
                text("SELECT id FROM patients WHERE patient_uid IS NULL OR patient_uid = ''")
            ).fetchall()
            for (pid,) in rows:
                connection.execute(
                    text("UPDATE patients SET patient_uid = :uid WHERE id = :id"),
                    {"uid": str(uuid.uuid4()), "id": pid},
                )
            if rows:
                logger.info("Backfilled patient_uid for %d patients", len(rows))
        except Exception as e:
            logger.warning("patient_uid backfill skipped: %s", e)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_migrate_schema_sync)
