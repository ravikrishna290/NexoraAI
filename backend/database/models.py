"""
SQLAlchemy 2.0 Domain ORM Models for Nexora Industrial Platform.
"""

import time
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), default="SAFETY_OFFICER", nullable=False)
    created_at = Column(Float, default=time.time)

class MachineModel(Base):
    __tablename__ = "machines"

    asset_id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    product_id = Column(String(64), nullable=False)
    category = Column(String(32), default="PUMP")
    zone_id = Column(String(32), index=True)
    status = Column(String(32), default="SAFE")
    health_score = Column(Float, default=100.0)
    air_temp_c = Column(Float, default=25.0)
    process_temp_c = Column(Float, default=35.0)
    rpm = Column(Integer, default=1425)
    torque_nm = Column(Float, default=40.0)
    tool_wear_min = Column(Integer, default=0)
    vibration_mm_sec = Column(Float, default=1.5)
    operating_hours = Column(Integer, default=1000)
    failure_probability = Column(Float, default=5.0)
    remaining_useful_life = Column(Integer, default=500)
    failure_mode = Column(String(128), nullable=True)
    machine_failure = Column(Boolean, default=False)
    updated_at = Column(Float, default=time.time)

class WorkerModel(Base):
    __tablename__ = "workers"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    role = Column(String(128), nullable=False)
    zone_id = Column(String(32), index=True)
    shift_hours_active = Column(Float, default=0.0)
    ppe_compliant = Column(Boolean, default=True)
    certifications = Column(JSON, default=list)
    assigned_permit_id = Column(String(64), nullable=True)
    vital_status = Column(String(32), default="NORMAL")

class PermitModel(Base):
    __tablename__ = "permits"

    permit_id = Column(String(64), primary_key=True, index=True)
    type = Column(String(32), nullable=False)
    zone_id = Column(String(32), index=True)
    zone_name = Column(String(128), nullable=False)
    status = Column(String(32), default="PENDING_APPROVAL", index=True)
    applicant = Column(String(128), nullable=False)
    supervisor = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    risk_level = Column(String(32), default="WARNING")
    scheduled_start = Column(String(64), nullable=False)
    scheduled_end = Column(String(64), nullable=False)
    gas_clearance_certified = Column(Boolean, default=False)
    loto_applied = Column(Boolean, default=True)

class IncidentModel(Base):
    __tablename__ = "incidents"

    incident_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    unit = Column(String(128), nullable=False)
    date = Column(String(64), nullable=False)
    severity = Column(String(32), default="HIGH")
    root_cause = Column(Text, nullable=False)
    corrective_action = Column(Text, nullable=False)
    similarity_score = Column(Float, default=0.8)

class RiskAssessmentModel(Base):
    __tablename__ = "risk_assessments"

    assessment_id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(String(64), nullable=False)
    plant_id = Column(String(64), nullable=False)
    unit_name = Column(String(128), nullable=False)
    zone_id = Column(String(32), index=True)
    zone_name = Column(String(128), nullable=False)
    compound_risk_score = Column(Float, nullable=False)
    risk_velocity = Column(Float, default=0.0)
    risk_level = Column(String(32), nullable=False)
    confidence_score = Column(Float, default=0.95)
    four_questions = Column(JSON, nullable=False)
    contributing_factors = Column(JSON, nullable=False)
    status = Column(String(32), default="UNRESOLVED")

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(Float, default=time.time, index=True)
    actor_id = Column(String(64), nullable=False)
    action = Column(String(128), nullable=False)
    resource_id = Column(String(64), nullable=False)
    details = Column(JSON, nullable=True)
    sha256_hash = Column(String(64), nullable=False)
