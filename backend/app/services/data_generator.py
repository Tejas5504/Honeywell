"""
Synthetic data generation engine using Faker + NumPy.
Generates realistic access logs with injected attack scenarios
and builds per-entity behavioral profiles.
"""
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, List

import numpy as np
from faker import Faker

from app.utils.helpers import (
    GEO_LOCATIONS, RESOURCES, SENSITIVE_RESOURCES,
    AUTH_METHODS, DEVICE_TEMPLATES, SUSPICIOUS_COMMANDS,
    haversine_distance, severity_from_risk_score,
)

fake = Faker()
Faker.seed(42)

# Predefined realistic employee names & service accounts for clean UI display
SAMPLE_USERS = [
    "alex.morgan", "sarah.connor", "david.miller", "emily.watson", "michael.chen",
    "james.wilson", "lisa.taylor", "robert.johnson", "jessica.brown", "daniel.martinez",
    "amanda.white", "christopher.harris", "ashley.clark", "matthew.louis", "hannah.davis",
    "brian.adams", "rachel.scott", "kevin.wright", "stephanie.king", "eric.baker",
    "victoria.green", "ryan.evans", "nicole.turner", "brandon.hall", "megan.nelson",
    "justin.carter", "lauren.mitchell", "dylan.perez", "samantha.roberts", "nathan.phillips",
    "service.k8s-ingress", "service.db-sync-job", "service.payment-gw", "admin.sec-ops",
    "edge.kiosk-chicago", "edge.pos-san-francisco", "edge.terminal-london"
]


def _create_entity_profiles(num_entities: int) -> List[dict]:
    """Create unique entity profiles with behavioral baselines and realistic names."""
    entities = []

    for i in range(num_entities):
        if i < len(SAMPLE_USERS):
            name = SAMPLE_USERS[i]
        else:
            name = f"{fake.first_name().lower()}.{fake.last_name().lower()}"

        if name.startswith("service."):
            e_type = "service_account"
        elif name.startswith("edge."):
            e_type = "edge_device"
        else:
            e_type = "user"

        start_hour = random.randint(6, 12)
        normal_hours = list(range(start_hour, start_hour + 8))
        locations = random.sample(GEO_LOCATIONS, k=random.randint(1, 2))

        entity = {
            "entity_id": name,
            "entity_type": e_type,
            "normal_hours": normal_hours,
            "common_devices": random.sample(DEVICE_TEMPLATES, k=random.randint(1, 3)),
            "frequent_locations": locations,
            "common_resources": random.sample(RESOURCES, k=random.randint(3, 8)),
            "common_auth_methods": random.sample(AUTH_METHODS[:4], k=random.randint(1, 2)),
            "avg_session_duration": random.randint(300, 3600),
            "total_logins": 0,
            "risk_history": [],
            "last_updated": datetime.now(timezone.utc),
        }
        entities.append(entity)
    return entities


def _generate_normal_log(entity: dict, base_time: datetime) -> dict:
    """Generate a normal access log based on entity's behavioral profile."""
    loc = random.choice(entity["frequent_locations"])
    hour = random.choice(entity["normal_hours"])
    day_offset = random.randint(0, 29)
    ts = base_time - timedelta(days=day_offset, hours=random.randint(0, 2))
    ts = ts.replace(hour=hour, minute=random.randint(0, 59))

    return {
        "entity_id": entity["entity_id"],
        "entity_type": entity["entity_type"],
        "timestamp": ts,
        "source_ip": fake.ipv4_private(),
        "geo_location": loc,
        "resource_accessed": random.choice(entity["common_resources"]),
        "auth_method": random.choice(entity["common_auth_methods"]),
        "session_duration": entity["avg_session_duration"] + random.randint(-120, 120),
        "command_sequence": [],
        "device_fingerprint": random.choice(entity["common_devices"]),
        "label": "normal",
    }


