import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def train_model():
    print("Loading dataset...")
    df = pd.read_csv(r'..\Dataset\cardio_train.csv', sep=';')
    
    # Preprocessing
    df = df.drop(columns=['id'])
    # Convert age from days to years
    df['age'] = (df['age'] / 365).round().astype(int)
    
    # Remove extreme outliers (basic cleaning for BP)
    df = df[(df['ap_hi'] >= 50) & (df['ap_hi'] <= 250)]
    df = df[(df['ap_lo'] >= 40) & (df['ap_lo'] <= 200)]
    
    X = df.drop(columns=['cardio'])
    y = df['cardio']
    
    print("Features:", X.columns.tolist())
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training XGBoost...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    model.fit(X_train_scaled, y_train)
    score = model.score(X_test_scaled, y_test)
    print(f"Accuracy: {score * 100:.2f}%")
    
    os.makedirs('ml', exist_ok=True)
    joblib.dump(model, 'ml/advanced_heart_model.pkl')
    joblib.dump(scaler, 'ml/advanced_scaler.pkl')
    print("Model and scaler saved to ml/")

if __name__ == '__main__':
    train_model()
