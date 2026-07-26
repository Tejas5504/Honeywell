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
        """Initialize Motor client and database reference."""
        self.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=5000,
        )
        self.db = self.client[settings.MONGODB_DB_NAME]
        
        # Create indexes for optimal query performance
        await self._create_indexes()
        print(f"[OK] Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    
    async def _create_indexes(self):
        """Create database indexes for performance."""
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
        return self.db[name]


# Singleton database manager
db_manager = DatabaseManager()


async def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency to get database reference."""
    return db_manager.db
