"""
CardioAI — ML Prediction Service
Loads advanced_heart_model.pkl (XGBoost) + advanced_scaler.pkl (StandardScaler).
Falls back to a calibrated heuristic when model files are absent (dev/demo mode).
"""

import os
import logging
import numpy as np
import joblib
from pathlib import Path
from typing import Tuple, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Feature order MUST match training data column order
FEATURE_COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal",
]

RISK_THRESHOLDS = {
    "Low":      (0.00, 0.40),
    "Moderate": (0.40, 0.65),
    "High":     (0.65, 1.01),
}


class CardiacMLService:
    """
    Singleton service for cardiac disease probability prediction.

    Priority:
      1. XGBoost model (advanced_heart_model.pkl) +
         StandardScaler (advanced_scaler.pkl)
      2. Calibrated heuristic fallback (no external files required)
    """

    def __init__(self):
        self.model  = None
        self.scaler = None
        self._load_artifacts()

    # ──────────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _load_artifacts(self) -> None:
        model_path  = Path(settings.MODEL_PATH)
        scaler_path = Path(settings.SCALER_PATH)

        if model_path.exists():
            try:
                self.model = joblib.load(model_path)
                logger.info("✅  XGBoost model loaded from %s", model_path)
            except Exception as exc:
                logger.error("❌  Model load failed: %s", exc)

        if scaler_path.exists():
            try:
                self.scaler = joblib.load(scaler_path)
                logger.info("✅  Scaler loaded from %s", scaler_path)
            except Exception as exc:
                logger.error("❌  Scaler load failed: %s", exc)

        if self.model is None:
            logger.warning(
                "⚠️   Model not found at '%s'. "
                "Heuristic fallback is active (demo mode).",
                model_path,
            )

    def _preprocess(self, features: np.ndarray) -> np.ndarray:
        """Apply scaler if available, else return raw features."""
        if self.scaler is not None:
            return self.scaler.transform(features)
        return features

    # ── Heuristic fallback ────────────────────────────────────────────────────

    def _heuristic_fallback(self, raw: list) -> Tuple[float, float]:
        """
        Calibrated risk heuristic based on AHA / ESC guidelines.
        Returns (raw_score 0-1, probability 0-1).
        """
        (age, sex, cp, trestbps, chol, fbs,
         restecg, thalach, exang, oldpeak, slope, ca, thal) = raw

        score = 0.0

        # Age
        if age >= 65:   score += 3.0
        elif age >= 55: score += 2.0
        elif age >= 45: score += 1.0

        # Sex (male higher risk)
        score += 1.0 if sex == 1 else 0.0

        # Chest pain type (0=typical angina is highest risk)
        score += {0: 3.0, 1: 2.0, 2: 1.5, 3: 0.5}.get(int(cp), 0)

        # Blood pressure
        if trestbps > 160:  score += 2.5
        elif trestbps > 140: score += 1.5
        elif trestbps > 120: score += 0.5

        # Cholesterol
        if chol > 300:    score += 2.0
        elif chol > 240:  score += 1.0

        # Fasting blood sugar
        score += 1.0 if fbs == 1 else 0.0

        # Max heart rate — low is bad
        if thalach < 90:  score += 3.0
        elif thalach < 120: score += 2.0
        elif thalach < 140: score += 1.0

        # Exercise-induced angina
        score += 2.0 if exang == 1 else 0.0

        # ST depression
        if oldpeak > 3.0:   score += 3.0
        elif oldpeak > 2.0: score += 2.0
        elif oldpeak > 1.0: score += 1.0

        # ST slope (0=upsloping better, 2=downsloping worse)
        score += {0: 0.0, 1: 1.0, 2: 2.5}.get(int(slope), 0)

        # Major vessels
        score += min(ca, 3) * 2.0

        # Thalassemia (3=reversible defect is worst)
        score += {0: 0.0, 1: 0.5, 2: 0.0, 3: 3.0}.get(int(thal), 0)

        # Normalise to 0-1 via sigmoid-like mapping (max ~30 points)
        probability = min(score / 28.0, 0.99)
        return probability

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────

    def predict(self, features: list) -> dict:
        """
        Run cardiac disease prediction.

        Args:
            features: list of 13 values ordered as FEATURE_COLUMNS

        Returns:
            {
                "risk_probability": float,   # 0-100 (%)
                "risk_level": str,           # "Low" | "Moderate" | "High"
                "prediction": int,           # 0 = no disease, 1 = disease
                "confidence": float,         # 0-1
                "model_used": str,
            }
        """
        raw_array = np.array(features, dtype=float).reshape(1, -1)

        if self.model is not None:
            try:
                scaled = self._preprocess(raw_array)
                prediction    = int(self.model.predict(scaled)[0])
                probability   = float(self.model.predict_proba(scaled)[0][1])
                model_used    = "XGBoost (advanced_heart_model.pkl)"
            except Exception as exc:
                logger.error("⚠️  Model inference failed, using fallback: %s", exc)
                probability = self._heuristic_fallback(features)
                prediction  = 1 if probability >= 0.50 else 0
                model_used  = "Heuristic Fallback"
        else:
            probability = self._heuristic_fallback(features)
            prediction  = 1 if probability >= 0.50 else 0
            model_used  = "Heuristic Fallback (model file not found)"

        risk_level = self._classify_risk(probability)

        return {
            "risk_probability": round(probability * 100, 2),
            "risk_level":       risk_level,
            "prediction":       prediction,
            "confidence":       round(probability, 4),
            "model_used":       model_used,
        }

    @staticmethod
    def _classify_risk(probability: float) -> str:
        for level, (low, high) in RISK_THRESHOLDS.items():
            if low <= probability < high:
                return level
        return "High"

    @property
    def is_model_loaded(self) -> bool:
        return self.model is not None


# ── Singleton ─────────────────────────────────────────────────────────────────
ml_service = CardiacMLService()
