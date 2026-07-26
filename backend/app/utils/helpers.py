"""
Shared utility functions used across the application.
"""
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def get_utc_now() -> datetime:
    """Get current UTC timestamp."""
    return datetime.now(timezone.utc)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth
    using the Haversine formula. Returns distance in kilometers.
    """
    R = 6371  # Earth's radius in km
    
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def severity_from_risk_score(score: float) -> str:
    """Map a risk score (0-100) to a severity label."""
    if score >= 75:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 25:
        return "medium"
    else:
        return "low"


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    # Convert datetime objects to ISO strings
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc


def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert a list of MongoDB documents to JSON-serializable dicts."""
    return [serialize_doc(doc) for doc in docs]


def paginate_params(page: int = 1, page_size: int = 20) -> tuple:
    """Calculate skip and limit from page parameters."""
    skip = (max(1, page) - 1) * page_size
    return skip, page_size


# Suspicious commands that may indicate malicious activity
SUSPICIOUS_COMMANDS = {
    "wget", "curl", "nc", "netcat", "nmap", "ssh", "scp",
    "chmod 777", "rm -rf", "cat /etc/passwd", "cat /etc/shadow",
    "whoami", "id", "uname", "ifconfig", "ip addr",
    "python -c", "perl -e", "bash -i", "powershell",
    "certutil", "bitsadmin", "reg export", "mimikatz",
}

# Known geo locations with coordinates for realistic data
GEO_LOCATIONS = [
    {"country": "US", "city": "New York", "lat": 40.7128, "lon": -74.0060},
    {"country": "US", "city": "San Francisco", "lat": 37.7749, "lon": -122.4194},
    {"country": "US", "city": "Chicago", "lat": 41.8781, "lon": -87.6298},
    {"country": "US", "city": "Los Angeles", "lat": 34.0522, "lon": -118.2437},
    {"country": "US", "city": "Seattle", "lat": 47.6062, "lon": -122.3321},
    {"country": "GB", "city": "London", "lat": 51.5074, "lon": -0.1278},
    {"country": "DE", "city": "Berlin", "lat": 52.5200, "lon": 13.4050},
    {"country": "DE", "city": "Frankfurt", "lat": 50.1109, "lon": 8.6821},
    {"country": "FR", "city": "Paris", "lat": 48.8566, "lon": 2.3522},
    {"country": "JP", "city": "Tokyo", "lat": 35.6762, "lon": 139.6503},
    {"country": "SG", "city": "Singapore", "lat": 1.3521, "lon": 103.8198},
    {"country": "AU", "city": "Sydney", "lat": -33.8688, "lon": 151.2093},
    {"country": "IN", "city": "Mumbai", "lat": 19.0760, "lon": 72.8777},
    {"country": "IN", "city": "Bangalore", "lat": 12.9716, "lon": 77.5946},
    {"country": "CA", "city": "Toronto", "lat": 43.6532, "lon": -79.3832},
    {"country": "BR", "city": "Sao Paulo", "lat": -23.5505, "lon": -46.6333},
    {"country": "RU", "city": "Moscow", "lat": 55.7558, "lon": 37.6173},
    {"country": "CN", "city": "Beijing", "lat": 39.9042, "lon": 116.4074},
    {"country": "CN", "city": "Shanghai", "lat": 31.2304, "lon": 121.4737},
    {"country": "KR", "city": "Seoul", "lat": 37.5665, "lon": 126.9780},
    {"country": "NL", "city": "Amsterdam", "lat": 52.3676, "lon": 4.9041},
    {"country": "SE", "city": "Stockholm", "lat": 59.3293, "lon": 18.0686},
    {"country": "AE", "city": "Dubai", "lat": 25.2048, "lon": 55.2708},
    {"country": "IL", "city": "Tel Aviv", "lat": 32.0853, "lon": 34.7818},
    {"country": "ZA", "city": "Cape Town", "lat": -33.9249, "lon": 18.4241},
    {"country": "NG", "city": "Lagos", "lat": 6.5244, "lon": 3.3792},
    {"country": "KE", "city": "Nairobi", "lat": -1.2921, "lon": 36.8219},
    {"country": "MX", "city": "Mexico City", "lat": 19.4326, "lon": -99.1332},
    {"country": "AR", "city": "Buenos Aires", "lat": -34.6037, "lon": -58.3816},
    {"country": "PH", "city": "Manila", "lat": 14.5995, "lon": 120.9842},
]

# Resources that users can access
RESOURCES = [
    "/dashboard", "/api/reports", "/api/finance/reports",
    "/api/users/list", "/api/users/profile", "/api/settings",
    "/api/analytics", "/api/notifications", "/api/files/download",
    "/api/files/upload", "/api/projects", "/api/tasks",
    "/api/messages", "/api/calendar", "/api/contacts",
]

# Sensitive resources that trigger higher risk scores
SENSITIVE_RESOURCES = [
    "/api/admin/users", "/api/admin/config", "/api/admin/logs",
    "/api/admin/database", "/api/admin/secrets", "/api/admin/keys",
    "/api/finance/transactions", "/api/finance/payroll",
    "/api/security/audit", "/api/security/policies",
    "/api/hr/records", "/api/hr/salaries",
    "/api/infrastructure/servers", "/api/infrastructure/network",
]

# Authentication methods
AUTH_METHODS = ["password", "token", "certificate", "biometric", "sso", "mfa"]

# Device fingerprint templates
DEVICE_TEMPLATES = [
    "Chrome/Win11/x64", "Chrome/Win10/x64", "Chrome/MacOS/arm64",
    "Firefox/Win11/x64", "Firefox/Linux/x64", "Safari/MacOS/arm64",
    "Edge/Win11/x64", "Chrome/Android/arm64", "Safari/iOS/arm64",
    "Electron/Win10/x64", "Postman/Win11/x64", "Python-requests/Linux/x64",
    "curl/Linux/x64",
]
