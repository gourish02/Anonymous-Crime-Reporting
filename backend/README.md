# AI Crime Classifier & Risk Assessment Engine

A high-performance machine learning backend built with **Python**, **FastAPI**, and **Scikit-Learn** for the Anonymous Crime Reporting DApp on Midnight Blockchain.

---

## 🎯 Overview

The AI Crime Classifier analyzes unstructured crime incident descriptions to predict:
1. **Crime Category**: Classifies into one of 5 supported categories.
2. **Assessed Risk Level**: Multi-factor threat rating (`Low`, `Medium`, `High`, `Critical`).
3. **Confidence Score**: Calibrated probability between 0.0 and 1.0 (0% to 100%).
4. **Class Probabilities**: Full distribution across all categories.
5. **Detected Indicators**: Threat keywords, weapon mentions, or urgency factors.

---

## 🛡️ Supported Crime Categories

| Category | Icon | ID | Default Baseline Risk | Scope & Examples |
|---|:---:|:---:|:---:|---|
| **Theft** | 🔓 | `1` | Medium | Burglary, robbery, vehicle theft, pickpocketing, stolen property. |
| **Assault** | ⚠️ | `2` | High | Physical violence, battery, mugging, knife/gun threats, fights. |
| **Cyber Crime** | 💻 | `3` | High | Ransomware, database breaches, hacking, phishing, credential theft. |
| **Fraud** | 💳 | `4` | Medium | Wire fraud, identity theft, credit card skimmers, Ponzi schemes. |
| **Vandalism** | 🪓 | `5` | Low | Property damage, graffiti defacement, smashed glass, slashed tires. |

---

## 🧠 Model Architecture & Pipeline

- **Feature Extraction**: `TfidfVectorizer` (unigrams + bigrams, sublinear TF scaling, max 10,000 features, English stopword removal).
- **Classification Model**: Multi-class `LogisticRegression` with calibrated probabilities and class-balanced weights.
- **Evaluation**: 5-fold `StratifiedKFold` cross-validation tracking Accuracy, Macro Precision, Recall, and F1 score.
- **Confidence Calibration**: Multi-class temperature scaling ($T = 0.5$) for sharp, intuitive probability separation.
- **Risk Assessment Engine**:
  - Base category risk weight
  - Critical threat indicators (`knife`, `gun`, `shooting`, `bleeding`, `hospital`, `hostage`, `arson`)
  - High severity modifiers (`punched`, `beaten`, `ransomware`, `fracture`, `wire transfer`)
  - Low severity modifiers (`graffiti`, `spray paint`, `scratched`, `minor`)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Train the Model Pipeline
```bash
python backend/train.py
# or using npm shortcut
npm run ai:train
```
Artifacts will be written to `backend/model/crime_classifier.joblib` and `backend/model/model_meta.json`.

### 3. Start the FastAPI Server
```bash
python backend/run.py
# or using npm shortcut
npm run ai:server
```
The server will start at `http://localhost:8000`.
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

### 4. Run Unit & Integration Tests
```bash
python backend/test_classifier.py
python backend/test_api.py
# or using npm shortcut
npm run ai:test
```

---

## 📡 REST API Reference

### `POST /api/classify`
Classify a crime description.

**Request:**
```json
{
  "description": "Someone broke my car window and stole my laptop backpack from the back seat."
}
```

**Response:**
```json
{
  "category": "Theft",
  "category_id": 1,
  "category_icon": "🔓",
  "risk_level": "Medium",
  "confidence": 0.824,
  "probabilities": {
    "Theft": 0.824,
    "Assault": 0.048,
    "Cyber Crime": 0.035,
    "Fraud": 0.052,
    "Vandalism": 0.041
  },
  "risk_factors": ["broke into", "stole"],
  "explanation": "Classified as Theft with 82.4% confidence. Evaluated as Medium risk."
}
```

---

### `GET /api/categories`
Returns metadata, icons, baseline risks, and examples for all 5 categories.

### `GET /api/health`
Health check verifying model status and Scikit-Learn environment.

### `GET /api/stats`
Returns cross-validation metrics, class counts, and top feature keywords per class.

### `POST /api/retrain`
Programmatically re-runs the training pipeline and hot-reloads the active model.

---

## 🌐 Frontend Integration

The React + TypeScript frontend connects to this backend via `src/api/aiClassifier.ts`:
- **Real-Time Assistant**: Embedded in `SubmitReportPage.tsx` with live classification, category auto-suggestion, and animated confidence meters.
- **Dedicated Playground**: Accessible at `/classifier` via `AIClassifierPage.tsx`.
- **Fault-Tolerant Resilience**: If the Python service is offline, the frontend seamlessly engages an integrated client-side ML heuristic fallback.
