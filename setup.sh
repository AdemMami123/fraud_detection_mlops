#!/bin/bash

set -e

echo "Creating directory structure..."
mkdir -p data/raw
mkdir -p data/processed
mkdir -p data/external
mkdir -p src/data
mkdir -p src/features
mkdir -p src/models
mkdir -p src/utils
mkdir -p src/evaluation
mkdir -p api
mkdir -p models
mkdir -p reports/figures
mkdir -p reports/metrics
mkdir -p config
mkdir -p notebooks/exploratory
mkdir -p notebooks/experiments
mkdir -p tests
mkdir -p docker
mkdir -p deployment

echo "Creating Python virtual environment..."
python3 -m venv .venv

echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source .venv/Scripts/activate
else
    source .venv/bin/activate
fi

echo "Installing dependencies..."
pip install --upgrade pip
pip install numpy pandas scikit-learn matplotlib seaborn mlflow "dvc[s3]" fastapi "uvicorn[standard]" jupyter pytest black flake8

echo "Generating requirements.txt..."
pip freeze > requirements.txt

echo "Creating README.md..."
cat > README.md << 'EOF'
# Credit Card Fraud Detection MLOps Project

## Overview
A complete MLOps pipeline for credit card fraud detection.

## Setup
Run the setup script:
```bash
bash setup.sh
```

## Project Structure
- `data/`: Data storage (raw, processed, external)
- `src/`: Source code modules
- `api/`: FastAPI service
- `models/`: Trained model artifacts
- `reports/`: Metrics and visualizations
- `config/`: Configuration files
- `notebooks/`: Jupyter notebooks
- `tests/`: Unit and integration tests
- `docker/`: Docker configurations
- `deployment/`: Deployment scripts

## Usage
Activate the virtual environment:
```bash
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```
EOF

echo "Initializing git repository..."
git init
git add .
git commit -m "Initial commit: MLOps project structure"

echo "Initializing DVC..."
dvc init
git add .dvc .dvcignore
git commit -m "Initialize DVC"

echo "Setup complete!"
echo "To activate the virtual environment, run:"
echo "  source .venv/bin/activate  # Linux/Mac"
echo "  .venv\\Scripts\\activate     # Windows"

