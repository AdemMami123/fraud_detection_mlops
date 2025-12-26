"""
Data preprocessing script for fraud detection project.
Loads raw credit card data, splits into train/test sets, and saves to processed directory.
"""

import os
import yaml
import pandas as pd
from sklearn.model_selection import train_test_split


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


def load_raw_data(raw_path):
    """
    Load raw credit card transaction data.
    
    Args:
        raw_path: Path to raw CSV file
        
    Returns:
        DataFrame with raw transaction data
    """
    print(f"Loading raw data from: {raw_path}")
    df = pd.read_csv(raw_path)
    print(f"Data loaded successfully! Shape: {df.shape}")
    return df


def split_data(df, test_size, random_state):
    """
    Split data into train and test sets with stratification on Class column.
    Stratification ensures both sets maintain the same fraud/normal ratio.
    
    Args:
        df: Input DataFrame
        test_size: Proportion of data to use for testing (e.g., 0.2 for 20%)
        random_state: Random seed for reproducibility
        
    Returns:
        Tuple of (train_df, test_df)
    """
    print(f"Splitting data with test_size={test_size}, random_state={random_state}")
    
    # Separate features and target
    X = df.drop('Class', axis=1)
    y = df['Class']
    
    # Perform stratified split to maintain class balance
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y  # Ensures same fraud ratio in train and test
    )
    
    # Recombine features and target for saving
    train_df = pd.concat([X_train, y_train], axis=1)
    test_df = pd.concat([X_test, y_test], axis=1)
    
    print(f"Train set shape: {train_df.shape}")
    print(f"Test set shape: {test_df.shape}")
    print(f"Train fraud ratio: {(train_df['Class'] == 1).sum() / len(train_df) * 100:.4f}%")
    print(f"Test fraud ratio: {(test_df['Class'] == 1).sum() / len(test_df) * 100:.4f}%")
    
    return train_df, test_df


def save_data(train_df, test_df, processed_dir):
    """
    Save train and test DataFrames to CSV files in processed directory.
    Creates the directory if it doesn't exist.
    
    Args:
        train_df: Training set DataFrame
        test_df: Test set DataFrame
        processed_dir: Directory path to save processed data
    """
    # Create processed directory if it doesn't exist
    os.makedirs(processed_dir, exist_ok=True)
    
    # Define file paths
    train_path = os.path.join(processed_dir, 'train.csv')
    test_path = os.path.join(processed_dir, 'test.csv')
    
    # Save to CSV
    print(f"Saving training data to: {train_path}")
    train_df.to_csv(train_path, index=False)
    
    print(f"Saving test data to: {test_path}")
    test_df.to_csv(test_path, index=False)
    
    print("Data saved successfully!")


def main():
    """
    Main function to orchestrate the data preprocessing pipeline.
    Loads config, reads raw data, splits, and saves processed data.
    """
    print("="*60)
    print("  Credit Card Fraud Detection - Data Preprocessing")
    print("="*60)
    
    # Load configuration from params.yaml
    params = load_params('params.yaml')
    
    # Extract data parameters
    raw_path = params['data']['raw_path']
    processed_dir = params['data']['processed_dir']
    test_size = params['data']['test_size']
    random_state = params['data']['random_state']
    
    # Load raw data
    df = load_raw_data(raw_path)
    
    # Split into train and test sets with stratification
    train_df, test_df = split_data(df, test_size, random_state)
    
    # Save processed data
    save_data(train_df, test_df, processed_dir)
    
    print("\n" + "="*60)
    print("  Data preprocessing completed successfully!")
    print("="*60)


if __name__ == "__main__":
    main()
