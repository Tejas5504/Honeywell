"""
Pydantic models for API request/response validation.
Defines all DTOs used across the application endpoints.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================
# Enums
# ============================================================

class EntityType(str, Enum):
    USER = "user"
    SERVICE_ACCOUNT = "service_account"
    EDGE_DEVICE = "edge_device"


class AttackType(str, Enum):
    NORMAL = "normal"
    BRUTE_FORCE = "brute_force"
    IMPOSSIBLE_TRAVEL = "impossible_travel"
    CREDENTIAL_STUFFING = "credential_stuffing"
    DEVICE_SPOOFING = "device_spoofing"
    LATERAL_MOVEMENT = "lateral_movement"
    LOW_AND_SLOW_EXFILTRATION = "low_and_slow_exfiltration"
    INSIDER_DRIFT = "insider_drift"


class AlertStatus(str, Enum):
    NEW = "new"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ============================================================
# Geo Location
# ============================================================

class GeoLocation(BaseModel):
    country: str
    city: str
    lat: float
    lon: float


# ============================================================
# Access Log Schemas
# ============================================================

class AccessLogBase(BaseModel):
    entity_id: str
    entity_type: str
    timestamp: datetime
    source_ip: str
    geo_location: GeoLocation
    resource_accessed: str
    auth_method: str
    session_duration: float
    command_sequence: List[str] = []
    device_fingerprint: str
    label: str = "normal"


class AccessLogResponse(AccessLogBase):
    id: str


# ============================================================
# Alert Schemas
# ============================================================

class BehaviorSnapshot(BaseModel):
    """Captures a point-in-time snapshot of behavioral attributes."""
    login_hour: Optional[int] = None
    country: Optional[str] = None
    city: Optional[str] = None
    device: Optional[str] = None
    resource: Optional[str] = None
    auth_method: Optional[str] = None
    session_duration: Optional[float] = None
    ip_address: Optional[str] = None


class AlertBase(BaseModel):
    entity_id: str
    timestamp: datetime
    risk_score: float = Field(ge=0, le=100)
    attack_type: str
    status: str = AlertStatus.NEW
    severity: str
    geo_location: GeoLocation
    reasons: List[str] = []
    current_behavior: Optional[BehaviorSnapshot] = None
    normal_behavior: Optional[BehaviorSnapshot] = None


class AlertResponse(AlertBase):
    id: str
    log_id: Optional[str] = None
    source_ip: Optional[str] = None
    device_fingerprint: Optional[str] = None
    resource_accessed: Optional[str] = None
    auth_method: Optional[str] = None
    created_at: Optional[datetime] = None


class AlertStatusUpdate(BaseModel):
    status: AlertStatus


class AlertsListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============================================================
# Entity Profile Schemas
# ============================================================

class RiskHistoryEntry(BaseModel):
    date: datetime
    score: float


class EntityProfileResponse(BaseModel):
    id: Optional[str] = None
    entity_id: str
    entity_type: str
    normal_hours: List[int] = []
    common_devices: List[str] = []
    frequent_locations: List[GeoLocation] = []
    common_resources: List[str] = []
    common_auth_methods: List[str] = []
    avg_session_duration: float = 0
    total_logins: int = 0
    risk_history: List[Dict[str, Any]] = []
    last_updated: Optional[datetime] = None


class EntityListResponse(BaseModel):
    entities: List[EntityProfileResponse]
    total: int


# ============================================================
# Dashboard Schemas
# ============================================================

class DashboardStats(BaseModel):
    total_users: int
    active_sessions: int
    threats_today: int
    critical_alerts: int
    avg_risk_score: float


class ThreatTrendEntry(BaseModel):
    date: str
    count: int
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0


class AttackDistribution(BaseModel):
    attack_type: str
    count: int
    percentage: float


class RiskBucket(BaseModel):
    range: str
    count: int
    min_score: int
    max_score: int


class HeatmapCell(BaseModel):
    day: int  # 0=Monday, 6=Sunday
    hour: int  # 0-23
    count: int


class WorldMapEntry(BaseModel):
    country: str
    count: int
    lat: float
    lon: float
    city: Optional[str] = None


# ============================================================
# Data Generator Schemas
# ============================================================

class GenerateRequest(BaseModel):
    count: int = Field(ge=100, le=100000, default=10000)
    attack_types: List[str] = [
        "brute_force", "impossible_travel", "credential_stuffing",
        "device_spoofing", "lateral_movement",
        "low_and_slow_exfiltration", "insider_drift"
    ]


class GenerateResponse(BaseModel):
    status: str
    records_generated: int
    normal_count: int
    anomaly_count: int
    attack_breakdown: Dict[str, int]
    message: str


# ============================================================
# Model Schemas
# ============================================================

class ModelMetricsResponse(BaseModel):
    id: Optional[str] = None
    model_type: str = "IsolationForest"
    accuracy: float = 0
    precision: float = 0
    recall: float = 0
    f1_score: float = 0
    confusion_matrix: List[List[int]] = [[0, 0], [0, 0]]
    feature_importances: Dict[str, float] = {}
    training_samples: int = 0
    trained_at: Optional[datetime] = None
    hyperparameters: Dict[str, Any] = {}


class TrainModelResponse(BaseModel):
    status: str
    message: str
    metrics: ModelMetricsResponse


class PredictResponse(BaseModel):
    status: str
    total_processed: int
    anomalies_detected: int
    alerts_created: int
    message: str


# ============================================================
# Report Schemas
# ============================================================

class ReportGenerateRequest(BaseModel):
    include_threats: bool = True
    include_attacks: bool = True
    include_risk_distribution: bool = True
    include_model_performance: bool = True
    include_recommendations: bool = True


class ReportResponse(BaseModel):
    status: str
    report_id: str
    message: str
