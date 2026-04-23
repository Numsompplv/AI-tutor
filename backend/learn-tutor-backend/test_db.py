import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

async def test():
    url = os.getenv("MONGODB_URL")
    client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000)
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected successfully!")
        db = client[os.getenv("DB_NAME", "learntutor")]
        print(f"✅ Database: {db.name}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
    finally:
        client.close()

asyncio.run(test())