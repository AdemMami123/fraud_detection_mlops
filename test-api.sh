#!/bin/bash
# ==============================================================================
# Test Deployed API Script
# ==============================================================================
# Tests the fraud detection API endpoints after deployment
# Usage: ./test-api.sh <SERVICE_URL>
# Example: ./test-api.sh https://fraud-detection-api-xyz.run.app
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${2}${1}${NC}"
}

# Get service URL
if [ -z "$1" ]; then
    # Try to get from gcloud
    SERVICE_URL=$(gcloud run services describe fraud-detection-api \
        --region europe-west1 \
        --format 'value(status.url)' 2>/dev/null || echo "")
    
    if [ -z "$SERVICE_URL" ]; then
        print_message "❌ ERROR: Service URL not provided" "$RED"
        echo "Usage: $0 <SERVICE_URL>"
        echo "Or deploy first with: ./deploy-to-gcp.sh"
        exit 1
    fi
else
    SERVICE_URL=$1
fi

print_message "🧪 Testing API at: $SERVICE_URL" "$BLUE"
echo "==============================================="
echo

# Test 1: Health Check
print_message "Test 1: Health Check" "$YELLOW"
echo "GET $SERVICE_URL/health"
HEALTH_RESPONSE=$(curl -s "$SERVICE_URL/health")
echo "Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_message "✅ Health check passed" "$GREEN"
else
    print_message "❌ Health check failed" "$RED"
    exit 1
fi
echo

# Test 2: Root Endpoint
print_message "Test 2: Root Endpoint" "$YELLOW"
echo "GET $SERVICE_URL/"
curl -s "$SERVICE_URL/" | head -20
print_message "✅ Root endpoint responded" "$GREEN"
echo

# Test 3: Fraud Prediction (Normal Transaction)
print_message "Test 3: Predict Normal Transaction" "$YELLOW"
NORMAL_TRANSACTION='{
  "Time": 0,
  "Amount": 50.0,
  "V1": -1.3598071336738,
  "V2": -0.0727811733098497,
  "V3": 2.53634673796914,
  "V4": 1.37815522427443,
  "V5": -0.338320769942518,
  "V6": 0.462387777762292,
  "V7": 0.239598554061257,
  "V8": 0.0986979012610507,
  "V9": 0.363786969611213,
  "V10": 0.0907941719789316,
  "V11": -0.551599533260813,
  "V12": -0.617800855762348,
  "V13": -0.991389847235408,
  "V14": -0.311169353699879,
  "V15": 1.46817697209427,
  "V16": -0.470400525259478,
  "V17": 0.207971241929242,
  "V18": 0.0257905801985591,
  "V19": 0.403992960255733,
  "V20": 0.251412098239705,
  "V21": -0.018306777944153,
  "V22": 0.277837575558899,
  "V23": -0.110473910188767,
  "V24": 0.0669280749146731,
  "V25": 0.128539358273528,
  "V26": -0.189114843888824,
  "V27": 0.133558376740387,
  "V28": -0.0210530534538215
}'

echo "POST $SERVICE_URL/predict"
PREDICTION=$(curl -s -X POST "$SERVICE_URL/predict" \
    -H "Content-Type: application/json" \
    -d "$NORMAL_TRANSACTION")
echo "Response: $PREDICTION"

if echo "$PREDICTION" | grep -q "fraud_probability"; then
    print_message "✅ Prediction successful" "$GREEN"
else
    print_message "❌ Prediction failed" "$RED"
    exit 1
fi
echo

# Test 4: Statistics Endpoint
print_message "Test 4: Statistics" "$YELLOW"
echo "GET $SERVICE_URL/stats"
STATS=$(curl -s "$SERVICE_URL/stats")
echo "Response: $STATS"
print_message "✅ Stats endpoint responded" "$GREEN"
echo

# Summary
echo "==============================================="
print_message "🎉 All tests passed!" "$GREEN"
echo
print_message "API is ready to use at: $SERVICE_URL" "$BLUE"
echo
echo "Try the web interface by opening:"
echo "  curl -X POST $SERVICE_URL/predict -H 'Content-Type: application/json' -d <data>"
