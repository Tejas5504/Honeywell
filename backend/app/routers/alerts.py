"""
Alerts API endpoints.
Provides CRUD operations, filtering, pagination, and search
for anomaly detection alerts.
"""
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional

from app.database import get_db
from app.models.schemas import AlertsListResponse, AlertResponse, AlertStatusUpdate
from app.utils.helpers import serialize_doc, paginate_params

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])


@router.get("/")
async def get_alerts(
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    attack_type: Optional[str] = None,
    min_risk: Optional[float] = None,
    max_risk: Optional[float] = None,
    country: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    distinct_entities: bool = Query(False),
):
    """
    Get paginated alerts with filtering by attack type, risk score,
    country, status, date range, and search by entity_id/IP/device.
    Supports distinct_entities=True to return 1 alert per entity for cleaner dashboards.
    """
    query = {}

    # Search filter — matches entity_id, source_ip, or device_fingerprint
    if search:
        query["$or"] = [
            {"entity_id": {"$regex": search, "$options": "i"}},
            {"source_ip": {"$regex": search, "$options": "i"}},
            {"device_fingerprint": {"$regex": search, "$options": "i"}},
        ]

    if attack_type:
        query["attack_type"] = attack_type

    if min_risk is not None or max_risk is not None:
        risk_filter = {}
        if min_risk is not None:
            risk_filter["$gte"] = min_risk
        if max_risk is not None:
            risk_filter["$lte"] = max_risk
        query["risk_score"] = risk_filter

    if country:
        query["geo_location.country"] = country

    if status:
        query["status"] = status

    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            date_filter["$lte"] = datetime.fromisoformat(end_date)
        if date_filter:
            query["timestamp"] = date_filter

    skip, limit = paginate_params(page, page_size)

    if distinct_entities:
        # Group by entity_id to pick the most recent high-risk alert per entity
        pipeline = []
        if query:
            pipeline.append({"$match": query})
        pipeline.extend([
            {"$sort": {"timestamp": -1}},
            {
                "$group": {
                    "_id": "$entity_id",
                    "doc": {"$first": "$$ROOT"}
                }
            },
            {"$replaceRoot": {"newRoot": "$doc"}},
            {"$sort": {"timestamp": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ])
        alerts = await db.alerts.aggregate(pipeline).to_list(length=limit)

        count_pipeline = []
        if query:
            count_pipeline.append({"$match": query})
        count_pipeline.append({"$group": {"_id": "$entity_id"}})
        unique_groups = await db.alerts.aggregate(count_pipeline).to_list(length=None)
        total = len(unique_groups)
    else:
        # Standard pagination
        total = await db.alerts.count_documents(query)
        cursor = db.alerts.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        alerts = await cursor.to_list(length=limit)

    total_pages = max(1, (total + page_size - 1) // page_size)

    return {
        "alerts": [serialize_doc(a) for a in alerts],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{alert_id}")
async def get_alert(alert_id: str, db=Depends(get_db)):
    """Get full details of a specific alert by its ID."""
    try:
        alert = await db.alerts.find_one({"_id": ObjectId(alert_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert ID format")

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    return serialize_doc(alert)


@router.patch("/{alert_id}/status")
async def update_alert_status(
    alert_id: str,
    update: AlertStatusUpdate,
    db=Depends(get_db),
):
    """Update the status of an alert (investigating, resolved, false_positive)."""
    try:
        from pymongo import ReturnDocument
        result = await db.alerts.find_one_and_update(
            {"_id": ObjectId(alert_id)},
            {"$set": {"status": update.status.value}},
            return_document=ReturnDocument.AFTER,
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert ID format")

    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")

    return serialize_doc(result)
