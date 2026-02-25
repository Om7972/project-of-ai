#!/usr/bin/env python3
"""
CardioAI — XGBoost Model Training Script
=========================================
Trains on UCI Cleveland Heart Disease features and saves:
  • ml/advanced_heart_model.pkl  — XGBoostClassifier
  • ml/advanced_scaler.pkl       — StandardScaler

Usage:
    cd backend
    python scripts/train_model.py
"""

import sys
import numpy as np
import pandas as pd
from pathlib import Path

# ── Attempt imports ───────────────────────────────────────────────────────────
try:
    from xgboost import XGBClassifier
    from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import (
        accuracy_score, roc_auc_score,
        classification_report, confusion_matrix,
    )
    import joblib
except ImportError as e:
    print(f"❌  Missing dependency: {e}")
    print("    Run: pip install -r requirements.txt")
    sys.exit(1)


# ══════════════════════════════════════════════════════════════════════════════
#  Synthetic dataset (Cleveland-distribution)
# ══════════════════════════════════════════════════════════════════════════════

def generate_dataset(n: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    df = pd.DataFrame({
        "age":      rng.integers(29, 77, n),
        "sex":      rng.choice([0, 1], n, p=[0.32, 0.68]),
        "cp":       rng.choice([0, 1, 2, 3], n, p=[0.47, 0.17, 0.28, 0.08]),
        "trestbps": rng.integers(94, 200, n),
        "chol":     rng.integers(126, 564, n),
        "fbs":      rng.choice([0, 1], n, p=[0.85, 0.15]),
        "restecg":  rng.choice([0, 1, 2], n, p=[0.48, 0.49, 0.03]),
        "thalach":  rng.integers(71, 202, n),
        "exang":    rng.choice([0, 1], n, p=[0.67, 0.33]),
        "oldpeak":  np.round(rng.uniform(0, 6.2, n), 1),
        "slope":    rng.choice([0, 1, 2], n, p=[0.21, 0.47, 0.32]),
        "ca":       rng.choice([0, 1, 2, 3, 4], n, p=[0.58, 0.22, 0.12, 0.06, 0.02]),
        "thal":     rng.choice([0, 1, 2, 3], n, p=[0.02, 0.06, 0.72, 0.20]),
    })

    # Realistic label from AHA risk factors
    risk = (
        (df["age"] >= 55).astype(float) * 2.5 +
        df["sex"].astype(float) * 1.0 +
        df["cp"].map({0: 3.0, 1: 2.0, 2: 1.5, 3: 0.5}) +
        ((df["trestbps"] - 120).clip(lower=0) / 30) +
        ((df["chol"] - 200).clip(lower=0) / 80) +
        df["fbs"].astype(float) * 1.0 +
        ((140 - df["thalach"]).clip(lower=0) / 20) * 2.0 +
        df["exang"].astype(float) * 2.0 +
        df["oldpeak"].clip(upper=5) * 0.8 +
        df["slope"].map({0: 0.0, 1: 0.5, 2: 2.0}) +
        df["ca"].clip(upper=3) * 1.5 +
        df["thal"].map({0: 0.0, 1: 0.5, 2: 0.0, 3: 2.5})
    )

    noise = rng.normal(0, 1.2, n)
    prob  = 1 / (1 + np.exp(-(risk - 7 + noise)))
    df["target"] = (prob > 0.50).astype(int)

    # Ensure ~54% positive rate (Cleveland dataset mean)
    print(f"   Target distribution: {df['target'].value_counts().to_dict()}")
    return df


# ══════════════════════════════════════════════════════════════════════════════
#  Training
# ══════════════════════════════════════════════════════════════════════════════

FEATURE_COLS = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal",
]

def train():
    print("\n" + "═" * 60)
    print("  CardioAI — XGBoost Model Training")
    print("═" * 60)

    # 1. Generate data
    print("\n📊  Generating synthetic dataset (n=3000) …")
    df = generate_dataset(n=3000)
    X  = df[FEATURE_COLS].values
    y  = df["target"].values

    # 2. Scale features
    print("📐  Fitting StandardScaler …")
    scaler    = StandardScaler()
    X_scaled  = scaler.fit_transform(X)

    # 3. Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42, stratify=y
    )

    # 4. XGBoost — tuned hyperparameters
    print("🤖  Training XGBoost classifier …")
    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.05,
        reg_lambda=1.0,
        scale_pos_weight=1,
        eval_metric="logloss",
        use_label_encoder=False,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    # 5. Evaluate
    y_pred  = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    acc     = accuracy_score(y_test, y_pred)
    auc     = roc_auc_score(y_test, y_proba)

    print(f"\n📈  Test Accuracy : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"📈  ROC-AUC Score : {auc:.4f}")
    print("\n" + classification_report(y_test, y_pred,
                                       target_names=["No Disease", "Disease"]))

    # 6. Cross-validation
    cv_scores = cross_val_score(
        XGBClassifier(
            n_estimators=300, max_depth=6, learning_rate=0.08,
            eval_metric="logloss", use_label_encoder=False, random_state=42,
        ),
        X_scaled, y,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring="accuracy",
    )
    print(f"📊  5-Fold CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # 7. Save artifacts
    out_dir = Path(__file__).resolve().parent.parent / "ml"
    out_dir.mkdir(exist_ok=True)

    model_path  = out_dir / "advanced_heart_model.pkl"
    scaler_path = out_dir / "advanced_scaler.pkl"

    joblib.dump(model,  model_path,  compress=3)
    joblib.dump(scaler, scaler_path, compress=3)

    print(f"\n💾  Model  saved → {model_path}")
    print(f"💾  Scaler saved → {scaler_path}")
    print("\n✅  Training complete!\n")


if __name__ == "__main__":
    train()
