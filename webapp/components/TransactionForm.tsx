'use client';

import { useState } from 'react';
import { 
  Transaction, 
  PredictionResponse, 
  DEFAULT_TRANSACTION,
  SAMPLE_FRAUD_TRANSACTION,
  SAMPLE_NORMAL_TRANSACTION,
  FORM_FIELDS 
} from '@/types';
import { predictSingle, validateTransaction } from '@/lib/api';
import { Send, RotateCcw, AlertCircle, Beaker, Info } from 'lucide-react';

interface TransactionFormProps {
  onPrediction: (result: PredictionResponse) => void;
  onLoadingChange: (loading: boolean) => void;
  disabled: boolean;
}

export default function TransactionForm({
  onPrediction,
  onLoadingChange,
  disabled,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<Transaction>(DEFAULT_TRANSACTION);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof Transaction, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue,
    }));
    // Clear errors on input change
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validateTransaction(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    onLoadingChange(true);
    setErrors([]);

    try {
      const result = await predictSingle(formData);
      onPrediction(result);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Prediction failed']);
    } finally {
      setIsSubmitting(false);
      onLoadingChange(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_TRANSACTION);
    setErrors([]);
  };

  const loadSampleData = (type: 'fraud' | 'normal') => {
    const sample = type === 'fraud' ? SAMPLE_FRAUD_TRANSACTION : SAMPLE_NORMAL_TRANSACTION;
    setFormData(sample);
    setErrors([]);
  };

  // Separate main fields from V features
  const mainFields = FORM_FIELDS.slice(0, 2); // Time, Amount
  const vFields = FORM_FIELDS.slice(2); // V1-V28

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with sample buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Send className="w-5 h-5 text-primary-600" />
          Transaction Data
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadSampleData('normal')}
            className="btn btn-secondary text-xs flex items-center gap-1"
            disabled={disabled}
          >
            <Beaker className="w-3 h-3" />
            Sample Normal
          </button>
          <button
            type="button"
            onClick={() => loadSampleData('fraud')}
            className="btn btn-secondary text-xs flex items-center gap-1"
            disabled={disabled}
          >
            <Beaker className="w-3 h-3" />
            Sample Fraud
          </button>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-slide-in">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Validation Errors</h3>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main fields (Time & Amount) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mainFields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label 
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              <span className="tooltip-trigger relative inline-block ml-1">
                <Info className="w-3 h-3 text-gray-400 inline" />
                <span className="tooltip -top-8 left-0">{field.description}</span>
              </span>
            </label>
            <input
              type="number"
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              step={field.step}
              min={field.min}
              max={field.max}
              className="input-field"
              disabled={disabled || isSubmitting}
            />
          </div>
        ))}
      </div>

      {/* V Features Toggle */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
        >
          <span className={`transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
            ▶
          </span>
          PCA Features (V1-V28)
          <span className="text-xs text-gray-500 font-normal">
            {showAdvanced ? 'Click to hide' : 'Click to expand'}
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-4 animate-slide-in">
            <p className="text-xs text-gray-500 mb-3">
              These are PCA-transformed features from the original transaction data. 
              Default values of 0 represent average behavior.
            </p>
            <div className="v-features-grid">
              {vFields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <label 
                    htmlFor={field.name}
                    className="block text-xs font-medium text-gray-600"
                  >
                    {field.label}
                  </label>
                  <input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    step={field.step}
                    className="input-field text-xs py-1.5"
                    disabled={disabled || isSubmitting}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="btn btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center"
        >
          {isSubmitting ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Analyze Transaction
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </form>
  );
}
