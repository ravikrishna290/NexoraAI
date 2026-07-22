"""
Backend Dataset Service
Parses AI4I 2020 Predictive Maintenance & Smoke/Fire IoT datasets directly from CSV files.
Provides real-time machine health records, smoke/fire data streams, and synthesized PPE events.
"""

import os
import csv
import math
from typing import List, Dict, Any, Optional

class DatasetService:
    def __init__(self):
        self.ai4i_records: List[Dict[str, Any]] = []
        self.smoke_records: List[Dict[str, Any]] = []
        self.ai4i_index = 0
        self.smoke_index = 0
        
        self._load_ai4i_dataset()
        self._load_smoke_dataset()

    def _load_ai4i_dataset(self):
        path = os.path.join("Datasets", "ai4i+2020+predictive+maintenance+dataset", "ai4i2020.csv")
        if not os.path.exists(path):
            print(f"[DatasetService] Warning: {path} not found.")
            return

        with open(path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    udi_key = [k for k in row.keys() if "UDI" in k][0]
                    self.ai4i_records.append({
                        "udi": int(row[udi_key]),
                        "product_id": row["Product ID"],
                        "type": row["Type"],
                        "air_temp_k": float(row["Air temperature [K]"]),
                        "process_temp_k": float(row["Process temperature [K]"]),
                        "rpm": int(float(row["Rotational speed [rpm]"])),
                        "torque_nm": float(row["Torque [Nm]"]),
                        "tool_wear_min": int(float(row["Tool wear [min]"])),
                        "machine_failure": int(row["Machine failure"]),
                        "twf": int(row["TWF"]),
                        "hdf": int(row["HDF"]),
                        "pwf": int(row["PWF"]),
                        "osf": int(row["OSF"]),
                        "rnf": int(row["RNF"]),
                    })
                except Exception:
                    continue

        print(f"[DatasetService] Loaded {len(self.ai4i_records)} AI4I records.")

    def _load_smoke_dataset(self):
        path = os.path.join("Datasets", "archive (3)", "smoke_detection_iot.csv")
        if not os.path.exists(path):
            print(f"[DatasetService] Warning: {path} not found.")
            return

        with open(path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                try:
                    self.smoke_records.append({
                        "temp_c": float(row["Temperature[C]"]),
                        "humidity": float(row["Humidity[%]"]),
                        "tvoc_ppb": float(row["TVOC[ppb]"]),
                        "eco2_ppm": float(row["eCO2[ppm]"]),
                        "pm25": float(row["PM2.5"]),
                        "pressure": float(row["Pressure[hPa]"]),
                        "fire_alarm": int(row["Fire Alarm"]),
                    })
                    count += 1
                    if count >= 2000:  # Cap at 2000 records for memory efficiency
                        break
                except Exception:
                    continue

        print(f"[DatasetService] Loaded {len(self.smoke_records)} Smoke IoT records.")

    def get_machine_health(self, asset_id: str = "PUMP-P102") -> Dict[str, Any]:
        if not self.ai4i_records:
            return self._fallback_machine_health(asset_id)

        rec = self.ai4i_records[self.ai4i_index % len(self.ai4i_records)]
        self.ai4i_index += 1

        process_temp_c = round(rec["process_temp_k"] - 273.15, 1)
        air_temp_c = round(rec["air_temp_k"] - 273.15, 1)

        torque_dev = abs(rec["torque_nm"] - 40.0) / 40.0
        wear_factor = min(1.0, rec["tool_wear_min"] / 200.0)
        health_score = max(5.0, round(100.0 - (wear_factor * 50.0) - (torque_dev * 30.0) - (rec["machine_failure"] * 35.0), 1))

        failure_prob = round(75.0 + (rec["machine_failure"] * 20.0), 1) if rec["machine_failure"] else round(max(2.0, (1.0 - health_score / 100.0) * 60.0), 1)
        rul = round(max(0, 14 if rec["machine_failure"] else (200 - rec["tool_wear_min"]) * 0.8), 0)

        failure_mode = None
        if rec["twf"]: failure_mode = "Tool Wear Failure (TWF)"
        elif rec["hdf"]: failure_mode = "Heat Dissipation Failure (HDF)"
        elif rec["pwf"]: failure_mode = "Power Failure (PWF)"
        elif rec["osf"]: failure_mode = "Overstrain Failure (OSF)"
        elif rec["rnf"]: failure_mode = "Random Failure (RNF)"

        return {
            "asset_id": asset_id,
            "name": "Hydrocracker Feed Charge Pump P-102" if asset_id == "PUMP-P102" else f"Machine {rec['product_id']}",
            "product_id": rec["product_id"],
            "category": "PUMP",
            "zone_id": "ZONE-B4",
            "status": "CRITICAL" if health_score < 50 else ("WARNING" if health_score < 75 else "SAFE"),
            "health_score": health_score,
            "air_temp_c": air_temp_c,
            "process_temp_c": process_temp_c,
            "rpm": rec["rpm"],
            "torque_nm": rec["torque_nm"],
            "tool_wear_min": rec["tool_wear_min"],
            "vibration_mm_sec": 8.4 if rec["machine_failure"] else 2.1,
            "operating_hours": 14200,
            "failure_probability": failure_prob,
            "remaining_useful_life": int(rul),
            "failure_mode": failure_mode,
            "machine_failure": bool(rec["machine_failure"]),
        }

    def get_smoke_fire_snapshot(self) -> Dict[str, Any]:
        if not self.smoke_records:
            return {"temp_c": 22.4, "humidity": 55.0, "tvoc_ppb": 12, "eco2_ppm": 400, "pm25": 1.2, "fire_alarm": False, "smoke_level": "NONE"}

        rec = self.smoke_records[self.smoke_index % len(self.smoke_records)]
        self.smoke_index += 1

        is_fire = rec["fire_alarm"] == 1
        smoke_level = "NONE"
        if is_fire:
            smoke_level = "CRITICAL" if rec["tvoc_ppb"] > 5000 else "HIGH"

        return {
            "temp_c": rec["temp_c"],
            "humidity": rec["humidity"],
            "tvoc_ppb": rec["tvoc_ppb"],
            "eco2_ppm": rec["eco2_ppm"],
            "pm25": rec["pm25"],
            "fire_alarm": is_fire,
            "smoke_level": smoke_level
        }

    def _fallback_machine_health(self, asset_id: str) -> Dict[str, Any]:
        return {
            "asset_id": asset_id,
            "name": "Hydrocracker Feed Charge Pump P-102",
            "product_id": "M14865",
            "category": "PUMP",
            "zone_id": "ZONE-B4",
            "status": "CRITICAL",
            "health_score": 42.0,
            "air_temp_c": 25.0,
            "process_temp_c": 35.5,
            "rpm": 1425,
            "torque_nm": 41.9,
            "tool_wear_min": 184,
            "vibration_mm_sec": 8.4,
            "operating_hours": 14200,
            "failure_probability": 88.0,
            "remaining_useful_life": 14,
            "failure_mode": "Overstrain Failure (OSF)",
            "machine_failure": True
        }

dataset_service = DatasetService()
