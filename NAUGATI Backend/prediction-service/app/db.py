import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/naugati")

_client: AsyncIOMotorClient | None = None


def get_db():
    """Lazily-created shared Motor client, reused across requests.

    Usage in a router:
        from app.db import get_db
        db = get_db()
        row = await db.ports.find_one({"unlocode": "SGSIN"})
    """
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client.get_default_database()
