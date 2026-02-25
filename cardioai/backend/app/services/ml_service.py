import os
import joblib
import numpy as np
import logging
import pandas as pd
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class MLService:
    """Enterprise service for heart disease prediction using XGBoost."""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_model_loaded = False
        self._load_resources()

    def _load_resources(self):
        """Load trained model and scaler from artifact paths."""
        try:
            model_path = os.getenv("MODEL_PATH", "ml/advanced_heart_model.pkl")
            scaler_path = os.getenv("SCALER_PATH", "ml/advanced_scaler.pkl")
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logger.info(f"✅ Neural model loaded from {model_path}")
            
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
                logger.info(f"✅ Clinical scaler loaded from {scaler_path}")

            if self.model and self.scaler:
                self.is_model_loaded = True
            else:
                logger.warning("⚠️ ML artifacts not found. Clinical heuristic fallback active.")

        except Exception as e:
            logger.error(f"❌ Critical failure loading ML resources: {str(e)}")

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Run diagnostic inference on patient feature vector."""
        try:
            if not self.is_model_loaded:
                return self._heuristic_fallback(features)

            # Map dict to model-expected vector order
            feature_order = [
                'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
                'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'
            ]
            vector = [features.get(f, 0) for f in feature_order]
            
            # Scale and Predict
            scaled_vector = self.scaler.transform([vector])
            prob = self.model.predict_proba(scaled_vector)[0][1] * 100
            
            return {
                "risk_probability": round(float(prob), 2),
                "risk_level": self._classify_risk(prob),
                "engine": "XGBoost-v1.2",
            }
        except Exception as e:
            logger.error(f"Prediction engine fault: {str(e)}")
            return self._heuristic_fallback(features)

    def _classify_risk(self, prob: float) -> str:
        if prob >= 65: return "High"
        if prob >= 40: return "Moderate"
        return "Low"

    def _heuristic_fallback(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Safety fallback using clinical markers if model is unavailable."""
        score = 0
        if features.get('age', 0) > 60: score += 15
        if features.get('sex', 0) == 1: score += 10
        if features.get('trestbps', 0) > 140: score += 15
        if features.get('chol', 0) > 240: score += 10
        if features.get('thalach', 0) < 140: score += 10
        if features.get('cp', 0) in [3, 4]: score += 20
        
        prob = min(score, 95)
        return {
            "risk_probability": float(prob),
            "risk_level": self._classify_risk(prob),
            "engine": "Clinical-Heuristic",
        }

# Singleton instance
ml_service = MLService()
