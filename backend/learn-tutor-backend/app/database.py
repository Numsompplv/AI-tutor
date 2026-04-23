from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi

client = AsyncIOMotorClient(
    settings.mongodb_url,
    tls=True,
    tlsCAFile=certifi.where(),
)
db = client[settings.db_name]

# Collections
users_collection = db["users"]
notebooks_collection = db["notebooks"]
documents_collection = db["documents"]
conversations_collection = db["conversations"]
progress_collection = db["progress"]


async def init_db():
    """Create indexes on startup."""
    try:
        await users_collection.drop_indexes()
        await users_collection.create_index("email", unique=True, sparse=True)
        await users_collection.create_index("phone", unique=True, sparse=True)
        await users_collection.create_index("username", unique=True)
        await notebooks_collection.create_index("user_id")
        await conversations_collection.create_index("user_id")
        await conversations_collection.create_index("notebook_id")
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database init warning: {e}")