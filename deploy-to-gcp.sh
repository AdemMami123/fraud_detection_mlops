#!/bin/bash
# ==============================================================================
# GCP Cloud Run Deployment Script
# ==============================================================================
# Quick deployment script for Fraud Detection API to Google Cloud Run
# Usage: ./deploy-to-gcp.sh
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

print_message "🚀 Fraud Detection API - GCP Deployment Script" "$BLUE"
echo "==============================================="
echo

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_message "❌ ERROR: gcloud CLI not found!" "$RED"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

print_message "✅ gcloud CLI found" "$GREEN"

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_message "⚠️  Not authenticated. Running gcloud auth login..." "$YELLOW"
    gcloud auth login
fi

# Get or set project ID
CURRENT_PROJECT=$(gcloud config get-value project 2> /dev/null)

if [ -z "$CURRENT_PROJECT" ] || [ "$CURRENT_PROJECT" == "(unset)" ]; then
    print_message "📝 No active project. Let's create one!" "$YELLOW"
    read -p "Enter project ID (e.g., fraud-detection-mlops-$(whoami)): " PROJECT_ID
    
    # Create project
    gcloud projects create $PROJECT_ID --name="Fraud Detection MLOps" || true
    gcloud config set project $PROJECT_ID
else
    PROJECT_ID=$CURRENT_PROJECT
    print_message "📋 Using project: $PROJECT_ID" "$BLUE"
fi

# Set region
REGION="europe-west1"
gcloud config set run/region $REGION
print_message "🌍 Region set to: $REGION" "$BLUE"

# Enable required APIs
print_message "⚙️  Enabling required GCP APIs..." "$YELLOW"
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    --quiet

print_message "✅ APIs enabled" "$GREEN"

# Service configuration
SERVICE_NAME="fraud-detection-api"
MEMORY="1Gi"
CPU="1"
MAX_INSTANCES="10"
MIN_INSTANCES="0"
TIMEOUT="300"

echo
print_message "🔨 Deploying to Cloud Run..." "$BLUE"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Memory: $MEMORY"
echo "CPU: $CPU"
echo

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --memory $MEMORY \
    --cpu $CPU \
    --timeout $TIMEOUT \
    --max-instances $MAX_INSTANCES \
    --min-instances $MIN_INSTANCES \
    --quiet

if [ $? -eq 0 ]; then
    echo
    print_message "🎉 Deployment successful!" "$GREEN"
    echo
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
        --region $REGION \
        --format 'value(status.url)')
    
    print_message "🌐 Service URL: $SERVICE_URL" "$BLUE"
    echo
    
    # Test health endpoint
    print_message "🔍 Testing health endpoint..." "$YELLOW"
    sleep 5  # Wait for service to warm up
    
    if curl -s "$SERVICE_URL/health" | grep -q "healthy"; then
        print_message "✅ Health check passed!" "$GREEN"
    else
        print_message "⚠️  Health check failed. Check logs:" "$YELLOW"
        echo "gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20"
    fi
    
    echo
    print_message "📚 Next steps:" "$BLUE"
    echo "1. Test prediction: curl -X POST $SERVICE_URL/predict -H 'Content-Type: application/json' -d '{...}'"
    echo "2. View logs: gcloud run services logs tail $SERVICE_NAME --region $REGION"
    echo "3. View in console: https://console.cloud.google.com/run?project=$PROJECT_ID"
    echo
    
else
    print_message "❌ Deployment failed!" "$RED"
    echo "Check build logs: gcloud builds list --limit 5"
    exit 1
fi
