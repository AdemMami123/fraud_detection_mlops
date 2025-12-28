'use client';

import { PredictionResponse } from '@/types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Gauge, Target, Activity } from 'lucide-react';

interface ResultDisplayProps {
  prediction: PredictionResponse | null;
  isLoading: boolean;
}

export default function ResultDisplay({ prediction, isLoading }: ResultDisplayProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Analyzing transaction...</p>
          <p className="text-sm text-gray-500">Running fraud detection model</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="text-center text-gray-500">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-700">No Prediction Yet</h3>
          <p className="text-sm mt-1">
            Fill in the transaction details and click "Analyze Transaction"
          </p>
        </div>
      </div>
    );
  }

  const isFraud = prediction.is_fraud;
  const probability = prediction.fraud_probability;
  const probabilityPercent = (probability * 100).toFixed(2);
  const threshold = prediction.threshold;

  // Determine risk level
  const getRiskLevel = (prob: number) => {
    if (prob < 0.3) return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100' };
    if (prob < 0.5) return { label: 'Medium Risk', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (prob < 0.7) return { label: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Critical Risk', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const riskLevel = getRiskLevel(probability);

  return (
    <div className="space-y-6 animate-slide-in">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary-600" />
        Prediction Result
      </h2>

      {/* Main Result Card */}
      <div
        className={`rounded-xl border-2 p-6 ${
          isFraud ? 'result-fraud border-red-300' : 'result-safe border-green-300'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-4 rounded-xl ${
              isFraud ? 'bg-red-500' : 'bg-green-500'
            } text-white shadow-lg`}
          >
            {isFraud ? (
              <ShieldAlert className="w-10 h-10" />
            ) : (
              <ShieldCheck className="w-10 h-10" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`text-2xl font-bold ${
                isFraud ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {isFraud ? 'FRAUD DETECTED' : 'LEGITIMATE TRANSACTION'}
            </h3>
            <p
              className={`mt-1 ${
                isFraud ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isFraud
                ? 'This transaction has been flagged as potentially fraudulent.'
                : 'This transaction appears to be legitimate.'}
            </p>
          </div>
        </div>
      </div>

      {/* Probability Gauge */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Fraud Probability</span>
          </div>
          <span
            className={`text-2xl font-bold ${
              isFraud ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {probabilityPercent}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${
              probability < 0.3
                ? 'bg-green-500'
                : probability < 0.5
                ? 'bg-yellow-500'
                : probability < 0.7
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${probability * 100}%` }}
          />
        </div>
        
        {/* Threshold marker */}
        <div className="relative mt-1">
          <div
            className="absolute w-0.5 h-4 bg-gray-800"
            style={{ left: `${threshold * 100}%`, transform: 'translateX(-50%)' }}
          />
          <div
            className="absolute text-xs text-gray-600"
            style={{ left: `${threshold * 100}%`, transform: 'translateX(-50%)', top: '1.25rem' }}
          >
            Threshold ({(threshold * 100).toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Risk Level */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Risk Level</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${riskLevel.bg} ${riskLevel.color}`}>
            {riskLevel.label}
          </span>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Classification</span>
          </div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isFraud
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {isFraud ? 'Fraudulent' : 'Normal'}
          </span>
        </div>

        {/* Threshold */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Decision Threshold</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {(threshold * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">How to interpret this result</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>Fraud Probability:</strong> The likelihood (0-100%) that this transaction is fraudulent
          </li>
          <li>
            • <strong>Threshold:</strong> Transactions with probability above {(threshold * 100).toFixed(0)}% are classified as fraud
          </li>
          <li>
            • <strong>Risk Level:</strong> Indicates the overall risk category based on probability
          </li>
        </ul>
      </div>
    </div>
  );
}