def _generate_brute_force(entity: dict, base_time: datetime) -> List[dict]:
    """Brute force: rapid failed auth attempts from same IP in short window."""
    logs = []
    ip = fake.ipv4_public()
    num_attempts = random.randint(5, 12)
    start_ts = base_time - timedelta(days=random.randint(0, 29), hours=random.randint(0, 23))

    for j in range(num_attempts):
        ts = start_ts + timedelta(seconds=random.randint(1, 5) * j)
        logs.append({
            "entity_id": entity["entity_id"],
            "entity_type": entity["entity_type"],
            "timestamp": ts,
            "source_ip": ip,
            "geo_location": random.choice(GEO_LOCATIONS),
            "resource_accessed": "/api/auth/login",
            "auth_method": "password",
            "session_duration": random.randint(1, 5),
            "command_sequence": [],
            "device_fingerprint": random.choice(DEVICE_TEMPLATES),
            "label": "brute_force",
        })
    return logs


def _generate_impossible_travel(entity: dict, base_time: datetime) -> List[dict]:
    """Impossible travel: two logins from distant countries within 30 min."""
    loc1 = entity["frequent_locations"][0]
    distant_locs = [g for g in GEO_LOCATIONS
                    if haversine_distance(loc1["lat"], loc1["lon"], g["lat"], g["lon"]) > 5000]
    loc2 = random.choice(distant_locs) if distant_locs else random.choice(GEO_LOCATIONS)

    ts1 = base_time - timedelta(days=random.randint(0, 29), hours=random.randint(0, 23))
    ts2 = ts1 + timedelta(minutes=random.randint(5, 25))

    return [
        {
            "entity_id": entity["entity_id"],
            "entity_type": entity["entity_type"],
            "timestamp": ts1,
            "source_ip": fake.ipv4_public(),
            "geo_location": loc1,
            "resource_accessed": random.choice(entity["common_resources"]),
            "auth_method": random.choice(entity["common_auth_methods"]),
            "session_duration": random.randint(60, 300),
            "command_sequence": [],
            "device_fingerprint": random.choice(entity["common_devices"]),
            "label": "impossible_travel",
        },
        {
            "entity_id": entity["entity_id"],
            "entity_type": entity["entity_type"],
            "timestamp": ts2,
            "source_ip": fake.ipv4_public(),
            "geo_location": loc2,
            "resource_accessed": random.choice(SENSITIVE_RESOURCES),
            "auth_method": "password",
            "session_duration": random.randint(30, 120),
            "command_sequence": [],
            "device_fingerprint": f"Unknown/{fake.user_agent()}",
            "label": "impossible_travel",
        },
    ]


def _generate_credential_stuffing(entities: List[dict], base_time: datetime) -> List[dict]:
    """Credential stuffing: many entity_ids from few IPs, high failure rate."""
    logs = []
    attacker_ips = [fake.ipv4_public() for _ in range(random.randint(2, 5))]
    num_targets = min(random.randint(10, 30), len(entities))
    targets = random.sample(entities, k=num_targets)

    for target in targets:
        ts = base_time - timedelta(days=random.randint(0, 29),
                                   hours=random.randint(0, 23),
                                   minutes=random.randint(0, 59))
        logs.append({
            "entity_id": target["entity_id"],
            "entity_type": target["entity_type"],
            "timestamp": ts,
            "source_ip": random.choice(attacker_ips),
            "geo_location": random.choice(GEO_LOCATIONS),
            "resource_accessed": "/api/auth/login",
            "auth_method": "password",
            "session_duration": random.randint(1, 10),
            "command_sequence": [],
            "device_fingerprint": random.choice(DEVICE_TEMPLATES[:3]),
            "label": "credential_stuffing",
        })
    return logs


def _generate_device_spoofing(entity: dict, base_time: datetime) -> dict:
    """Device spoofing: known entity with brand-new device + different OS."""
    new_device = f"Unknown-{fake.lexify('????')}/{fake.random_element(['Linux', 'FreeBSD', 'Kali'])}/x64/FP-{uuid.uuid4().hex[:8]}"
    ts = base_time - timedelta(days=random.randint(0, 29), hours=random.randint(0, 23))

    return {
        "entity_id": entity["entity_id"],
        "entity_type": entity["entity_type"],
        "timestamp": ts,
        "source_ip": fake.ipv4_public(),
        "geo_location": random.choice(entity["frequent_locations"]),
        "resource_accessed": random.choice(entity["common_resources"]),
        "auth_method": random.choice(entity["common_auth_methods"]),
        "session_duration": random.randint(60, 600),
        "command_sequence": [],
        "device_fingerprint": new_device,
        "label": "device_spoofing",
    }


