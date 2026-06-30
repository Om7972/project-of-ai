import os
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

os.environ["REDIS_ENABLED"] = "false"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["DATABASE_URL_SYNC"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-minimum-32-chars"


@pytest_asyncio.fixture
async def client():
    from app.db.database import init_db
    await init_db()

    from app.main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
