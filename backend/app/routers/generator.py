"""
Data generation API endpoints.
Allows users to generate synthetic access logs with configurable
attack type injection, record counts, and live scenario injection.
"""
import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.services.data_generator import (
    generate_synthetic_data, _generate_brute_force,
    _generate_impossible_travel, _generate_lateral_movement,
    _generate_low_and_slow, _create_entity_profiles
)
from app.services.ml_pipeline import predict_anomalies

router = APIRouter(prefix="/api/v1/generator", tags=["Generator"])


@router.post("/generate")
async def generate_data(request: dict, db=Depends(get_db)):
    """
    Generate synthetic access logs with injected attack scenarios.
    """
    count = request.get("count", 10000)
    attack_types = request.get("attack_types", [
        "brute_force", "impossible_travel", "credential_stuffing",
        "device_spoofing", "lateral_movement",
        "low_and_slow_exfiltration", "insider_drift",
    ])

    result = await generate_synthetic_data(db, count, attack_types)
    return result


@router.post("/inject-scenario")
async def inject_attack_scenario(request: dict, db=Depends(get_db)):
    """
    Inject a live cyber attack scenario into access_logs and run prediction instantly.
    Scenarios: brute_force, impossible_travel, lateral_movement, low_and_slow
    """
    scenario = request.get("scenario", "brute_force")
    now = datetime.now(timezone.utc)

    # Fetch existing entities or fallback
    entities = await db.entity_profiles.find({}).to_list(length=50)
    if not entities:
        entities = _create_entity_profiles(10)

    target_entity = random.choice(entities)
    injected_logs = []

    if scenario == "brute_force":
        injected_logs = _generate_brute_force(target_entity, now)
    elif scenario == "impossible_travel":
        injected_logs = _generate_impossible_travel(target_entity, now)
    elif scenario == "lateral_movement":
        injected_logs = _generate_lateral_movement(target_entity, now)
    elif scenario == "low_and_slow":
        injected_logs = _generate_low_and_slow(target_entity, now)
    else:
        injected_logs = _generate_brute_force(target_entity, now)

    if injected_logs:
        await db.access_logs.insert_many(injected_logs)
        # Automatically run prediction pipeline so alert appears on dashboard
        await predict_anomalies(db)

    return {
        "status": "success",
        "scenario": scenario,
        "entity_target": target_entity.get("entity_id"),
        "logs_injected": len(injected_logs),
        "message": f"Injected {len(injected_logs)} logs for scenario '{scenario}' targeting {target_entity.get('entity_id')}"
    }


@router.get("/status")
async def get_generator_status(db=Depends(get_db)):
    """Get current dataset statistics from the database."""
    logs = await db.access_logs.count_documents({})
    alerts = await db.alerts.count_documents({})
    entities = await db.entity_profiles.count_documents({})

    pipeline = [
        {"$match": {"label": {"$ne": "normal"}}},
        {"$group": {"_id": "$label", "count": {"$sum": 1}}},
    ]
    attack_stats = await db.access_logs.aggregate(pipeline).to_list(20)
    attack_breakdown = {r["_id"]: r["count"] for r in attack_stats}

    return {
        "access_logs_count": logs,
        "alerts_count": alerts,
        "entities_count": entities,
        "attack_breakdown": attack_breakdown,
    }