def _generate_lateral_movement(entity: dict, base_time: datetime) -> List[dict]:
    """Lateral movement: access unusual breadth of sensitive resources."""
    logs = []
    num_resources = random.randint(3, 6)
    resources = random.sample(SENSITIVE_RESOURCES, k=min(num_resources, len(SENSITIVE_RESOURCES)))

    for res in resources:
        ts = base_time - timedelta(days=random.randint(0, 29),
                                   hours=random.randint(0, 5),
                                   minutes=random.randint(0, 59))
        logs.append({
            "entity_id": entity["entity_id"],
            "entity_type": entity["entity_type"],
            "timestamp": ts,
            "source_ip": fake.ipv4_private(),
            "geo_location": random.choice(entity["frequent_locations"]),
            "resource_accessed": res,
            "auth_method": random.choice(entity["common_auth_methods"]),
            "session_duration": random.randint(30, 180),
            "command_sequence": random.sample(list(SUSPICIOUS_COMMANDS), k=random.randint(2, 4)),
            "device_fingerprint": random.choice(entity["common_devices"]),
            "label": "lateral_movement",
        })
    return logs


def _generate_low_and_slow(entity: dict, base_time: datetime) -> List[dict]:
    """Low-and-slow exfiltration: small, off-hours access over days."""
    logs = []
    num_days = random.randint(3, 8)

    for d in range(num_days):
        ts = base_time - timedelta(days=random.randint(0, 25))
        ts = ts.replace(hour=random.randint(1, 4), minute=random.randint(0, 59))
        logs.append({
            "entity_id": entity["entity_id"],
            "entity_type": entity["entity_type"],
            "timestamp": ts,
            "source_ip": fake.ipv4_private(),
            "geo_location": random.choice(entity["frequent_locations"]),
            "resource_accessed": random.choice(SENSITIVE_RESOURCES[:5]),
            "auth_method": random.choice(entity["common_auth_methods"]),
            "session_duration": random.randint(10, 60),
            "command_sequence": ["cat", "scp"] if random.random() > 0.5 else [],
            "device_fingerprint": random.choice(entity["common_devices"]),
            "label": "low_and_slow_exfiltration",
        })
    return logs


def _generate_insider_drift(entity: dict, base_time: datetime) -> List[dict]:
    """Insider drift: gradual privilege expansion, new resources, slight hour shifts."""
    logs = []
    num_events = random.randint(4, 7)
    new_resources = random.sample(SENSITIVE_RESOURCES, k=min(3, len(SENSITIVE_RESOURCES)))

    for i in range(num_events):
        normal_hour = random.choice(entity["normal_hours"])
        drifted_hour = normal_hour + random.randint(1, 4)
        ts = base_time - timedelta(days=random.randint(0, 25))
        ts = ts.replace(hour=drifted_hour % 24, minute=random.randint(0, 59))

        logs.append({
            "entity_id": entity["entity_id"],
            "entity_type": entity["entity_type"],
            "timestamp": ts,
            "source_ip": fake.ipv4_private(),
            "geo_location": random.choice(entity["frequent_locations"]),
            "resource_accessed": random.choice(new_resources),
            "auth_method": random.choice(AUTH_METHODS),
            "session_duration": entity["avg_session_duration"] + random.randint(100, 500),
            "command_sequence": [],
            "device_fingerprint": random.choice(entity["common_devices"]),
            "label": "insider_drift",
        })
    return logs


