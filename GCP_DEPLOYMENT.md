# 🚀 Quick Start: Deploy to GCP

This guide will help you deploy your Fraud Detection API to Google Cloud Platform in **15 minutes**.

## 📦 What's Included

| File | Purpose |
|------|---------|
| `deploy-to-gcp.sh` | Automated deployment script |
| `test-api.sh` | API testing script |
| `.dockerignore` | Optimizes Docker build size |

## 🎯 Quick Deployment (3 Commands)

### Option 1: Automated Script (Easiest)

```bash
# Step 1: Install gcloud CLI (one-time setup)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Step 2: Deploy!
./deploy-to-gcp.sh

# Step 3: Test your API
./test-api.sh
```

**That's it!** Your API will be live at a URL like `https://fraud-detection-api-xyz.run.app`

---

### Option 2: Manual Deployment (Full Control)

Follow the detailed guide: [`gcp_deployment_guide.md`](file:///home/cosme/.gemini/antigravity/brain/fe6ae336-5c52-44c3-9059-12a3f466fd3a/gcp_deployment_guide.md)

---

## ⚡ Prerequisites Checklist

- [ ] Google Cloud account (sign up at [console.cloud.google.com](https://console.cloud.google.com))
- [ ] Billing enabled (free tier available, ~$0-2/month for this project)
- [ ] gcloud CLI installed
- [ ] Docker working locally (optional, for testing)

---

## 🧪 Test Locally First (Recommended)

Before deploying to cloud, test your Docker container:

```bash
# Build image
docker build -t fraud-api-test .

# Run locally
docker run -p 8000:8000 fraud-api-test

# Test (in another terminal)
curl http://localhost:8000/health
# Should return: {"status":"healthy","model_loaded":true}
```

**If it works locally, it will work on Cloud Run!**

---

## 🎯 Deployment Steps Summary

| Step | Command | Time | What it does |
|------|---------|------|--------------|
| 1 | `gcloud auth login` | 1 min | Authenticate with GCP |
| 2 | `gcloud projects create <ID>` | 1 min | Create GCP project |
| 3 | `gcloud services enable run.googleapis.com` | 2 min | Enable Cloud Run |
| 4 | `gcloud run deploy --source .` | 10 min | Build & deploy |
| 5 | `./test-api.sh` | 1 min | Verify deployment |

**Total: ~15 minutes**

---

## 🔍 Verify Deployment

After deployment, you should see:

```bash
✅ Service URL: https://fraud-detection-api-xyz.run.app
✅ Health check passed
✅ API endpoints working
```

### Test Prediction

```bash
curl -X POST https://YOUR-URL/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Time": 0,
    "Amount": 100.0,
    "V1": -1.36, "V2": -0.07, "V3": 2.54,
    "V4": 1.38, "V5": -0.34, "V6": 0.46,
    "V7": 0.24, "V8": 0.10, "V9": 0.36,
    "V10": 0.09, "V11": -0.55, "V12": -0.62,
    "V13": -0.99, "V14": -0.31, "V15": 1.47,
    "V16": -0.47, "V17": 0.21, "V18": 0.03,
    "V19": 0.40, "V20": 0.25, "V21": -0.02,
    "V22": 0.28, "V23": -0.11, "V24": 0.07,
    "V25": 0.13, "V26": -0.19, "V27": 0.13,
    "V28": -0.02
  }'
  
# Expected response:
# {
#   "fraud_probability": 0.23,
#   "is_fraud": false,
#   "threshold": 0.5
# }
```

---

## 📊 Monitoring

View logs and metrics:

```bash
# View recent logs
gcloud run services logs read fraud-detection-api --limit 50

# Stream live logs
gcloud run services logs tail fraud-detection-api

# Open Cloud Console
open https://console.cloud.google.com/run
```

---

## 💰 Cost Estimate

**Free Tier (per month):**
- 2 million requests FREE
- 360,000 GB-seconds FREE
- 180,000 vCPU-seconds FREE

**Your usage:** ~1000 requests/month = **$0** ✅

Cloud Run scales to zero when idle, so you only pay when requests are being processed.

---

## 🛠️ Troubleshooting

### Issue: "gcloud: command not found"
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Issue: "Permission denied"
```bash
# Re-authenticate
gcloud auth login
gcloud auth application-default login
```

### Issue: "Billing not enabled"
- Go to: https://console.cloud.google.com/billing
- Enable billing (credit card required, but free tier covers this project)

### Issue: "Build failed"
```bash
# Check build logs
gcloud builds list --limit 5
gcloud builds log <BUILD_ID>

# Common fix: Clear cache and rebuild
docker system prune -a
./deploy-to-gcp.sh
```

---

## 🎉 Next Steps

After successful backend deployment:

1. **Deploy Frontend** (Next.js app)
   - Option A: Cloud Run (containerized)
   - Option B: Firebase Hosting (static)
   
2. **Set up CI/CD**
   - GitHub Actions → Auto-deploy on push
   
3. **Custom Domain** (optional)
   - Map your domain to Cloud Run service
   
4. **Enhanced Monitoring**
   - Cloud Monitoring dashboards
   - Error tracking with Cloud Error Reporting

---

## 📚 Additional Resources

- [Full Deployment Guide](file:///home/cosme/.gemini/antigravity/brain/fe6ae336-5c52-44c3-9059-12a3f466fd3a/gcp_deployment_guide.md)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GCP Free Tier](https://cloud.google.com/free)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)

---

**Ready to deploy? Run: `./deploy-to-gcp.sh`** 🚀
