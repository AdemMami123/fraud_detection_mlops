"""
Credit Card Fraud Detection - FastAPI Service

This API provides real-time fraud detection for credit card transactions.
Run with: uvicorn api.main:app --reload
"""

import sys
import os
import csv
import logging
from pathlib import Path
from datetime import datetime

import yaml
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Add project root to path so we can import from src
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.models.predict_model import load_model, predict_proba

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Fraud Detection API",
    description="Real-time credit card fraud detection using Random Forest",
    version="1.0.0"
)

# Global variables for model and configuration
model = None
threshold = 0.5

# Path to the request log file for monitoring
LOG_FILE_PATH = "reports/requests_log.csv"


class Transaction(BaseModel):
    """
    Pydantic model for transaction data validation.
    
    All fields are required and must be floats.
    V1-V28 are PCA-transformed features from the original dataset.
    """
    Time: float = Field(..., description="Seconds elapsed since first transaction")
    Amount: float = Field(..., description="Transaction amount", ge=0)
    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float

    class Config:
        schema_extra = {
            "example": {
                "Time": 12345.0,
                "Amount": 149.99,
                "V1": -1.359807,
                "V2": -0.072781,
                "V3": 2.536347,
                "V4": 1.378155,
                "V5": -0.338321,
                "V6": 0.462388,
                "V7": 0.239599,
                "V8": 0.098698,
                "V9": 0.363787,
                "V10": 0.090794,
                "V11": -0.551600,
                "V12": -0.617801,
                "V13": -0.991390,
                "V14": -0.311169,
                "V15": 1.468177,
                "V16": -0.470401,
                "V17": 0.207971,
                "V18": 0.025791,
                "V19": 0.403993,
                "V20": 0.251412,
                "V21": -0.018307,
                "V22": 0.277838,
                "V23": -0.110474,
                "V24": 0.066928,
                "V25": 0.128539,
                "V26": -0.189115,
                "V27": 0.133558,
                "V28": -0.021053,
            }
        }


class PredictionResponse(BaseModel):
    """Response model for fraud prediction"""
    fraud_probability: float = Field(..., description="Probability of fraud (0.0 to 1.0)")
    is_fraud: bool = Field(..., description="Binary fraud classification based on threshold")
    threshold: float = Field(..., description="Classification threshold used")


class StatsResponse(BaseModel):
    """Response model for monitoring statistics"""
    total_requests: int = Field(..., description="Total number of prediction requests")
    avg_fraud_probability: float = Field(..., description="Average fraud probability across all requests")
    fraud_count: int = Field(..., description="Number of requests classified as fraud")
    fraud_rate: float = Field(..., description="Percentage of requests classified as fraud")


def log_prediction(transaction: Transaction, fraud_prob: float, is_fraud: bool):
    """
    Append a prediction record to the CSV log file for monitoring.
    
    Args:
        transaction: The transaction that was evaluated
        fraud_prob: The predicted fraud probability
        is_fraud: Whether the transaction was classified as fraud
    """
    try:
        # Ensure the reports directory exists
        os.makedirs("reports", exist_ok=True)
        
        # Check if file exists to determine if we need to write headers
        file_exists = os.path.isfile(LOG_FILE_PATH)
        
        # Open file in append mode
        with open(LOG_FILE_PATH, 'a', newline='') as f:
            writer = csv.writer(f)
            
            # Write header row if file is new
            if not file_exists:
                writer.writerow([
                    'timestamp', 'time', 'amount', 
                    'fraud_probability', 'is_fraud'
                ])
            
            # Write the prediction record
            writer.writerow([
                datetime.now().isoformat(),  # Current timestamp
                transaction.Time,             # Transaction time feature
                transaction.Amount,           # Transaction amount
                round(fraud_prob, 6),         # Fraud probability
                is_fraud                      # Binary classification
            ])
            
        logger.debug(f"Logged prediction to {LOG_FILE_PATH}")
        
    except Exception as e:
        # Log error but don't fail the prediction
        logger.error(f"Failed to log prediction: {e}")


@app.on_event("startup")
async def startup_event():
    """
    Load the model and configuration on application startup.
    This ensures the model is loaded only once and reused for all requests.
    """
    global model, threshold
    
    try:
        logger.info("Starting up Fraud Detection API...")
        
        # Load the trained model
        logger.info("Loading trained model...")
        model = load_model(params_path="params.yaml")
        logger.info("✓ Model loaded successfully!")
        
        # Load threshold from params.yaml
        logger.info("Loading configuration...")
        with open("params.yaml", 'r') as f:
            params = yaml.safe_load(f)
        threshold = params['train']['threshold']
        logger.info(f"✓ Using classification threshold: {threshold}")
        
        logger.info("✓ API startup complete!")
        
    except Exception as e:
        logger.error(f"Failed to load model or configuration: {e}")
        raise


