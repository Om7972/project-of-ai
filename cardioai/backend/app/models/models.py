from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship, DeclarativeBase

class Base(DeclarativeBase):
    pass

class User(Base):
    """System users (Doctors/Staff)"""
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(255), nullable=False)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(String(20), default="doctor") # admin | doctor
    created_at      = Column(DateTime, default=datetime.utcnow)

class Patient(Base):
    """Patient demographic and clinical intake data"""
    __tablename__ = "patients"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(255), nullable=False)
    age        = Column(Integer, nullable=False)
    sex        = Column(Integer, nullable=False) # 1=M, 0=F
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship to predictions
    predictions = relationship("Prediction", back_populates="patient", cascade="all, delete-orphan")

class Prediction(Base):
    """ML diagnostic results tied to patients"""
    __tablename__ = "predictions"

    id                     = Column(Integer, primary_key=True, index=True)
    patient_id             = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    probability            = Column(Float, nullable=False) # 0-100
    risk_level             = Column(String(20), nullable=False) # Low | Moderate | High
    features_json          = Column(String, nullable=True) # Optional: snapshot of input features
    created_at             = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("Patient", back_populates="predictions")

# High-performance indexes for analytics
Index('idx_pred_risk_level', Prediction.risk_level)
Index('idx_patient_created', Patient.created_at.desc())
