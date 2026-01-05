# Vercel Deployment Guide - Next.js Frontend

## 🚀 Quick Deployment to Vercel

Vercel is the **easiest** way to deploy Next.js applications (it's made by the same company!).

---

## Prerequisites

✅ Backend API deployed on Cloud Run: https://fraud-detection-api-72371479844.europe-west1.run.app
✅ Vercel account (free): https://vercel.com/signup
✅ Git repository (GitHub, GitLab, or Bitbucket)

---

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub

```bash
cd /home/cosme/Dev/ITBS/fraud_detection_mlops

# If not already a git repo, initialize it
git init
git add .
git commit -m "Fraud detection MLOps project with deployed backend"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/fraud_detection_mlops.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to: https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `webapp`
   - **Environment Variables**: Already configured in `webapp/.env.production`

5. Click "Deploy"

**Done!** Your frontend will be live in ~2 minutes at a URL like:
`https://fraud-detection-mlops-xyz.vercel.app`

---

## Option 2: Deploy via Vercel CLI (Faster for testing)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /home/cosme/Dev/ITBS/fraud_detection_mlops/webapp

# First deployment (will ask questions)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? fraud-detection-mlops
# - Directory? ./ (current directory is already webapp)
```

### Step 4: Deploy to Production

```bash
# After initial setup, deploy to production
vercel --prod
```

**Your app is now live!** Vercel will give you a URL like:
`https://fraud-detection-mlops.vercel.app`

---

## Configuration Details

### Environment Variable

The API URL is already configured in `webapp/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://fraud-detection-api-72371479844.europe-west1.run.app
```

### Vercel Configuration

The `webapp/vercel.json` file is configured for optimal deployment:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://fraud-detection-api-72371479844.europe-west1.run.app"
  }
}
```

---

## Verify Deployment

After deployment, test your app:

1. **Open the Vercel URL** (e.g., `https://fraud-detection-mlops.vercel.app`)

2. **Test Single Prediction**:
   - Use the sample transaction button
   - Should show fraud prediction result

3. **Test Batch Prediction**:
   - Upload a CSV file
   - Should process and show results

4. **Check Statistics**:
   - Navigate to Statistics tab
   - Should show API usage data

---

## Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `fraud-detection.yourdomain.com`)
3. Follow DNS configuration instructions
4. SSL certificate is automatically configured!

---

## Update Backend CORS (Important!)

After deploying to Vercel, update your backend to allow requests from your Vercel domain:

```bash
cd /home/cosme/Dev/ITBS/fraud_detection_mlops

# Update api/main.py CORS settings
# Change from origins=["*"] to specific domains:
# origins=[
#     "https://fraud-detection-mlops.vercel.app",
#     "https://your-custom-domain.com",
#     "http://localhost:3000"  # for local development
# ]

# Redeploy backend
gcloud run deploy fraud-detection-api --source . --region europe-west1
```

---

## Automatic Deployments

Once connected to GitHub, Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

Every commit gets its own preview URL!

---

## Troubleshooting

### Issue: API calls failing
**Solution**: Check browser console for CORS errors. Update backend CORS settings.

### Issue: Environment variable not working
**Solution**: Verify `.env.production` exists in `webapp/` directory.

### Issue: Build fails
**Solution**: 
```bash
# Test build locally first
cd webapp
npm install
npm run build
```

---

## Cost

**Vercel Free Tier**:
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- **Perfect for this project - it's FREE!** ✅

---

## Next Steps After Deployment

1. ✅ Test all features on production URL
2. ⭐ Add custom domain (optional)
3. 📊 Monitor usage in Vercel Analytics
4. 🔒 Update backend CORS for security

---

**Ready to deploy?** Choose Option 1 (Dashboard) or Option 2 (CLI) above!
