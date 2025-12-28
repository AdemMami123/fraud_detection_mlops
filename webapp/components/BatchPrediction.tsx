'use client';

import { useState, useCallback } from 'react';
import { Transaction, PredictionResponse, SAMPLE_FRAUD_TRANSACTION, SAMPLE_NORMAL_TRANSACTION } from '@/types';
import { predictBatch, parseCSVToTransactions } from '@/lib/api';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Download,
  Trash2,
  Play
} from 'lucide-react';

interface BatchPredictionProps {
  disabled: boolean;
}

interface BatchResult {
  transaction: Transaction;
  prediction: PredictionResponse;
  index: number;
}

export default function BatchPrediction({ disabled }: BatchPredictionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseCSVToTransactions(text);
      if (parsed.length === 0) {
        throw new Error('No valid transactions found in file');
      }
      setTransactions(parsed);
      setResults([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadSampleBatch = () => {
    // Create a mix of normal and fraud samples
    const samples: Transaction[] = [
      { ...SAMPLE_NORMAL_TRANSACTION, Time: 100, Amount: 50 },
      { ...SAMPLE_NORMAL_TRANSACTION, Time: 200, Amount: 150 },
      { ...SAMPLE_FRAUD_TRANSACTION, Time: 300, Amount: 400 },
      { ...SAMPLE_NORMAL_TRANSACTION, Time: 400, Amount: 25 },
      { ...SAMPLE_FRAUD_TRANSACTION, Time: 500, Amount: 800 },
    ];
    setTransactions(samples);
    setResults([]);
    setError(null);
  };

  const runBatchPrediction = async () => {
    if (transactions.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const predictions = await predictBatch(transactions);
      const batchResults: BatchResult[] = transactions.map((tx, idx) => ({
        transaction: tx,
        prediction: predictions[idx],
        index: idx,
      }));
      setResults(batchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch prediction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setTransactions([]);
    setResults([]);
    setError(null);
  };

  const downloadResults = () => {
    if (results.length === 0) return;

    const csvHeader = 'Index,Amount,Time,Fraud_Probability,Is_Fraud,Threshold\n';
    const csvData = results
      .map((r) => 
        `${r.index + 1},${r.transaction.Amount},${r.transaction.Time},${r.prediction.fraud_probability.toFixed(6)},${r.prediction.is_fraud},${r.prediction.threshold}`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fraud_detection_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fraudCount = results.filter((r) => r.prediction.is_fraud).length;
  const normalCount = results.length - fraudCount;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Upload Transactions (CSV)
        </h3>

        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Drag and drop a CSV file, or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              CSV must contain columns: Time, Amount, V1-V28
            </p>
          </label>
        </div>

        {/* Sample data button */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={loadSampleBatch}
            disabled={disabled}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Load Sample Batch (5 transactions)
          </button>
          {transactions.length > 0 && (
            <button
              onClick={clearAll}
              className="btn btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Transactions loaded */}
      {transactions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">
                  {transactions.length} transactions loaded
                </p>
                <p className="text-sm text-blue-600">
                  Ready for batch prediction
                </p>
              </div>
            </div>
            <button
              onClick={runBatchPrediction}
              disabled={disabled || isProcessing}
              className="btn btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Predictions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-600">Total Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
              <p className="text-sm text-green-600">Normal</p>
              <p className="text-2xl font-bold text-green-700">{normalCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
              <p className="text-sm text-red-600">Fraud Detected</p>
              <p className="text-2xl font-bold text-red-700">{fraudCount}</p>
            </div>
          </div>

          {/* Download button */}
          <div className="flex justify-end">
            <button
              onClick={downloadResults}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Results CSV
            </button>
          </div>

          {/* Results table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Probability</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result) => (
                  <tr
                    key={result.index}
                    className={result.prediction.is_fraud ? 'bg-red-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-gray-600">{result.index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      ${result.transaction.Amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {result.transaction.Time.toFixed(0)}s
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          result.prediction.fraud_probability > 0.5
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {(result.prediction.fraud_probability * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {result.prediction.is_fraud ? (
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <XCircle className="w-4 h-4" />
                          Fraud
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
