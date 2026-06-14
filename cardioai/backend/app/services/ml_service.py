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
        self.model_name = "Clinical-Heuristic (Fallback)"
        self._load_resources()

    def _load_resources(self):
        """Load trained model and scaler from artifact paths."""
        try:
            model_path = os.getenv("MODEL_PATH", "ml/advanced_heart_model.pkl")
            scaler_path = os.getenv("SCALER_PATH", "ml/advanced_scaler.pkl")
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.is_model_loaded = True
                self.model_name = "XGBoost (advanced_heart_model.pkl)"
                logger.info(f"✅ Model loaded from {model_path}")
                logger.info(f"✅ Scaler loaded from {scaler_path}")
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
                'age', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo', 
                'cholesterol', 'gluc', 'smoke', 'alco', 'active'
            ]
            vector = [features.get(f, 0) for f in feature_order]
            
            # Scale and Predict
            scaled_vector = self.scaler.transform([vector])
            prob = self.model.predict_proba(scaled_vector)[0][1]
            prediction = int(prob >= 0.5)
            
            return {
                "risk_probability": round(float(prob * 100), 2),
                "risk_level": self._classify_risk(prob * 100),
                "prediction": prediction,
                "confidence": round(float(prob if prediction else 1 - prob), 4),
                "model_used": self.model_name,
                "engine": "XGBoost-v1.2",
            }
        except Exception as e:
            logger.error(f"Prediction engine fault: {str(e)}")
            return self._heuristic_fallback(features)

    def _classify_risk(self, prob_percent: float) -> str:
        if prob_percent >= 65:
            return "High"
        if prob_percent >= 40:
            return "Moderate"
        return "Low"

    def _heuristic_fallback(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Safety fallback using clinical markers if model is unavailable."""
        score = 0
        if features.get('age', 0) > 60:
            score += 15
        if features.get('gender', 0) == 2:
            score += 10  # Men may have higher baseline risk, dataset uses 1=women, 2=men
        if features.get('ap_hi', 0) > 140:
            score += 15
        if features.get('ap_lo', 0) > 90:
            score += 10
        if features.get('cholesterol', 0) > 1:
            score += 15
        if features.get('gluc', 0) > 1:
            score += 10
        if features.get('smoke', 0) == 1:
            score += 10
        if features.get('active', 0) == 0:
            score += 10
        
        prob = min(score, 95) / 100
        prediction = int(prob >= 0.5)
        
        return {
            "risk_probability": round(float(prob * 100), 2),
            "risk_level": self._classify_risk(prob * 100),
            "prediction": prediction,
            "confidence": round(float(prob if prediction else 1 - prob), 4),
            "model_used": self.model_name,
            "engine": "Clinical-Heuristic",
        }

# Singleton instance
ml_service = MLService()