async def generate_synthetic_data(db, count: int, attack_types: list) -> dict:
    """
    Generate synthetic access logs with injected attack scenarios.
    Creates entity profiles, normal logs, and attack-specific anomalous logs.
    """
    # Re-seed Faker & NumPy with random integer for dynamic generation
    dynamic_seed = random.randint(1, 1000000)
    Faker.seed(dynamic_seed)
    np.random.seed(dynamic_seed % 2**32)
    # Clear existing data for fresh generation
    await db.access_logs.delete_many({})
    await db.alerts.delete_many({})
    await db.entity_profiles.delete_many({})
    await db.model_metrics.delete_many({})

    # Create entity profiles (50-200 entities)
    num_entities = min(max(count // 50, 40), 100)
    entities = _create_entity_profiles(num_entities)

    # Store entity profiles
    for entity in entities:
        await db.entity_profiles.update_one(
            {"entity_id": entity["entity_id"]},
            {"$set": entity},
            upsert=True,
        )

    normal_count = int(count * 0.92)
    now = datetime.now(timezone.utc)

    all_logs = []

    # Normal logs distributed across all entities
    for _ in range(normal_count):
        entity = random.choice(entities)
        log = _generate_normal_log(entity, now)
        all_logs.append(log)

    # Attack logs distributed across distinct entities
    attack_breakdown = {}

    for attack_type in attack_types:
        generated = 0

        if attack_type == "brute_force":
            # Pick 5-10 different entities for brute force attacks
            num_targets = min(8, len(entities))
            selected_entities = random.sample(entities, k=num_targets)
            for e in selected_entities:
                logs = _generate_brute_force(e, now)
                all_logs.extend(logs)
                generated += len(logs)

        elif attack_type == "impossible_travel":
            num_targets = min(10, len(entities))
            selected_entities = random.sample(entities, k=num_targets)
            for e in selected_entities:
                logs = _generate_impossible_travel(e, now)
                all_logs.extend(logs)
                generated += len(logs)

        elif attack_type == "credential_stuffing":
            logs = _generate_credential_stuffing(entities, now)
            all_logs.extend(logs)
            generated = len(logs)

        elif attack_type == "device_spoofing":
            num_targets = min(15, len(entities))
            selected_entities = random.sample(entities, k=num_targets)
            for e in selected_entities:
                log = _generate_device_spoofing(e, now)
                all_logs.append(log)
                generated += 1

        elif attack_type == "lateral_movement":
            num_targets = min(8, len(entities))
            selected_entities = random.sample(entities, k=num_targets)
            for e in selected_entities:
                logs = _generate_lateral_movement(e, now)
                all_logs.extend(logs)
                generated += len(logs)

        elif attack_type == "low_and_slow_exfiltration":
            num_targets = min(8, len(entities))
            selected_entities = random.sample(entities, k=num_targets)
            for e in selected_entities:
                logs = _generate_low_and_slow(e, now)
                all_logs.extend(logs)
                generated += len(logs)

        elif attack_type == "insider_drift":
            num_targets = min(10, len(entities))
            selected_entities = random.sample(entities, k=num_targets)
            for e in selected_entities:
                logs = _generate_insider_drift(e, now)
                all_logs.extend(logs)
                generated += len(logs)

        attack_breakdown[attack_type] = generated

    # Shuffle to mix normal and attack logs
    random.shuffle(all_logs)

    # Bulk insert in batches of 5000
    total_inserted = 0
    batch_size = 5000
    for i in range(0, len(all_logs), batch_size):
        batch = all_logs[i:i + batch_size]
        if batch:
            await db.access_logs.insert_many(batch)
            total_inserted += len(batch)

    # Update entity login counts
    for entity in entities:
        entity_count = sum(1 for l in all_logs if l["entity_id"] == entity["entity_id"])
        await db.entity_profiles.update_one(
            {"entity_id": entity["entity_id"]},
            {"$set": {"total_logins": entity_count}},
        )

    anomaly_count = sum(1 for l in all_logs if l["label"] != "normal")

    return {
        "status": "completed",
        "records_generated": total_inserted,
        "normal_count": total_inserted - anomaly_count,
        "anomaly_count": anomaly_count,
        "attack_breakdown": attack_breakdown,
        "message": f"Generated {total_inserted} records across {len(entities)} unique entities with {anomaly_count} anomalies",
    }
