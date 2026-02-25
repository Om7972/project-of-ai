import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer,
    Float, ForeignKey, Text, Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base


# ── Enums ─────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    admin   = "admin"
    doctor  = "doctor"
    nurse   = "nurse"
    patient = "patient"


# ── ORM Models ────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    full_name       = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(SAEnum(UserRole), default=UserRole.patient, nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")


class Patient(Base):
    """Simplified Patient table for prediction tracking as requested."""
    __tablename__ = "patients"

    id                     = Column(Integer, primary_key=True, index=True)
    name                   = Column(String(255), nullable=False)
    age                    = Column(Integer, nullable=False)
    sex                    = Column(Integer, nullable=False)  # 1=Male, 0=Female
    prediction_probability = Column(Float, nullable=False)    # 0.0 - 100.0
    risk_level             = Column(String(20), nullable=False) # Low | Moderate | High
    created_at             = Column(DateTime, default=datetime.utcnow, index=True)


class Prediction(Base):
    __tablename__ = "predictions"
    # ... (existing fields)

    id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # ── Patient metadata ──────────────────────────────────────────────────────
    patient_name   = Column(String(255), nullable=False)
    patient_age    = Column(Integer,     nullable=False)
    patient_gender = Column(String(10),  nullable=False)

    # ── 13 Clinical features (Cleveland dataset) ──────────────────────────────
    age      = Column(Integer, nullable=False)
    sex      = Column(Integer, nullable=False)   # 1=Male, 0=Female
    cp       = Column(Integer, nullable=False)   # Chest pain type 0-3
    trestbps = Column(Integer, nullable=False)   # Resting blood pressure
    chol     = Column(Integer, nullable=False)   # Serum cholesterol
    fbs      = Column(Integer, nullable=False)   # Fasting blood sugar > 120
    restecg  = Column(Integer, nullable=False)   # Resting ECG 0-2
    thalach  = Column(Integer, nullable=False)   # Max heart rate
    exang    = Column(Integer, nullable=False)   # Exercise induced angina
    oldpeak  = Column(Float,   nullable=False)   # ST depression
    slope    = Column(Integer, nullable=False)   # Slope of peak ST segment
    ca       = Column(Integer, nullable=False)   # Major vessels 0-4
    thal     = Column(Integer, nullable=False)   # Thalassemia type

    # ── Prediction output ─────────────────────────────────────────────────────
    prediction       = Column(Integer,     nullable=False)  # 0=No Disease, 1=Disease
    probability      = Column(Float,       nullable=False)  # model confidence 0-1
    risk_level       = Column(String(20),  nullable=False)  # Low | Moderate | High
    notes            = Column(Text,        nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="predictions")
