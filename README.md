# 🛡️ Credit Card Fraud Detection - MLOps Pipeline

[![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.127.0-009688.svg)](https://fastapi.tiangolo.com/)
[![MLflow](https://img.shields.io/badge/MLflow-3.8.0-0194E2.svg)](https://mlflow.org/)
[![DVC](https://img.shields.io/badge/DVC-enabled-945DD6.svg)](https://dvc.org/)

A complete end-to-end MLOps pipeline for credit card fraud detection using **Random Forest**, with experiment tracking via **MLflow**, data versioning with **DVC**, and REST API deployment via **FastAPI**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Installation](#installation)
- [Usage](#usage)
  - [1. Data Processing](#1-data-processing)
  - [2. Model Training](#2-model-training)
  - [3. API Deployment](#3-api-deployment)
- [API Documentation](#api-documentation)
- [Model Performance](#model-performance)
- [Project Structure](#project-structure)
- [Monitoring](#monitoring)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## 🎯 Overview

This project implements a **production-ready fraud detection system** for credit card transactions using machine learning and MLOps best practices. The pipeline handles:

- **Highly imbalanced data** (~0.17% fraud rate) using balanced Random Forest
- **Reproducible pipelines** with DVC for data versioning and experiment tracking
- **Experiment tracking** with MLflow for hyperparameter tuning and model registry
- **REST API deployment** with FastAPI for real-time fraud detection
- **Monitoring** with request logging and statistics endpoints

**Dataset**: [Kaggle Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)

---

## ✨ Features

- ✅ **Complete MLOps Pipeline**: Data preprocessing → Feature engineering → Model training → Deployment
- ✅ **Experiment Tracking**: MLflow logs parameters, metrics, and model artifacts
- ✅ **Data Versioning**: DVC tracks raw data, processed data, and models
- ✅ **REST API**: FastAPI serves predictions with automatic documentation
- ✅ **Monitoring**: Request logging and statistics dashboard
- ✅ **Model Registry**: MLflow model versioning with production tags
- ✅ **Reproducibility**: Single command (`dvc repro`) runs entire pipeline
- ✅ **Best Practices**: Type hints, logging, error handling, validation

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **ML Framework** | scikit-learn 1.8.0 | Random Forest classifier with class balancing |
| **Experiment Tracking** | MLflow 3.8.0 | Parameter/metric logging, model registry |
| **Data Versioning** | DVC | Pipeline orchestration, data tracking |
| **API Framework** | FastAPI 0.127.0 | REST API with automatic OpenAPI docs |
| **Data Processing** | Pandas 2.3.3, NumPy 2.4.0 | Data manipulation and numerical operations |
| **Visualization** | Matplotlib 3.10.8, Seaborn 0.13.2 | EDA and performance visualizations |
| **Configuration** | YAML | Centralized parameter management |

---

## 🏗️ Project Architecture

```
┌─────────────────┐
│  Raw Data       │
│  (Kaggle CSV)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Data Pipeline  │─────▶│  DVC Tracks  │
│  make_dataset   │      │  Versions    │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   Feature Eng   │
│ build_features  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Model Training │─────▶│   MLflow     │
│  train_model    │      │  Tracking    │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Saved Model   │─────▶│  FastAPI     │
│   (rf_model)    │      │  Deployment  │
└─────────────────┘      └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  REST API    │
                         │  /predict    │
                         │  /stats      │
                         └──────────────┘
```

---

## 📦 Installation

### Prerequisites
- Python 3.13+
- Git
- Virtual environment (venv)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/AdemMami123/fraud_detection_mlops.git
cd fraud_detection_mlops
```

2. **Create and activate virtual environment**
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Download the dataset**
- Download `creditcard.csv` from [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)
- Place it in `data/raw/creditcard.csv`

5. **Initialize DVC** (optional for full versioning)
```bash
dvc init
```

---

## 🚀 Usage

### 1. Data Processing

Run the data preprocessing pipeline to create train/test splits:

```bash
python src/data/make_dataset.py
```

**Output**: 
- `data/processed/train.csv` (227,845 rows)
- `data/processed/test.csv` (56,962 rows)

### 2. Feature Engineering (Optional)

Apply StandardScaler to Amount and Time features:

```bash
python src/features/build_features.py
```

**Output**: 
- `data/processed/train_features.csv`
- `data/processed/test_features.csv`

### 3. Model Training

Train Random Forest with MLflow tracking:

```bash
python src/models/train_model.py
```

**What happens:**
- Trains RandomForestClassifier (n_estimators=100, max_depth=10, class_weight='balanced')
- Logs parameters and metrics to MLflow
- Saves model to `models/rf_model.pkl`
- Registers model in MLflow model registry

**View experiments:**
```bash
mlflow ui
```
Navigate to http://localhost:5000

### 4. Run Complete Pipeline

Execute all stages with one command:

```bash
dvc repro
```

---

## 🌐 API Deployment

### Start the FastAPI Server

```bash
uvicorn api.main:app --reload
```

**API is live at**: http://localhost:8000

**Interactive documentation**: http://localhost:8000/docs

### API Endpoints

#### 1. **POST /predict** - Single Transaction Prediction

**Request:**
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Time": 12345.0,
    "Amount": 149.99,
    "V1": -1.359807,
    "V2": -0.072781,
    "V3": 2.536347,
    ...
    "V28": -0.021053
  }'
```

**Response:**
```json
{
  "fraud_probability": 0.1234,
  "is_fraud": false,
  "threshold": 0.5
}
```

#### 2. **POST /predict/batch** - Batch Predictions

Send multiple transactions at once for efficient processing.

#### 3. **GET /stats** - Monitoring Dashboard

```bash
curl http://localhost:8000/stats
```

**Response:**
```json
{
  "total_requests": 150,
  "avg_fraud_probability": 0.0823,
  "fraud_count": 12,
  "fraud_rate": 8.0
}
```

#### 4. **GET /health** - Health Check

Verify API and model are loaded correctly.

---

## 📊 Model Performance

### Metrics on Test Set

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **Precision** | 81.82% | 82% of flagged transactions are actually fraud |
| **Recall** | 82.65% | Catches 83% of all fraud cases |
| **F1-Score** | 0.8223 | Balanced precision-recall performance |
| **ROC-AUC** | 0.9766 | Excellent discrimination ability |
| **PR-AUC** | 0.82+ | Strong performance on imbalanced data |

### Confusion Matrix

```
                  Predicted
              Normal    Fraud
Actual Normal  56,854     10     (TN)  (FP)
       Fraud      17     81     (FN)  (TP)
```

- **True Negatives (TN)**: 56,854 - Correctly identified normal transactions
- **False Positives (FP)**: 10 - Normal transactions incorrectly flagged
- **False Negatives (FN)**: 17 - Missed fraud cases (critical metric!)
- **True Positives (TP)**: 81 - Correctly detected fraud

### Why These Metrics Matter

- **Recall is critical**: Each missed fraud (FN) = financial loss
- **Precision matters**: False alarms (FP) = investigation costs + customer friction
- **PR-AUC > ROC-AUC**: More honest metric for imbalanced datasets
- **Threshold tuning**: Adjust based on business costs (fraud loss vs investigation cost)

---

## 📁 Project Structure

```
fraud_detection_mlops/
├── api/
│   └── main.py                 # FastAPI application with /predict and /stats
├── data/
│   ├── raw/
│   │   └── creditcard.csv      # Raw Kaggle dataset (gitignored)
│   ├── processed/
│   │   ├── train.csv           # Training split (gitignored)
│   │   ├── test.csv            # Test split (gitignored)
│   │   ├── train_features.csv  # Scaled features (gitignored)
│   │   └── test_features.csv   # Scaled features (gitignored)
│   └── external/               # External data sources
├── models/
│   └── rf_model.pkl            # Trained Random Forest model (gitignored)
├── mlruns/                     # MLflow experiment tracking (gitignored)
├── notebooks/
│   └── 01_eda_and_baseline.ipynb  # EDA, baseline models, analysis
├── reports/
│   ├── figures/                # Plots and visualizations
│   ├── metrics/                # Performance metrics
│   └── requests_log.csv        # API request logging (gitignored)
├── src/
│   ├── data/
│   │   └── make_dataset.py     # Data preprocessing and train/test split
│   ├── features/
│   │   └── build_features.py   # Feature engineering (StandardScaler)
│   └── models/
│       ├── train_model.py      # Model training with MLflow tracking
│       └── predict_model.py    # Inference utilities
├── .gitignore                  # Excludes large files (data, models, mlruns)
├── dvc.yaml                    # DVC pipeline definition
├── params.yaml                 # Centralized configuration
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

---

## 📈 Monitoring

### Request Logging

Every `/predict` call is logged to `reports/requests_log.csv`:

```csv
timestamp,time,amount,fraud_probability,is_fraud
2025-12-26T10:30:15,12345.0,149.99,0.1234,false
```

### Statistics Dashboard

The `/stats` endpoint provides:
- **Total requests**: Count of all predictions
- **Average fraud probability**: Mean prediction score
- **Fraud count**: Number of transactions flagged as fraud
- **Fraud rate**: Percentage of fraud predictions

---

## 🔮 Future Enhancements

### Immediate Improvements
- [ ] Docker containerization for API
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Unit tests for preprocessing and prediction functions
- [ ] Feature importance visualization

### Advanced Features
- [ ] SMOTE/undersampling for better class balance
- [ ] Hyperparameter tuning with Optuna
- [ ] Real-time monitoring dashboard with Streamlit
- [ ] A/B testing framework for model comparison
- [ ] Cloud deployment (AWS SageMaker / GCP Vertex AI)
- [ ] Drift detection and model retraining triggers

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is for educational purposes. The dataset is from Kaggle and subject to their terms of use.

---

## 👤 Author

**Adem Mami**
- GitHub: [@AdemMami123](https://github.com/AdemMami123)
- LinkedIn: [Connect with me](https://linkedin.com/in/your-profile)

---

## 🙏 Acknowledgments

- Dataset: [Kaggle Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)
- MLflow, DVC, and FastAPI communities for excellent documentation
- scikit-learn for robust ML algorithms

---

**⭐ If you find this project useful, please consider giving it a star!**
