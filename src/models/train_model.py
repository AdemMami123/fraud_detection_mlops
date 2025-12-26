"""
Model training script with MLflow experiment tracking for fraud detection.
Trains a Random Forest classifier and logs metrics, parameters, and artifacts to MLflow.
"""

import os
import yaml
import joblib
import pandas as pd
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score


def load_params(params_path='params.yaml'):
    """
    Load configuration parameters from YAML file.
    
    Args:
        params_path: Path to params.yaml file
        
    Returns:
        Dictionary containing configuration parameters
    """
    with open(params_path, 'r') as f:
        params = yaml.safe_load(f)
    return params


def load_data(processed_dir):
    """
    Load training and test data from processed directory.
    Tries to load feature-engineered files first, falls back to basic split files.
    
    Args:
        processed_dir: Directory containing processed data files
        
    Returns:
        Tuple of (X_train, X_test, y_train, y_test)
    """
    # Define file paths - prefer feature files if they exist
    train_features_path = os.path.join(processed_dir, 'train_features.csv')
    test_features_path = os.path.join(processed_dir, 'test_features.csv')
    train_path = os.path.join(processed_dir, 'train.csv')
    test_path = os.path.join(processed_dir, 'test.csv')
    
    # Check if feature-engineered files exist
    if os.path.exists(train_features_path) and os.path.exists(test_features_path):
        print("Loading feature-engineered data...")
        train_df = pd.read_csv(train_features_path)
        test_df = pd.read_csv(test_features_path)
    else:
        print("Feature files not found. Loading basic train/test split...")
        train_df = pd.read_csv(train_path)
        test_df = pd.read_csv(test_path)
    
    print(f"Train data shape: {train_df.shape}")
    print(f"Test data shape: {test_df.shape}")
    
    # Separate features and target
    X_train = train_df.drop('Class', axis=1)
    y_train = train_df['Class']
    
    X_test = test_df.drop('Class', axis=1)
    y_test = test_df['Class']
    
    return X_train, X_test, y_train, y_test


def train_model():
    """
    Main training function that orchestrates the ML pipeline with MLflow tracking.
    Loads data, trains model, evaluates, logs to MLflow, and saves artifacts.
    """
    print("="*60)
    print("  Credit Card Fraud Detection - Model Training with MLflow")
    print("="*60)
    
    # Load configuration parameters
    params = load_params('params.yaml')
    
    # Extract configuration sections
    model_params = params['model']
    train_config = params['train']
    paths_config = params['paths']
    processed_dir = params['data']['processed_dir']
    
    # Load training and test data
    X_train, X_test, y_train, y_test = load_data(processed_dir)
    
    # Set MLflow experiment name
    experiment_name = train_config['experiment_name']
    mlflow.set_experiment(experiment_name)
    print(f"\nMLflow experiment: {experiment_name}")
    
    # Start MLflow run to track this training session
    with mlflow.start_run():
        print("\nMLflow run started!")
        
        # Create RandomForestClassifier with parameters from config
        print("\nInitializing Random Forest model...")
        model = RandomForestClassifier(
            n_estimators=model_params['n_estimators'],
            max_depth=model_params['max_depth'],
            class_weight=model_params['class_weight'],
            random_state=model_params['random_state'],
            n_jobs=-1  # Use all CPU cores
        )
        
        # Train the model
        print("Training model...")
        model.fit(X_train, y_train)
        print("✓ Model trained successfully!")
        
        # Make predictions on test set
        print("\nEvaluating model on test data...")
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Calculate evaluation metrics
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        
        # Display metrics
        print("\nModel Performance Metrics:")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall:    {recall:.4f}")
        print(f"  F1-Score:  {f1:.4f}")
        print(f"  ROC-AUC:   {roc_auc:.4f}")
        
        # Log hyperparameters to MLflow
        print("\nLogging parameters to MLflow...")
        mlflow.log_param("n_estimators", model_params['n_estimators'])
        mlflow.log_param("max_depth", model_params['max_depth'])
        mlflow.log_param("class_weight", model_params['class_weight'])
        mlflow.log_param("random_state", model_params['random_state'])
        mlflow.log_param("model_type", model_params['type'])
        
        # Log evaluation metrics to MLflow
        print("Logging metrics to MLflow...")
        mlflow.log_metric("precision", precision)
        mlflow.log_metric("recall", recall)
        mlflow.log_metric("f1_score", f1)
        mlflow.log_metric("roc_auc", roc_auc)
        
        # Log model artifact to MLflow (for model registry)
        print("Logging model artifact to MLflow...")
        mlflow.sklearn.log_model(
            model, 
            "model",
            registered_model_name="fraud_detection_rf"
        )
        
        # Save model locally for DVC tracking
        model_dir = paths_config['model_dir']
        os.makedirs(model_dir, exist_ok=True)
        
        model_path = os.path.join(model_dir, 'rf_model.pkl')
        print(f"\nSaving model locally to: {model_path}")
        joblib.dump(model, model_path)
        
        # Get MLflow run ID for reference
        run_id = mlflow.active_run().info.run_id
        print(f"\n✓ MLflow run completed! Run ID: {run_id}")
    
    print("\n" + "="*60)
    print("  Model training completed successfully!")
    print("="*60)
    print(f"\nModel saved to: {model_path}")
    print("View experiments in MLflow UI with: mlflow ui")


if __name__ == "__main__":
    train_model()
