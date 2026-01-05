# ==============================================================================
# Credit Card Fraud Detection API - Dockerfile
# ==============================================================================
# Multi-stage build for optimized production image
# Build: docker build -t fraud-detection-api .
# Run: docker run -p 8000:8000 fraud-detection-api
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder - Install dependencies
# ------------------------------------------------------------------------------
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --user -r requirements.txt

# ------------------------------------------------------------------------------
# Stage 2: Production - Minimal runtime image
# ------------------------------------------------------------------------------
FROM python:3.11-slim as production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PATH="/root/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY api/ ./api/
COPY src/ ./src/
COPY models/ ./models/
COPY params.yaml .

# Create directories for data and reports (needed at runtime)
RUN mkdir -p data/processed data/raw reports

# Expose the API port (Cloud Run will set PORT env var)
EXPOSE 8080

# Health check to ensure the API is running
# Note: Cloud Run uses its own health checks, this is for local testing
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

# Run the FastAPI application with Uvicorn
# Use PORT environment variable (Cloud Run requirement)
CMD exec uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8080}
