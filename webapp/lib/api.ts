/**
 * API client functions for the Fraud Detection service
 */

import { Transaction, PredictionResponse, HealthResponse, ValidationError } from '@/types';

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Check API health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Make a single transaction prediction
 */
export async function predictSingle(transaction: Transaction): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Prediction failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Make batch predictions for multiple transactions
 */
export async function predictBatch(transactions: Transaction[]): Promise<{
  predictions: Array<{
    transaction_index: number;
    fraud_probability: number;
    is_fraud: boolean;
    threshold: number;
  }>;
  total: number;
}> {
  const response = await fetch(`${API_BASE_URL}/predict/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactions),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Batch prediction failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get API statistics
 */
export async function getStats(): Promise<{
  total_requests: number;
  avg_fraud_probability: number;
  fraud_count: number;
  fraud_rate: number;
}> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Failed to get stats: ${response.status}`);
  }

  return response.json();
}

/**
 * Validate transaction data
 */
export function validateTransaction(transaction: Partial<Transaction>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check required fields
  const requiredFields: (keyof Transaction)[] = [
    'Time', 'Amount',
    'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
    'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
    'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28'
  ];

  for (const field of requiredFields) {
    const value = transaction[field];
    if (value === undefined || value === null) {
      errors.push({
        field,
        message: `${field} is required`,
      });
    } else if (typeof value !== 'number' || isNaN(value)) {
      errors.push({
        field,
        message: `${field} must be a valid number`,
      });
    }
  }

  // Validate Amount is non-negative
  if (transaction.Amount !== undefined && transaction.Amount < 0) {
    errors.push({
      field: 'Amount',
      message: 'Amount must be non-negative',
    });
  }

  // Validate Time is non-negative
  if (transaction.Time !== undefined && transaction.Time < 0) {
    errors.push({
      field: 'Time',
      message: 'Time must be non-negative',
    });
  }

  return errors;
}

/**
 * Parse CSV content to Transaction array
 */
export function parseCSVToTransactions(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const transactions: Transaction[] = [];

  // Expected column names
  const expectedColumns = [
    'Time', 'Amount',
    'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
    'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
    'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28'
  ];

  // Find column indices
  const columnIndices: Record<string, number> = {};
  for (const col of expectedColumns) {
    const index = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
    if (index === -1) {
      throw new Error(`Missing required column: ${col}`);
    }
    columnIndices[col] = index;
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length < headers.length) {
      continue; // Skip incomplete rows
    }

    const transaction: Transaction = {
      Time: parseFloat(values[columnIndices['Time']]),
      Amount: parseFloat(values[columnIndices['Amount']]),
      V1: parseFloat(values[columnIndices['V1']]),
      V2: parseFloat(values[columnIndices['V2']]),
      V3: parseFloat(values[columnIndices['V3']]),
      V4: parseFloat(values[columnIndices['V4']]),
      V5: parseFloat(values[columnIndices['V5']]),
      V6: parseFloat(values[columnIndices['V6']]),
      V7: parseFloat(values[columnIndices['V7']]),
      V8: parseFloat(values[columnIndices['V8']]),
      V9: parseFloat(values[columnIndices['V9']]),
      V10: parseFloat(values[columnIndices['V10']]),
      V11: parseFloat(values[columnIndices['V11']]),
      V12: parseFloat(values[columnIndices['V12']]),
      V13: parseFloat(values[columnIndices['V13']]),
      V14: parseFloat(values[columnIndices['V14']]),
      V15: parseFloat(values[columnIndices['V15']]),
      V16: parseFloat(values[columnIndices['V16']]),
      V17: parseFloat(values[columnIndices['V17']]),
      V18: parseFloat(values[columnIndices['V18']]),
      V19: parseFloat(values[columnIndices['V19']]),
      V20: parseFloat(values[columnIndices['V20']]),
      V21: parseFloat(values[columnIndices['V21']]),
      V22: parseFloat(values[columnIndices['V22']]),
      V23: parseFloat(values[columnIndices['V23']]),
      V24: parseFloat(values[columnIndices['V24']]),
      V25: parseFloat(values[columnIndices['V25']]),
      V26: parseFloat(values[columnIndices['V26']]),
      V27: parseFloat(values[columnIndices['V27']]),
      V28: parseFloat(values[columnIndices['V28']]),
    };

    // Validate parsed values
    const hasInvalidValues = Object.values(transaction).some(v => isNaN(v));
    if (!hasInvalidValues) {
      transactions.push(transaction);
    }
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions found in CSV');
  }

  return transactions;
}
