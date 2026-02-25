# 🫀 CardioAI Hospital System

> **AI-powered Cardiac Disease Prediction** — FastAPI backend + React frontend, XGBoost model, PostgreSQL persistence.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal?logo=fastapi)
![XGBoost](https://img.shields.io/badge/XGBoost-2.0.3-orange)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## 📁 Project Structure

```
cardioai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py          # JWT auth endpoints
│   │   │       └── predictions.py   # /predict endpoints
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic settings (env vars)
│   │   │   └── security.py          # JWT + bcrypt utilities
│   │   ├── db/
│   │   │   └── database.py          # Async SQLAlchemy engine
│   │   ├── models/
│   │   │   └── models.py            # ORM models (User, Prediction)
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic request/response schemas
│   │   └── services/
│   │       └── ml_service.py        # XGBoost inference + heuristic fallback
│   ├── ml/                          # .pkl model files (auto-generated)
│   │   ├── advanced_heart_model.pkl
│   │   └── advanced_scaler.pkl
│   ├── scripts/
│   │   └── train_model.py           # XGBoost training script
│   ├── .env                         # ← Copy from .env.example & fill in
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/ui/Layout.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PredictPage.jsx      # 13-feature cardiac form
│   │   │   └── HistoryPage.jsx      # Paginated prediction history
│   │   ├── services/api.js          # Axios client + API helpers
│   │   ├── store/authStore.js       # Zustand auth state
│   │   └── App.jsx                  # React Router routes
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
│   └── nginx.conf                   # Reverse proxy config
└── docker-compose.yml               # Full-stack orchestration
```

---

## 🚀 Quick Start

### Option A — Local Development (No Docker)

#### 1. Train the ML model

```bash
cd backend
pip install -r requirements.txt
python scripts/train_model.py
# Saves: ml/advanced_heart_model.pkl  +  ml/advanced_scaler.pkl
```

#### 2. Configure environment

```bash
cp .env.example .env
# Edit DATABASE_URL and SECRET_KEY in .env
```

#### 3. Start PostgreSQL (if not running)

```bash
docker run -d \
  --name cardioai_db \
  -e POSTGRES_USER=cardioai_user \
  -e POSTGRES_PASSWORD=cardioai_password \
  -e POSTGRES_DB=cardioai_db \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 4. Start the FastAPI backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API available at: http://localhost:8000  
Swagger docs: http://localhost:8000/api/docs  
ReDoc docs: http://localhost:8000/api/redoc

#### 5. Start the React frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:5173

---

### Option B — Docker Compose (Recommended)

```bash
# From project root
docker compose up --build

# OR with Nginx reverse proxy (production profile)
docker compose --profile production up --build
```

Services:
| Service  | URL                    |
|----------|------------------------|
| Backend  | http://localhost:8000  |
| Frontend | http://localhost:3000  |
| Nginx    | http://localhost:80    |
| DB       | localhost:5432         |

---

## 🔌 API Reference

### Authentication

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | `/api/v1/auth/register`   | Create account       |
| POST   | `/api/v1/auth/login`      | Get JWT token        |
| GET    | `/api/v1/auth/me`         | Get current user     |
| POST   | `/api/v1/auth/logout`     | Logout               |

### Predictions

| Method | Endpoint                            | Auth | Description                  |
|--------|-------------------------------------|------|------------------------------|
| POST   | `/api/v1/predictions/predict`       | ✅   | Predict + save to DB         |
| POST   | `/api/v1/predictions/predict/guest` | ❌   | Predict without saving       |
| GET    | `/api/v1/predictions/`              | ✅   | List prediction history      |
| GET    | `/api/v1/predictions/stats`         | ✅   | Dashboard statistics         |
| GET    | `/api/v1/predictions/{id}`          | ✅   | Get single prediction        |
| DELETE | `/api/v1/predictions/{id}`          | ✅   | Delete prediction            |

### System

| Method | Endpoint       | Description       |
|--------|----------------|-------------------|
| GET    | `/api/health`  | Health check      |
| GET    | `/api/docs`    | Swagger UI        |
| GET    | `/api/redoc`   | ReDoc UI          |

---

## 📊 Request Payload — POST `/api/v1/predictions/predict`

```json
{
  "patient_name":   "Ramesh Kumar",
  "patient_gender": "Male",
  "age":      52,
  "sex":       1,
  "cp":        2,
  "trestbps": 130,
  "chol":     250,
  "fbs":        0,
  "restecg":    1,
  "thalach":  153,
  "exang":      0,
  "oldpeak":  1.4,
  "slope":      1,
  "ca":         0,
  "thal":       2,
  "notes":    "Optional clinical notes"
}
```

### Response

```json
{
  "risk_probability": 34.72,
  "risk_level":       "Low",
  "prediction":       0,
  "confidence":       0.3472,
  "model_used":       "XGBoost (advanced_heart_model.pkl)",
  "patient_name":     "Ramesh Kumar",
  "patient_gender":   "Male",
  "age": 52, "sex": 1, "cp": 2,
  "timestamp":        "2026-02-25T18:34:30"
}
```

### Risk Classification

| Level    | Probability |
|----------|-------------|
| Low      | < 40%       |
| Moderate | 40 – 65%    |
| High     | ≥ 65%       |

---

## 🤖 ML Model

- **Algorithm**: XGBoost Classifier
- **Features**: 13 Cleveland Heart Disease dataset features
- **Training**: `scripts/train_model.py` generates synthetic Cleveland-distribution data (n=3000), fits StandardScaler, trains XGBoost, and saves both artifacts to `ml/`
- **Fallback**: If `.pkl` files are missing, the service uses a calibrated AHA/ESC-guideline heuristic (demo mode)
- **Model files**: `ml/advanced_heart_model.pkl` + `ml/advanced_scaler.pkl`

---

## 🔒 Environment Variables

| Variable                     | Default                              | Description                            |
|------------------------------|--------------------------------------|----------------------------------------|
| `DATABASE_URL`               | postgresql+asyncpg://…               | Async PostgreSQL connection string     |
| `DATABASE_URL_SYNC`          | postgresql://…                       | Sync PostgreSQL connection string      |
| `SECRET_KEY`                 | (set this!)                          | JWT signing secret                     |
| `ALGORITHM`                  | HS256                                | JWT algorithm                          |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| 60                                   | Token TTL in minutes                   |
| `ALLOWED_ORIGINS`            | http://localhost:3000,…              | CORS allowed origins (comma-separated) |
| `MODEL_PATH`                 | ml/advanced_heart_model.pkl          | Path to XGBoost model                  |
| `SCALER_PATH`                | ml/advanced_scaler.pkl               | Path to StandardScaler                 |
| `DEBUG`                      | False                                | Enable SQLAlchemy echo + debug logs    |

---

## 🚀 Enterprise Features

- **🛡️ Clinical JWT Authentication**: Secure staff onboarding and login system with cryptographically protected sessions.
- **🏥 Multi-Module UI**: High-fidelity React frontend with Framer Motion animations and glassmorphism.
- **🤖 XGBoost Inference Engine**: Predictive cardiac diagnostics with real-time risk classification.
- **📊 Hospital Intelligence Hub**: Advanced analytics dashboard with patient records and staff oversight.
- **🔐 Role-Based Access (RBAC)**: Distinct permissions for **Doctors** and **Administrators**.

## 🔑 Admin Credentials
The system automatically promotes the following user to **Administrator** status upon registration:
- **Email**: `odhumkekar@gmail.com`
- **Permissions**: Full access to the Patient Analytics and Staff Directory.

## 🛠️ Local Development

### 1. Backend Setup (FastAPI)
1. Navigate to `/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Create a `.env` file (see `.env.example`).
4. Run server: `python -m uvicorn app.main:app --reload`.

### 2. Frontend Setup (React + Vite)
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Run dev server: `npm run dev`.
