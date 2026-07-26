from app.utils.helpers import SENSITIVE_RESOURCES

async def explain_anomaly(log_doc: dict, entity_profile: dict) -> tuple:
    """
    Generate human-readable explanations for why an event is anomalous.
    Returns (reasons_list, current_behavior_snapshot, normal_behavior_snapshot).
    """
    reasons = []
    
    dt = log_doc.get("timestamp")
    if dt and dt.hour not in entity_profile.get("normal_hours", []):
        normal_h = entity_profile.get("normal_hours", [9, 17])
        reasons.append(f"Login at {dt.hour}:00 — normal hours are {min(normal_h)}:00-{max(normal_h)}:00")
        
    loc = log_doc.get("geo_location", {}).get("country")
    if loc not in [l.get("country") for l in entity_profile.get("frequent_locations", [])]:
        reasons.append(f"Login from new country ({loc})")
        
    dev = log_doc.get("device_fingerprint")
    if dev not in entity_profile.get("common_devices", []):
        reasons.append(f"New device fingerprint: {dev}")
        
    res = log_doc.get("resource_accessed")
    if res not in entity_profile.get("common_resources", []):
        reasons.append(f"Accessed unusual resource: {res}")
        
    if res in SENSITIVE_RESOURCES:
        reasons.append(f"Accessed sensitive resource: {res}")
        
    auth = log_doc.get("auth_method")
    if auth not in entity_profile.get("common_auth_methods", []):
        reasons.append(f"Unusual auth method: {auth}")
        
    dur = log_doc.get("session_duration", 0)
    avg_dur = entity_profile.get("avg_session_duration", 0)
    if dur > avg_dur * 2 or dur < avg_dur * 0.1:
        reasons.append(f"Session duration {dur}s — average is {avg_dur}s")
        
    cmds = log_doc.get("command_sequence", [])
    if cmds:
        reasons.append(f"Suspicious commands detected: {', '.join(cmds)}")
        
    current_behavior = {
        "login_hour": dt.hour if dt else 0,
        "country": loc,
        "city": log_doc.get("geo_location", {}).get("city"),
        "device": dev,
        "resource": res,
        "auth_method": auth,
        "session_duration": dur,
        "ip_address": log_doc.get("source_ip")
    }
    
    normal_behavior = {
        "login_hour": entity_profile.get("normal_hours", [0])[0],
        "country": entity_profile.get("frequent_locations", [{}])[0].get("country"),
        "city": entity_profile.get("frequent_locations", [{}])[0].get("city"),
        "device": entity_profile.get("common_devices", [""])[0] if entity_profile.get("common_devices") else "",
        "resource": entity_profile.get("common_resources", [""])[0] if entity_profile.get("common_resources") else "",
        "auth_method": entity_profile.get("common_auth_methods", [""])[0] if entity_profile.get("common_auth_methods") else "",
        "session_duration": avg_dur,
        "ip_address": "Various"
    }
    
    return reasons, current_behavior, normal_behavior
