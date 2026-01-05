# MLflow Deployment Guide (Optional)

MLflow is primarily used during **model development and training**, not required for production API usage.

---

## Current Status

✅ **Backend API**: Deployed and working (includes trained model)
❌ **MLflow**: Running locally only

---

## Do You Need to Deploy MLflow?

### ✅ Deploy MLflow if you want to:
- Track new experiments in production
- Compare model versions remotely
- Share experiment results with team members
- Retrain models in the cloud

### ❌ Don't need to deploy MLflow if:
- You're only using the trained model for predictions ✅ (your current use case)
- Training/experimentation happens locally
- You don't need experiment tracking in production

**Recommendation**: For your current use case (serving predictions), **MLflow deployment is optional**. The trained model is already included in your Cloud Run API.

---

## If You Want to Deploy MLflow

### Option 1: Cloud Run (Simplest)

```bash
cd /home/cosme/Dev/ITBS/fraud_detection_mlops

# Create Dockerfile for MLflow
cat > Dockerfile.mlflow << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install MLflow
RUN pip install mlflow psycopg2-binary google-cloud-storage

# Expose MLflow port
EXPOSE 5000

# Run MLflow server
CMD mlflow server \
    --backend-store-uri sqlite:///mlflow.db \
    --default-artifact-root /mlruns \
    --host 0.0.0.0 \
    --port ${PORT:-5000}
EOF

# Deploy to Cloud Run
gcloud run deploy mlflow-server \
  --source . \
  --dockerfile Dockerfile.mlflow \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --port 5000
```

**Cost**: ~$0-3/month (minimal usage)

### Option 2: Cloud SQL + Cloud Storage (Production)

For production MLflow with persistence:

```bash
# 1. Create Cloud SQL instance (PostgreSQL)
gcloud sql instances create mlflow-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=europe-west1

# 2. Create database
gcloud sql databases create mlflow --instance=mlflow-db

# 3. Create Cloud Storage bucket for artifacts
gsutil mb -l europe-west1 gs://fraud-detection-mlflow-artifacts

# 4. Deploy MLflow with persistent storage
# (Requires more configuration - see MLflow docs)
```

**Cost**: ~$10-15/month (Cloud SQL micro instance)

---

## Alternative: Use Local MLflow

Keep MLflow running locally during development:

```bash
cd /home/cosme/Dev/ITBS/fraud_detection_mlops

# Start MLflow UI locally
mlflow ui

# Access at http://localhost:5000
```

---

## MLflow on Vercel (Not Recommended)

MLflow is a server application and not suitable for Vercel (which is for static/serverless apps). Use Cloud Run or local setup instead.

---

## Recommendation for Your Project

**Best approach**:
1. ✅ **Backend API**: Already deployed on Cloud Run (contains trained model)
2. ✅ **Frontend**: Deploy to Vercel (coming next)
3. ⚠️ **MLflow**: Keep it local for now (only needed during training)

If you later want to retrain models or track experiments in the cloud, deploy MLflow to Cloud Run using Option 1 above.

---

**Summary**: You don't need to deploy MLflow for your API to work. It's already fully functional on Cloud Run!
