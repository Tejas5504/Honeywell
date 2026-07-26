"""
Dashboard API endpoints.
Provides aggregated statistics, chart data, and analytics
using MongoDB aggregation pipelines.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from typing import List
from app.database import get_db
from app.models.schemas import (
    DashboardStats, ThreatTrendEntry, AttackDistribution,
    RiskBucket, HeatmapCell, WorldMapEntry
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db=Depends(get_db)):
    """Get aggregate statistics for the dashboard cards."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Total unique entities
    total_users = len(await db.access_logs.distinct("entity_id"))

    # Active sessions (logs in the last hour)
    one_hour_ago = now - timedelta(hours=1)
    active_sessions = await db.access_logs.count_documents(
        {"timestamp": {"$gte": one_hour_ago}}
    )

    # Threats today
    threats_today = await db.alerts.count_documents(
        {"timestamp": {"$gte": today_start}}
    )

    # Critical alerts (risk_score >= 75)
    critical_alerts = await db.alerts.count_documents(
        {"severity": "critical"}
    )

    # Average risk score
    pipeline = [{"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}]
    result = await db.alerts.aggregate(pipeline).to_list(1)
    avg_risk_score = round(result[0]["avg"], 1) if result and result[0].get("avg") else 0

    return DashboardStats(
        total_users=total_users or 0,
        active_sessions=active_sessions or 0,
        threats_today=threats_today or 0,
        critical_alerts=critical_alerts or 0,
        avg_risk_score=avg_risk_score,
    )


@router.get("/threat-trend", response_model=List[ThreatTrendEntry])
async def get_threat_trend(db=Depends(get_db)):
    """Get threat count by day for the last 30 days."""
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)

    pipeline = [
        {"$match": {"timestamp": {"$gte": thirty_days_ago}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}
                },
                "count": {"$sum": 1},
                "critical": {
                    "$sum": {"$cond": [{"$eq": ["$severity", "critical"]}, 1, 0]}
                },
                "high": {
                    "$sum": {"$cond": [{"$eq": ["$severity", "high"]}, 1, 0]}
                },
                "medium": {
                    "$sum": {"$cond": [{"$eq": ["$severity", "medium"]}, 1, 0]}
                },
                "low": {
                    "$sum": {"$cond": [{"$eq": ["$severity", "low"]}, 1, 0]}
                },
            }
        },
        {"$sort": {"_id": 1}},
    ]
    results = await db.alerts.aggregate(pipeline).to_list(31)

    return [
        ThreatTrendEntry(
            date=r["_id"],
            count=r["count"],
            critical=r.get("critical", 0),
            high=r.get("high", 0),
            medium=r.get("medium", 0),
            low=r.get("low", 0),
        )
        for r in results
    ]


@router.get("/attack-distribution", response_model=List[AttackDistribution])
async def get_attack_distribution(db=Depends(get_db)):
    """Get distribution of alerts by attack type for pie chart."""
    pipeline = [
        {"$group": {"_id": "$attack_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    results = await db.alerts.aggregate(pipeline).to_list(20)
    total = sum(r["count"] for r in results) or 1

    return [
        AttackDistribution(
            attack_type=r["_id"] or "unknown",
            count=r["count"],
            percentage=round(r["count"] / total * 100, 1),
        )
        for r in results
    ]


@router.get("/risk-distribution", response_model=List[RiskBucket])
async def get_risk_distribution(db=Depends(get_db)):
    """Get histogram of risk scores in buckets."""
    buckets = [
        {"label": "Low (0-25)", "min": 0, "max": 25},
        {"label": "Medium (25-50)", "min": 25, "max": 50},
        {"label": "High (50-75)", "min": 50, "max": 75},
        {"label": "Critical (75-100)", "min": 75, "max": 101},
    ]

    result = []
    for b in buckets:
        count = await db.alerts.count_documents(
            {"risk_score": {"$gte": b["min"], "$lt": b["max"]}}
        )
        result.append(
            RiskBucket(
                range=b["label"],
                count=count,
                min_score=b["min"],
                max_score=min(b["max"], 100),
            )
        )
    return result


@router.get("/login-heatmap", response_model=List[HeatmapCell])
async def get_login_heatmap(db=Depends(get_db)):
    """Get login counts grouped by day-of-week × hour for heatmap."""
    pipeline = [
        {
            "$group": {
                "_id": {
                    "day": {"$dayOfWeek": "$timestamp"},  # 1=Sun … 7=Sat
                    "hour": {"$hour": "$timestamp"},
                },
                "count": {"$sum": 1},
            }
        }
    ]
    results = await db.access_logs.aggregate(pipeline).to_list(200)

    return [
        HeatmapCell(
            day=(r["_id"]["day"] - 2) % 7,  # Convert to 0=Mon ... 6=Sun
            hour=r["_id"]["hour"],
            count=r["count"],
        )
        for r in results
    ]


@router.get("/world-map", response_model=List[WorldMapEntry])
async def get_world_map(db=Depends(get_db)):
    """Get geographic distribution of logins for world map (city-level resolution)."""
    pipeline = [
        {
            "$group": {
                "_id": {
                    "country": "$geo_location.country",
                    "city": "$geo_location.city"
                },
                "count": {"$sum": 1},
                "lat": {"$first": "$geo_location.lat"},
                "lon": {"$first": "$geo_location.lon"},
            }
        },
        {"$sort": {"count": -1}},
    ]
    results = await db.access_logs.aggregate(pipeline).to_list(100)

    return [
        WorldMapEntry(
            country=f"{r['_id'].get('city', 'Unknown')}, {r['_id'].get('country', 'Unknown')}",
            count=r["count"],
            lat=r.get("lat", 0),
            lon=r.get("lon", 0),
            city=r["_id"].get("city"),
        )
        for r in results if r.get("lat") and r.get("lon")
    ]
