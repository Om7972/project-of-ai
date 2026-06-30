import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index, Text, Boolean
from sqlalchemy.orm import relationship, DeclarativeBase


class Base(DeclarativeBase):
    pass


def _uid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="doctor")  # admin | doctor
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="created_by")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    patient_uid = Column(String(36), unique=True, index=True, default=_uid, nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Integer, nullable=False)  # 1: Female, 2: Male
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    predictions = relationship("Prediction", back_populates="patient", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    probability = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    features_json = Column(Text, nullable=True)
    explain_json = Column(Text, nullable=True)
    model_version = Column(String(64), default="v1.0")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("Patient", back_populates="predictions")
    created_by = relationship("User", back_populates="predictions")
    triage_case = relationship("TriageCase", back_populates="prediction", uselist=False)


class TriageCase(Base):
    __tablename__ = "triage_cases"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), unique=True, nullable=False)
    status = Column(String(20), default="pending")  # pending | reviewed | escalated
    priority = Column(Integer, default=1)  # 1=high, 2=moderate
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    prediction = relationship("Prediction", back_populates="triage_case")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(64), nullable=False, index=True)
    resource = Column(String(128), nullable=True)
    resource_id = Column(String(64), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    notifications = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=False)
    auto_save = Column(Boolean, default=True)
    high_contrast = Column(Boolean, default=False)
    email_reports = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")


class BatchJob(Base):
    __tablename__ = "batch_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending | processing | completed | failed
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    results_json = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)


Index("idx_pred_risk_level", Prediction.risk_level)
Index("idx_patient_uid", Patient.patient_uid)
Index("idx_triage_status", TriageCase.status)
