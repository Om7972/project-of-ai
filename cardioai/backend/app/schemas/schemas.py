from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime


# ── Auth ─────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# ── Clinical ─────────────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    name: str
    age: int = Field(..., ge=1, le=120)
    gender: int = Field(..., ge=1, le=2)


class PatientResponse(PatientBase):
    id: int
    patient_uid: str
    created_at: datetime

    class Config:
        from_attributes = True


class DiagnosticInput(BaseModel):
    patient_name: str = Field(..., min_length=1, max_length=255)
    patient_uid: Optional[str] = None
    age: int = Field(..., ge=1, le=120)
    gender: int = Field(..., ge=1, le=2)
    height: int = Field(..., ge=100, le=250)
    weight: float = Field(..., ge=20, le=300)
    ap_hi: int = Field(..., ge=80, le=250)
    ap_lo: int = Field(..., ge=40, le=150)
    cholesterol: int = Field(..., ge=1, le=3)
    gluc: int = Field(..., ge=1, le=3)
    smoke: int = Field(..., ge=0, le=1)
    alco: int = Field(..., ge=0, le=1)
    active: int = Field(..., ge=0, le=1)

    @field_validator("ap_lo")
    @classmethod
    def validate_bp(cls, ap_lo, info):
        ap_hi = info.data.get("ap_hi")
        if ap_hi and ap_lo >= ap_hi:
            raise ValueError("Diastolic BP must be lower than systolic BP")
        return ap_lo


class DiagnosticResponse(BaseModel):
    risk_probability: float
    risk_level: str
    prediction: int
    confidence: float
    model_used: str
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[int] = None
    patient_id: Optional[int] = None
    patient_uid: Optional[str] = None
    prediction_id: Optional[int] = None
    triage_created: bool = False


class HistoryItem(BaseModel):
    id: int
    patient_name: str
    patient_uid: Optional[str] = None
    patient_age: int
    patient_gender: int
    risk_probability: float
    risk_level: str
    created_at: datetime
    trestbps: Optional[int] = None
    chol: Optional[int] = None
    thalach: Optional[int] = None


class StatsResponse(BaseModel):
    total_predictions: int
    high_risk_cases: int
    moderate_risk_cases: int
    low_risk_cases: int
    negative_cases: int
    positive_cases: int
    model_accuracy_pct: float
    model_name: str
    pending_triage: int = 0


class ExplainResponse(BaseModel):
    prediction_id: int
    method: str
    contributions: List[Dict[str, Any]]
    summary: str


class PatientTimelineItem(BaseModel):
    prediction_id: int
    risk_probability: float
    risk_level: str
    created_at: datetime


class PatientTimelineResponse(BaseModel):
    patient_uid: str
    patient_name: str
    age: int
    gender: int
    assessments: List[PatientTimelineItem]
    risk_trend: Optional[float] = None


class PatientSearchResult(BaseModel):
    patient_uid: str
    patient_name: str
    age: int
    gender: int
    latest_risk: Optional[float] = None
    latest_risk_level: Optional[str] = None
    assessment_count: int


# ── Triage ───────────────────────────────────────────────────────────────────

class TriageCaseResponse(BaseModel):
    id: int
    prediction_id: int
    patient_name: str
    patient_uid: str
    risk_probability: float
    risk_level: str
    status: str
    priority: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TriageUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[int] = None


# ── Audit ────────────────────────────────────────────────────────────────────

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_name: Optional[str] = None
    action: str
    resource: Optional[str]
    resource_id: Optional[str]
    ip_address: Optional[str]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Preferences ──────────────────────────────────────────────────────────────

class UserPreferencesUpdate(BaseModel):
    notifications: Optional[bool] = None
    dark_mode: Optional[bool] = None
    auto_save: Optional[bool] = None
    high_contrast: Optional[bool] = None
    email_reports: Optional[bool] = None


class UserPreferencesResponse(BaseModel):
    notifications: bool
    dark_mode: bool
    auto_save: bool
    high_contrast: bool
    email_reports: bool

    class Config:
        from_attributes = True


# ── Batch ────────────────────────────────────────────────────────────────────

class BatchJobResponse(BaseModel):
    id: int
    status: str
    total_rows: int
    processed_rows: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


# ── FHIR-lite ────────────────────────────────────────────────────────────────

class FHIRObservation(BaseModel):
    resourceType: str = "Bundle"
    type: str = "collection"
    entry: List[Dict[str, Any]]


# ── Health ───────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    db_connected: bool
    redis_connected: bool
    timestamp: datetime
