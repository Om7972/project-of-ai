import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

FEATURE_LABELS = {
    "age": "Age",
    "gender": "Gender",
    "height": "Height (cm)",
    "weight": "Weight (kg)",
    "ap_hi": "Systolic BP",
    "ap_lo": "Diastolic BP",
    "cholesterol": "Cholesterol Level",
    "gluc": "Glucose Level",
    "smoke": "Smoking",
    "alco": "Alcohol Intake",
    "active": "Physical Activity",
}

FEATURE_ORDER = list(FEATURE_LABELS.keys())


def _heuristic_contributions(features: Dict[str, Any]) -> List[Dict[str, Any]]:
    weights = {
        "age": 0.15 if features.get("age", 0) > 55 else 0.05,
        "gender": 0.10 if features.get("gender") == 2 else 0.03,
        "ap_hi": 0.18 if features.get("ap_hi", 0) > 140 else 0.04,
        "ap_lo": 0.12 if features.get("ap_lo", 0) > 90 else 0.03,
        "cholesterol": 0.14 if features.get("cholesterol", 0) > 1 else 0.02,
        "gluc": 0.10 if features.get("gluc", 0) > 1 else 0.02,
        "smoke": 0.12 if features.get("smoke") == 1 else 0.0,
        "active": 0.10 if features.get("active") == 0 else -0.05,
        "height": 0.02,
        "weight": 0.04 if features.get("weight", 0) > 100 else 0.01,
        "alco": 0.06 if features.get("alco") == 1 else 0.0,
    }
    total = sum(abs(v) for v in weights.values()) or 1
    contributions = []
    for feat in FEATURE_ORDER:
        val = weights.get(feat, 0)
        contributions.append({
            "feature": feat,
            "label": FEATURE_LABELS[feat],
            "value": features.get(feat),
            "contribution": round(val / total * 100, 2),
            "direction": "increases_risk" if val > 0 else "decreases_risk" if val < 0 else "neutral",
        })
    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return contributions


def explain_prediction(features: Dict[str, Any], ml_service) -> Dict[str, Any]:
    """Compute SHAP values when model loaded, else heuristic feature weights."""
    if ml_service.is_model_loaded and ml_service.model is not None:
        try:
            import shap
            import numpy as np

            vector = [[features.get(f, 0) for f in FEATURE_ORDER]]
            scaled = ml_service.scaler.transform(vector)
            explainer = shap.TreeExplainer(ml_service.model)
            shap_values = explainer.shap_values(scaled)
            if isinstance(shap_values, list):
                vals = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
            else:
                vals = shap_values[0]

            total = sum(abs(float(v)) for v in vals) or 1
            contributions = []
            for i, feat in enumerate(FEATURE_ORDER):
                c = float(vals[i])
                contributions.append({
                    "feature": feat,
                    "label": FEATURE_LABELS[feat],
                    "value": features.get(feat),
                    "contribution": round(abs(c) / total * 100, 2),
                    "direction": "increases_risk" if c > 0 else "decreases_risk" if c < 0 else "neutral",
                    "shap_value": round(c, 4),
                })
            contributions.sort(key=lambda x: x["contribution"], reverse=True)
            summary = _build_summary(contributions, features)
            return {"method": "SHAP TreeExplainer", "contributions": contributions, "summary": summary}
        except Exception as e:
            logger.warning("SHAP failed, using heuristic: %s", e)

    contributions = _heuristic_contributions(features)
    return {
        "method": "Clinical Heuristic Weights",
        "contributions": contributions,
        "summary": _build_summary(contributions, features),
    }


def _build_summary(contributions: List[Dict], features: Dict) -> str:
    top = [c for c in contributions if c["direction"] == "increases_risk"][:3]
    if not top:
        return "No significant risk-elevating markers detected in this assessment."
    labels = [c["label"] for c in top]
    return f"Primary risk drivers: {', '.join(labels)}. Review these clinical markers with the patient."
