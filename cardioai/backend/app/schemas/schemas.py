from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ── Auth Schemas ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# ── Clinical Schemas ────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    name: str
    age: int
    sex: int

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
    features_snapshot: Optional[Dict[str, Any]] = None

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
    sex: int
    trestbps: int
    chol: int
    thalach: int
    oldpeak: float
    cp: int # chest pain
    fbs: int # fasting blood sugar
    restecg: int
    exang: int # exercise induced angina
    slope: int
    ca: int # vessels
    thal: int

class DiagnosticResponse(BaseModel):
    risk_probability: float
    risk_level: str
    patient_id: int
    prediction_id: int

class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    db_connected: bool
    timestamp: datetime
