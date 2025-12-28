"""
Credit Card Fraud Detection - Model Inference Module

This module provides functions to load a trained fraud detection model
and make predictions on new transaction data.
"""

import os
import yaml
import joblib
import pandas as pd
from typing import Dict


def load_model(params_path: str = "params.yaml"):
    """
    Load the trained fraud detection model from disk.
    
    Args:
        params_path: Path to the params.yaml configuration file
        
    Returns:
        Loaded sklearn model (RandomForestClassifier)
    """
    # Load configuration to get model directory path
    with open(params_path, 'r') as f:
        params = yaml.safe_load(f)
    
    # Get model directory from params (e.g., "models")
    model_dir = params['paths']['model_dir']
    
    # Construct full path to the saved model file
    model_path = os.path.join(model_dir, 'rf_model.pkl')
    
    # Load the model using joblib (consistent with train_model.py)
    print(f"Loading model from: {model_path}")
    model = joblib.load(model_path)
    print("✓ Model loaded successfully!")
    
    return model


def predict_proba(model, data_dict: Dict) -> float:
    """
    Predict fraud probability for a single transaction.
    
    Args:
        model: Trained sklearn model
        data_dict: Dictionary containing transaction features
                   Must include: Time, Amount, V1-V28
                   
    Returns:
        Fraud probability (float between 0.0 and 1.0)
    """
    # Define the exact feature order used during model training
    # This MUST match the order in the training data (excluding 'Class')
    feature_order = [
        'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9',
        'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19',
        'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount'
    ]
    
    # Convert dictionary to pandas DataFrame with correct column order
    df = pd.DataFrame([data_dict])[feature_order]
    
    # Get prediction probabilities [prob_normal, prob_fraud]
    # predict_proba returns array like [[0.85, 0.15]] for each row
    proba = model.predict_proba(df)
    
    # Extract fraud probability (class 1, index 1)
    fraud_probability = proba[0, 1]
    
    return fraud_probability


def predict(model, data_dict: Dict, threshold: float = 0.5) -> int:
    """
    Predict fraud class (0 or 1) for a single transaction.
    
    Args:
        model: Trained sklearn model
        data_dict: Dictionary containing transaction features
        threshold: Classification threshold (default 0.5)
                   Lower threshold = more sensitive (catch more fraud, more false alarms)
                   Higher threshold = more conservative (fewer false alarms, miss some fraud)
                   
    Returns:
        Predicted class: 0 (normal) or 1 (fraud)
    """
    # Get fraud probability
    fraud_prob = predict_proba(model, data_dict)
    
    # Apply threshold to determine class
    prediction = 1 if fraud_prob >= threshold else 0
    
    return prediction


if __name__ == "__main__":
    """
    Demo: Load model and make predictions on sample transactions
    """
    print("="*60)
    print("  Fraud Detection - Inference Demo")
    print("="*60)
    
    # Load the trained model
    model = load_model()
    
    # Create a fake sample transaction for testing
    # In production, these values would come from a real transaction
    sample_transaction = {
        'Time': 12345.0,      # Seconds elapsed since first transaction
        'Amount': 149.99,     # Transaction amount
        # V1-V28 are PCA-transformed features (normally from real data)
        # Using zeros as placeholders - in reality these would be actual values
        'V1': -1.359807,
        'V2': -0.072781,
        'V3': 2.536347,
        'V4': 1.378155,
        'V5': -0.338321,
        'V6': 0.462388,
        'V7': 0.239599,
        'V8': 0.098698,
        'V9': 0.363787,
        'V10': 0.090794,
        'V11': -0.551600,
        'V12': -0.617801,
        'V13': -0.991390,
        'V14': -0.311169,
        'V15': 1.468177,
        'V16': -0.470401,
        'V17': 0.207971,
        'V18': 0.025791,
        'V19': 0.403993,
        'V20': 0.251412,
        'V21': -0.018307,
        'V22': 0.277838,
        'V23': -0.110474,
        'V24': 0.066928,
        'V25': 0.128539,
        'V26': -0.189115,
        'V27': 0.133558,
        'V28': -0.021053,
    }
    
    # Get fraud probability
    print("\nMaking prediction...")
    fraud_prob = predict_proba(model, sample_transaction)
    print(f"Fraud Probability: {fraud_prob:.4f} ({fraud_prob*100:.2f}%)")
    
    # Get binary prediction (using default threshold of 0.5)
    prediction = predict(model, sample_transaction, threshold=0.5)
    print(f"Prediction: {'🚨 FRAUD' if prediction == 1 else '✓ NORMAL'}")
    
    # Show what happens with different thresholds
    print("\n" + "="*60)
    print("  Threshold Impact Demo")
    print("="*60)
    thresholds = [0.3, 0.5, 0.7]
    for thresh in thresholds:
        pred = predict(model, sample_transaction, threshold=thresh)
        status = "FRAUD" if pred == 1 else "NORMAL"
        print(f"Threshold {thresh}: {status}")
    
    print("\n✓ Demo complete!")
