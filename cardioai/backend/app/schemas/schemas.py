"""
Pydantic v2 schemas for CardioAI — request & response validation.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID
from enum import Enum


# ══════════════════════════════════════════════════════════════════════════════
#  Prediction — Input / Output
# ══════════════════════════════════════════════════════════════════════════════

class PatientInput(BaseModel):
    """
    13-feature Cleveland Heart Disease input.
    All ranges validated against clinical reference values.
    """

    # ── Patient metadata ──────────────────────────────────────────────────────
    patient_name:   str = Field(..., min_length=2, max_length=255,
                                 description="Full name of the patient",
                                 examples=["Ramesh Kumar"])
    patient_gender: Literal["Male", "Female", "Other"] = Field(
                        ..., description="Biological sex (for records only)")

    # ── Clinical features ─────────────────────────────────────────────────────
    age: int = Field(
        ..., ge=1, le=120,
        description="Age in years",
        examples=[52])

    sex: int = Field(
        ..., ge=0, le=1,
        description="Biological sex: 1 = Male, 0 = Female",
        examples=[1])

    cp: int = Field(
        ..., ge=0, le=3,
        description=(
            "Chest pain type — "
            "0: Typical angina, "
            "1: Atypical angina, "
            "2: Non-anginal pain, "
            "3: Asymptomatic"
        ),
        examples=[2])

    trestbps: int = Field(
        ..., ge=60, le=250,
        description="Resting blood pressure (mm Hg at hospital admission)",
        examples=[130])

    chol: int = Field(
        ..., ge=100, le=700,
        description="Serum cholesterol (mg/dl)",
        examples=[250])

    fbs: int = Field(
        ..., ge=0, le=1,
        description="Fasting blood sugar > 120 mg/dl: 1 = True, 0 = False",
        examples=[0])

    restecg: int = Field(
        ..., ge=0, le=2,
        description=(
            "Resting ECG results — "
            "0: Normal, "
            "1: ST-T wave abnormality, "
            "2: Left ventricular hypertrophy"
        ),
        examples=[1])

    thalach: int = Field(
        ..., ge=60, le=250,
        description="Maximum heart rate achieved (bpm)",
        examples=[153])

    exang: int = Field(
        ..., ge=0, le=1,
        description="Exercise induced angina: 1 = Yes, 0 = No",
        examples=[0])

    oldpeak: float = Field(
        ..., ge=0.0, le=10.0,
        description="ST depression induced by exercise relative to rest",
        examples=[1.4])

    slope: int = Field(
        ..., ge=0, le=2,
        description=(
            "Slope of the peak exercise ST segment — "
            "0: Upsloping, 1: Flat, 2: Downsloping"
        ),
        examples=[1])

    ca: int = Field(
        ..., ge=0, le=4,
        description="Number of major vessels (0–4) colored by fluoroscopy",
        examples=[0])

    thal: int = Field(
        ..., ge=0, le=3,
        description=(
            "Thalassemia — "
            "0: Unknown, 1: Fixed defect, "
            "2: Normal, 3: Reversible defect"
        ),
        examples=[2])

    notes: Optional[str] = Field(
        None, max_length=1000,
        description="Optional clinical notes from attending physician")

    @field_validator("oldpeak")
    @classmethod
    def round_oldpeak(cls, v: float) -> float:
        return round(v, 2)

    @property
    def feature_vector(self) -> list:
        """Return features in the exact order expected by the model."""
        return [
            self.age, self.sex, self.cp, self.trestbps, self.chol,
            self.fbs, self.restecg, self.thalach, self.exang,
            self.oldpeak, self.slope, self.ca, self.thal,
        ]

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "patient_name":   "Ramesh Kumar",
                "patient_gender": "Male",
                "age": 52, "sex": 1, "cp": 2,
                "trestbps": 130, "chol": 250, "fbs": 0,
                "restecg": 1, "thalach": 153, "exang": 0,
                "oldpeak": 1.4, "slope": 1, "ca": 0, "thal": 2,
                "notes": "Referred by cardiologist.",
            }]
        }
    }


class PredictionResult(BaseModel):
    """Prediction API response."""
    # Risk output
    risk_probability: float = Field(..., description="Disease probability in % (0–100)")
    risk_level:       str   = Field(..., description="Low | Moderate | High")
    prediction:       int   = Field(..., description="0 = No Disease, 1 = Disease Detected")
    confidence:       float = Field(..., description="Raw model confidence (0–1)")
    model_used:       str   = Field(..., description="Model name used for inference")

    # Echo back patient info
    patient_name:   str
    patient_gender: str

    # Echo back clinical inputs
    age: int; sex: int; cp: int; trestbps: int; chol: int
    fbs: int; restecg: int; thalach: int; exang: int
    oldpeak: float; slope: int; ca: int; thal: int
    notes: Optional[str] = None

    # Metadata
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"from_attributes": True}


class PatientResponse(BaseModel):
    id:                     int
    name:                   str
    age:                    int
    sex:                    int
    prediction_probability: float
    risk_level:             str
    created_at:             datetime

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status:       str
    app_name:     str
    version:      str
    model_loaded: bool
    timestamp:    datetime = Field(default_factory=datetime.utcnow)


# ══════════════════════════════════════════════════════════════════════════════
#  Auth Schemas (JWT)
# ══════════════════════════════════════════════════════════════════════════════

class UserRole(str, Enum):
    admin   = "admin"
    doctor  = "doctor"
    nurse   = "nurse"
    patient = "patient"


class UserCreate(BaseModel):
    email:     EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password:  str = Field(..., min_length=6)
    role:      UserRole = UserRole.patient


class UserLogin(BaseModel):
    email:    EmailStr
    password: str


class UserResponse(BaseModel):
    id:         UUID
    email:      str
    full_name:  str
    role:       UserRole
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserResponse


# ══════════════════════════════════════════════════════════════════════════════
#  Saved Prediction (DB read-back)
# ══════════════════════════════════════════════════════════════════════════════

class SavedPredictionResponse(BaseModel):
    id:             UUID
    patient_name:   str
    patient_age:    int
    patient_gender: str
    age: int; sex: int; cp: int; trestbps: int; chol: int
    fbs: int; restecg: int; thalach: int; exang: int
    oldpeak: float; slope: int; ca: int; thal: int
    prediction:       int
    probability:      float = Field(exclude=True, default=0.0)  # raw 0-1 from DB
    risk_probability: float = Field(default=0.0, description="Disease probability in % (0–100)")
    risk_level:       str
    notes:            Optional[str]
    created_at:       datetime

    @model_validator(mode="after")
    def compute_risk_probability(self) -> "SavedPredictionResponse":
        # If risk_probability not set yet, compute it from probability (0-1 → 0-100)
        if self.risk_probability == 0.0 and self.probability > 0.0:
            self.risk_probability = round(self.probability * 100, 2)
        return self

    model_config = {"from_attributes": True, "populate_by_name": True}
