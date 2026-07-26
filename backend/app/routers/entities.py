"""
Entity profile API endpoints.
Provides entity listing, profile details, historical logs,
alerts, and risk history for behavioral analysis.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.database import get_db
from app.utils.helpers import serialize_doc, serialize_docs

router = APIRouter(prefix="/api/v1/entities", tags=["Entities"])


@router.get("/")
async def get_entities(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db=Depends(get_db),
):
    """List entity profiles with optional search filter."""
    query = {}
    if search:
        query["$or"] = [
            {"entity_id": {"$regex": search, "$options": "i"}},
            {"entity_type": {"$regex": search, "$options": "i"}},
        ]

    total = await db.entity_profiles.count_documents(query)
    skip = (page - 1) * page_size
    cursor = db.entity_profiles.find(query).skip(skip).limit(page_size)
    items = await cursor.to_list(length=page_size)

    return {
        "entities": [serialize_doc(i) for i in items],
        "total": total,
    }


@router.get("/{entity_id}")
async def get_entity(entity_id: str, db=Depends(get_db)):
    """Get full entity profile by entity_id."""
    doc = await db.entity_profiles.find_one({"entity_id": entity_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Entity not found")
    return serialize_doc(doc)


@router.get("/{entity_id}/logs")
async def get_entity_logs(
    entity_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db=Depends(get_db),
):
    """Get paginated access logs for a specific entity."""
    skip = (page - 1) * page_size
    cursor = (
        db.access_logs.find({"entity_id": entity_id})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(page_size)
    )
    items = await cursor.to_list(length=page_size)
    total = await db.access_logs.count_documents({"entity_id": entity_id})

    return {
        "logs": serialize_docs(items),
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{entity_id}/alerts")
async def get_entity_alerts(entity_id: str, db=Depends(get_db)):
    """Get all alerts for a specific entity."""
    cursor = (
        db.alerts.find({"entity_id": entity_id})
        .sort("timestamp", -1)
        .limit(100)
    )
    items = await cursor.to_list(length=100)
    return serialize_docs(items)


@router.get("/{entity_id}/risk-history")
async def get_entity_risk_history(entity_id: str, db=Depends(get_db)):
    """Get risk score history for an entity."""
    doc = await db.entity_profiles.find_one({"entity_id": entity_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Entity not found")
    return doc.get("risk_history", [])
