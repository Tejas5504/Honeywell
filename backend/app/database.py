"""
Async MongoDB connection manager using Motor.
Provides database and collection accessors.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings


class DatabaseManager:
    """Manages async MongoDB connection lifecycle."""
    
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    
    async def connect(self):
        """Initialize Motor client and database reference safely."""
        mongo_uri = settings.mongo_connection_string
        try:
            print(f"[INFO] Connecting to MongoDB...")
            self.client = AsyncIOMotorClient(
                mongo_uri,
                maxPoolSize=50,
                minPoolSize=10,
                serverSelectionTimeoutMS=5000,
            )
            self.db = self.client[settings.MONGODB_DB_NAME]
            
            # Create indexes for optimal query performance
            await self._create_indexes()
            print(f"[OK] Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        except Exception as err:
            print(f"[WARNING] MongoDB connection failed: {err}")
            print("[INFO] Server will continue running, but DB operations will fail until valid MONGODB_URL is provided.")
    
    async def _create_indexes(self):
        """Create database indexes for performance."""
        if self.db is None:
            return
        # Access logs indexes
        await self.db.access_logs.create_index([("entity_id", 1), ("timestamp", -1)])
        await self.db.access_logs.create_index([("timestamp", -1)])
        await self.db.access_logs.create_index([("label", 1)])
        await self.db.access_logs.create_index([("source_ip", 1)])
        
        # Alerts indexes
        await self.db.alerts.create_index([("entity_id", 1), ("timestamp", -1)])
        await self.db.alerts.create_index([("risk_score", -1)])
        await self.db.alerts.create_index([("status", 1)])
        await self.db.alerts.create_index([("attack_type", 1)])
        await self.db.alerts.create_index([("timestamp", -1)])
        
        # Entity profiles index
        await self.db.entity_profiles.create_index([("entity_id", 1)], unique=True)
        
        # Model metrics index
        await self.db.model_metrics.create_index([("trained_at", -1)])
    
    async def disconnect(self):
        """Close the Motor client."""
        if self.client:
            self.client.close()
            print("[OK] Disconnected from MongoDB")
    
    def get_collection(self, name: str):
        """Get a specific collection reference."""
        if self.db is None:
            raise RuntimeError("Database connection not established. Check MONGODB_URL environment variable.")
        return self.db[name]


# Singleton database manager
db_manager = DatabaseManager()


async def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency to get database reference."""
    return db_manager.db
