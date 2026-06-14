from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ── Auth Schemas ─────────────────────────────────────────────────────────────

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

# ── Clinical Schemas ────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    name: str
    age: int
    gender: int  # 1: Female, 2: Male

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionBase(BaseModel):
    probability: float
    risk_level: str

class PredictionCreate(PredictionBase):
    patient_id: int
    features_json: Optional[str] = None

class PredictionResponse(PredictionBase):
    id: int
    patient_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ── ML Input Schema ─────────────────────────────────────────────────────────

class DiagnosticInput(BaseModel):
    patient_name: str
    age: int
    gender: int
    height: int
    weight: float
    ap_hi: int
    ap_lo: int
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    active: int

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
    prediction_id: Optional[int] = None

# ── History Schema ──────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    id: int
    patient_name: str
    patient_age: int
    patient_gender: int
    risk_probability: float
    risk_level: str
    created_at: datetime
    # Optional fields from original PredictPage
    trestbps: Optional[int] = None
    chol: Optional[int] = None
    thalach: Optional[int] = None

# ── Stats Schema ─────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_predictions: int
    high_risk_cases: int
    moderate_risk_cases: int
    low_risk_cases: int
    negative_cases: int
    positive_cases: int
    model_accuracy_pct: float
    model_name: str

# ── Health Check Schema ─────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    db_connected: bool
    timestamp: datetime
