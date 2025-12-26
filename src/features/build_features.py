"""
Feature engineering script for fraud detection project.
Applies scaling to Amount and Time columns while preserving PCA-transformed features (V1-V28).
"""

import os
import yaml
import pandas as pd
from sklearn.preprocessing import StandardScaler


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


def load_processed_data(processed_dir):
    """
    Load train and test datasets from processed directory.
    
    Args:
        processed_dir: Directory containing train.csv and test.csv
        
    Returns:
        Tuple of (train_df, test_df)
    """
    train_path = os.path.join(processed_dir, 'train.csv')
    test_path = os.path.join(processed_dir, 'test.csv')
    
    print(f"Loading training data from: {train_path}")
    train_df = pd.read_csv(train_path)
    
    print(f"Loading test data from: {test_path}")
    test_df = pd.read_csv(test_path)
    
    print(f"Train shape: {train_df.shape}")
    print(f"Test shape: {test_df.shape}")
    
    return train_df, test_df


def scale_features(train_df, test_df):
    """
    Scale Amount and Time columns using StandardScaler.
    V1-V28 are already PCA-transformed, so we leave them unchanged.
    
    Args:
        train_df: Training DataFrame
        test_df: Test DataFrame
        
    Returns:
        Tuple of (scaled_train_df, scaled_test_df)
    """
    print("\nApplying feature scaling...")
    
    # Separate features and target
    X_train = train_df.drop('Class', axis=1)
    y_train = train_df['Class']
    
    X_test = test_df.drop('Class', axis=1)
    y_test = test_df['Class']
    
    # Identify columns to scale (Amount and Time)
    # V1-V28 are already standardized from PCA, so we skip them
    columns_to_scale = ['Amount', 'Time']
    
    # Initialize scaler and fit on training data only
    scaler = StandardScaler()
    
    # Fit scaler on training data and transform both train and test
    X_train[columns_to_scale] = scaler.fit_transform(X_train[columns_to_scale])
    X_test[columns_to_scale] = scaler.transform(X_test[columns_to_scale])
    
    print(f"Scaled columns: {columns_to_scale}")
    print(f"V1-V28 features left unchanged (already PCA-transformed)")
    
    # Recombine features and target
    train_scaled = pd.concat([X_train, y_train], axis=1)
    test_scaled = pd.concat([X_test, y_test], axis=1)
    
    return train_scaled, test_scaled


def save_features(train_df, test_df, processed_dir):
    """
    Save feature-engineered datasets to CSV files.
    
    Args:
        train_df: Training DataFrame with engineered features
        test_df: Test DataFrame with engineered features
        processed_dir: Directory to save processed data
    """
    # Define output paths
    train_features_path = os.path.join(processed_dir, 'train_features.csv')
    test_features_path = os.path.join(processed_dir, 'test_features.csv')
    
    # Save to CSV
    print(f"\nSaving training features to: {train_features_path}")
    train_df.to_csv(train_features_path, index=False)
    
    print(f"Saving test features to: {test_features_path}")
    test_df.to_csv(test_features_path, index=False)
    
    print("Feature engineering completed successfully!")


def main():
    """
    Main function to orchestrate the feature engineering pipeline.
    Loads processed data, applies scaling, and saves feature-engineered data.
    """
    print("="*60)
    print("  Credit Card Fraud Detection - Feature Engineering")
    print("="*60)
    
    # Load configuration from params.yaml
    params = load_params('params.yaml')
    processed_dir = params['data']['processed_dir']
    
    # Load train and test datasets
    train_df, test_df = load_processed_data(processed_dir)
    
    # Apply feature scaling to Amount and Time
    train_scaled, test_scaled = scale_features(train_df, test_df)
    
    # Save feature-engineered datasets
    save_features(train_scaled, test_scaled, processed_dir)
    
    print("\n" + "="*60)
    print("  Feature engineering pipeline completed!")
    print("="*60)


if __name__ == "__main__":
    main()
