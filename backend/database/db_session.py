"""
In-memory and state database manager for Nexora Industrial Platform.
Initializes and maintains live state for Machines, Workers, Permits, Sensors, Incidents, and Risk Assessments.
"""

from typing import List, Dict, Any
from backend.schemas.api_schemas import (
    WorkerSchema, PermitSchema, SensorTelemetrySchema, IncidentSchema
)

class DatabaseSession:
    def __init__(self):
        self.workers: List[Dict[str, Any]] = [
            {
                "id": "W-804",
                "name": "Vikram Sharma",
                "role": "Senior Maintenance Technician",
                "zone_id": "ZONE-B4",
                "shift_hours_active": 11.2,
                "ppe_compliant": False,
                "certifications": ["Hot Work Level 2", "Confined Space Entry"],
                "assigned_permit_id": "PTW-2026-8409",
                "vital_status": "ELEVATED_HEART_RATE"
            },
            {
                "id": "W-809",
                "name": "Rajesh Kumar",
                "role": "Welding Specialist",
                "zone_id": "ZONE-B4",
                "shift_hours_active": 11.2,
                "ppe_compliant": True,
                "certifications": ["Flame Cutting Certified", "Rigging Level 1"],
                "assigned_permit_id": "PTW-2026-8409",
                "vital_status": "NORMAL"
            },
            {
                "id": "W-302",
                "name": "Priya Nair",
                "role": "Field Operations Inspector",
                "zone_id": "ZONE-A1",
                "shift_hours_active": 4.5,
                "ppe_compliant": True,
                "certifications": ["Safety Audit Level 3"],
                "assigned_permit_id": None,
                "vital_status": "NORMAL"
            }
        ]

        self.permits: List[Dict[str, Any]] = [
            {
                "permit_id": "PTW-2026-8409",
                "type": "HOT_WORK",
                "zone_id": "ZONE-B4",
                "zone_name": "Reactor Feed Area B4",
                "status": "PENDING_APPROVAL",
                "applicant": "Vikram Sharma (W-804)",
                "supervisor": "Karan Mehta (Safety Officer)",
                "description": "Pipe flange welding & cutting on Hydrocracker Charge Pump P-102 feed line",
                "risk_level": "CRITICAL",
                "scheduled_start": "2026-07-22T08:00:00Z",
                "scheduled_end": "2026-07-22T16:00:00Z",
                "gas_clearance_certified": False,
                "loto_applied": True
            },
            {
                "permit_id": "PTW-2026-8410",
                "type": "CONFINED_SPACE",
                "zone_id": "ZONE-C2",
                "zone_name": "Separator Vessel V-401",
                "status": "APPROVED",
                "applicant": "Priya Nair (W-302)",
                "supervisor": "Karan Mehta (Safety Officer)",
                "description": "Internal vessel wall ultrasonic thickness inspection",
                "risk_level": "WARNING",
                "scheduled_start": "2026-07-22T09:30:00Z",
                "scheduled_end": "2026-07-22T13:30:00Z",
                "gas_clearance_certified": True,
                "loto_applied": True
            }
        ]

        self.sensors: List[Dict[str, Any]] = [
            {
                "sensor_id": "G-104",
                "sensor_name": "LEL Gas Sensor B4-04",
                "type": "GAS_LEL",
                "value": 22.4,
                "unit": "% LEL",
                "baseline_min": 0.0,
                "baseline_max": 5.0,
                "threshold_warning": 10.0,
                "threshold_critical": 20.0,
                "status": "CRITICAL",
                "last_updated": "10s ago",
                "zone_id": "ZONE-B4",
                "trend": "RISING"
            },
            {
                "sensor_id": "P-201",
                "sensor_name": "Reactor Feed Pressure Transducer",
                "type": "PRESSURE",
                "value": 142.8,
                "unit": "Bar",
                "baseline_min": 110.0,
                "baseline_max": 135.0,
                "threshold_warning": 138.0,
                "threshold_critical": 145.0,
                "status": "WARNING",
                "last_updated": "5s ago",
                "zone_id": "ZONE-B4",
                "trend": "RISING"
            },
            {
                "sensor_id": "V-102",
                "sensor_name": "Charge Pump P-102 Vibration Spectral Sensor",
                "type": "VIBRATION",
                "value": 8.4,
                "unit": "mm/s",
                "baseline_min": 0.5,
                "baseline_max": 2.5,
                "threshold_warning": 4.5,
                "threshold_critical": 7.0,
                "status": "CRITICAL",
                "last_updated": "2s ago",
                "zone_id": "ZONE-B4",
                "trend": "RISING"
            }
        ]

        self.incidents: List[Dict[str, Any]] = [
            {
                "incident_id": "INC-2021-04-12",
                "title": "Hydrocracker Unit Vapor Cloud Explosion",
                "unit": "Refinery West (Jamnagar Complex)",
                "date": "12 April 2021",
                "severity": "CRITICAL",
                "root_cause": "Ignition of flammable hydrocarbon vapor cloud released during hot work maintenance on recirculation pump seal flange under high LEL conditions (24% LEL).",
                "corrective_action": "Mandatory real-time SCADA gas telemetry correlation with digital work permit system before permit issuance.",
                "similarity_score": 0.89
            },
            {
                "incident_id": "INC-2018-11-03",
                "title": "Chemical Plant Flash Fire",
                "unit": "Ethylene Unit (Vadodara Plant)",
                "date": "03 November 2018",
                "severity": "HIGH",
                "root_cause": "Uncontrolled grinding on pressurized line without valid work permit during shift changeover under crew fatigue conditions.",
                "corrective_action": "Strict automated permit locking during shift changeover and fatigue monitoring.",
                "similarity_score": 0.76
            }
        ]

db = DatabaseSession()