@app.get("/")
async def root():
    """
    Root endpoint - API health check and information.
    """
    return {
        "service": "Fraud Detection API",
        "status": "running",
        "version": "1.0.0",
        "model_loaded": model is not None,
        "threshold": threshold
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify API and model are ready.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return {
        "status": "healthy",
        "model_loaded": True,
        "threshold": threshold
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(transaction: Transaction):
    """
    Predict fraud probability for a credit card transaction.
    
    This endpoint:
    1. Receives transaction data (Time, Amount, V1-V28)
    2. Validates the input using Pydantic
    3. Calls the model to get fraud probability
    4. Applies threshold to determine binary classification
    5. Returns both probability and classification
    
    Args:
        transaction: Transaction object with all required features
        
    Returns:
        PredictionResponse with fraud_probability, is_fraud, and threshold
        
    Raises:
        HTTPException: If model is not loaded or prediction fails
    """
    # Check if model is loaded
    if model is None:
        logger.error("Prediction attempted but model is not loaded")
        raise HTTPException(status_code=503, detail="Model not available")
    
    try:
        # Convert Pydantic model to dictionary for prediction
        transaction_dict = transaction.dict()
        
        logger.info(f"Received prediction request - Amount: ${transaction.Amount:.2f}")
        
        # Get fraud probability from model
        fraud_prob = predict_proba(model, transaction_dict)
        
        # Apply threshold to determine binary classification
        is_fraud = fraud_prob >= threshold
        
        logger.info(
            f"Prediction: {fraud_prob:.4f} - "
            f"{'🚨 FRAUD DETECTED' if is_fraud else '✓ Normal'}"
        )
        
        # Log the prediction to CSV for monitoring
        log_prediction(transaction, fraud_prob, is_fraud)
        
        # Return prediction response
        return PredictionResponse(
            fraud_probability=float(fraud_prob),
            is_fraud=bool(is_fraud),
            threshold=float(threshold)
        )
        
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """
    Get monitoring statistics from the prediction request log.
    
    Returns basic stats:
    - Total number of prediction requests
    - Average predicted fraud probability
    - Count of requests classified as fraud
    - Fraud rate (percentage of fraud predictions)
    
    If no log file exists yet, returns zeros with an informative message.
    """
    try:
        # Check if log file exists
        if not os.path.isfile(LOG_FILE_PATH):
            logger.info("Stats requested but no log file exists yet")
            return StatsResponse(
                total_requests=0,
                avg_fraud_probability=0.0,
                fraud_count=0,
                fraud_rate=0.0
            )
        
        # Read the log file into a DataFrame
        df = pd.read_csv(LOG_FILE_PATH)
        
        # Handle empty file (only headers)
        if len(df) == 0:
            return StatsResponse(
                total_requests=0,
                avg_fraud_probability=0.0,
                fraud_count=0,
                fraud_rate=0.0
            )
        
        # Calculate statistics
        total_requests = len(df)
        avg_fraud_prob = df['fraud_probability'].mean()
        fraud_count = df['is_fraud'].sum()
        fraud_rate = (fraud_count / total_requests) * 100
        
        logger.info(f"Stats computed: {total_requests} requests, {fraud_count} frauds")
        
        return StatsResponse(
            total_requests=int(total_requests),
            avg_fraud_probability=round(float(avg_fraud_prob), 6),
            fraud_count=int(fraud_count),
            fraud_rate=round(float(fraud_rate), 2)
        )
        
    except Exception as e:
        logger.error(f"Failed to compute stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute stats: {str(e)}"
        )


@app.post("/predict/batch")
async def predict_batch(transactions: list[Transaction]):
    """
    Predict fraud probability for multiple transactions in batch.
    
    This is more efficient for processing multiple transactions at once.
    
    Args:
        transactions: List of Transaction objects
        
    Returns:
        List of predictions for each transaction
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not available")
    
    try:
        logger.info(f"Received batch prediction request with {len(transactions)} transactions")
        
        results = []
        for idx, transaction in enumerate(transactions):
            transaction_dict = transaction.dict()
            fraud_prob = predict_proba(model, transaction_dict)
            is_fraud = fraud_prob >= threshold
            
            results.append({
                "transaction_index": idx,
                "fraud_probability": float(fraud_prob),
                "is_fraud": bool(is_fraud),
                "threshold": float(threshold)
            })
        
        logger.info(f"✓ Batch prediction complete - {len(results)} transactions processed")
        return {"predictions": results, "total": len(results)}
        
    except Exception as e:
        logger.error(f"Batch prediction failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction failed: {str(e)}"
        )


if __name__ == "__main__":
    """
    Run the API server directly (for development only).
    In production, use: uvicorn api.main:app --host 0.0.0.0 --port 8000
    """
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
