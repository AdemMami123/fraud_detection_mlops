// Transaction input type with all 30 features
export interface Transaction {
  Time: number;
  Amount: number;
  V1: number;
  V2: number;
  V3: number;
  V4: number;
  V5: number;
  V6: number;
  V7: number;
  V8: number;
  V9: number;
  V10: number;
  V11: number;
  V12: number;
  V13: number;
  V14: number;
  V15: number;
  V16: number;
  V17: number;
  V18: number;
  V19: number;
  V20: number;
  V21: number;
  V22: number;
  V23: number;
  V24: number;
  V25: number;
  V26: number;
  V27: number;
  V28: number;
}

// Prediction response from API
export interface PredictionResponse {
  fraud_probability: number;
  is_fraud: boolean;
  threshold: number;
}

// Batch prediction response
export interface BatchPredictionResponse {
  predictions: PredictionResponse[];
  total_count: number;
  fraud_count: number;
}

// Health check response
export interface HealthResponse {
  status: string;
  model_loaded?: boolean;
  timestamp?: string;
}

// API status
export type ApiStatus = 'connected' | 'disconnected' | 'checking';

// Form field configuration
export interface FormField {
  name: keyof Transaction;
  label: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
}

// Default transaction values (typical normal transaction)
export const DEFAULT_TRANSACTION: Transaction = {
  Time: 0,
  Amount: 100.0,
  V1: 0,
  V2: 0,
  V3: 0,
  V4: 0,
  V5: 0,
  V6: 0,
  V7: 0,
  V8: 0,
  V9: 0,
  V10: 0,
  V11: 0,
  V12: 0,
  V13: 0,
  V14: 0,
  V15: 0,
  V16: 0,
  V17: 0,
  V18: 0,
  V19: 0,
  V20: 0,
  V21: 0,
  V22: 0,
  V23: 0,
  V24: 0,
  V25: 0,
  V26: 0,
  V27: 0,
  V28: 0,
};

// Sample fraudulent transaction for testing
export const SAMPLE_FRAUD_TRANSACTION: Transaction = {
  Time: 472,
  Amount: 529.0,
  V1: -2.3122265423263,
  V2: 1.95199201064158,
  V3: -1.60985073229769,
  V4: 3.9979055875468,
  V5: -0.522187864667764,
  V6: -1.42654531920595,
  V7: -2.53738730624579,
  V8: 1.39165724829804,
  V9: -2.77008927719433,
  V10: -2.77227214465915,
  V11: 3.20203320709635,
  V12: -2.89990738849473,
  V13: -0.595221881324605,
  V14: -4.28925378244217,
  V15: 0.389724120274487,
  V16: -1.14074717980657,
  V17: -2.83005567450437,
  V18: -0.0168224681808257,
  V19: 0.416955705037907,
  V20: 0.126910559061474,
  V21: 0.517232370861764,
  V22: -0.0350493686052974,
  V23: -0.465211076182388,
  V24: 0.320198198514526,
  V25: 0.0445191674731724,
  V26: 0.177839798284401,
  V27: 0.261145002567677,
  V28: -0.143275874698919,
};

// Sample normal transaction for testing
export const SAMPLE_NORMAL_TRANSACTION: Transaction = {
  Time: 406,
  Amount: 2.69,
  V1: -1.35980713,
  V2: -0.07278117,
  V3: 2.53634674,
  V4: 1.37815522,
  V5: -0.33832077,
  V6: 0.46238778,
  V7: 0.23959855,
  V8: 0.09869790,
  V9: 0.36378697,
  V10: 0.09079417,
  V11: -0.55159953,
  V12: -0.61780086,
  V13: -0.99138985,
  V14: -0.31116935,
  V15: 1.46817697,
  V16: -0.47040053,
  V17: 0.20797124,
  V18: 0.02579058,
  V19: 0.40399296,
  V20: 0.25141210,
  V21: -0.01830678,
  V22: 0.27783758,
  V23: -0.11047391,
  V24: 0.06692807,
  V25: 0.12853936,
  V26: -0.18911484,
  V27: 0.13355883,
  V28: -0.02105305,
};

// Form fields configuration
export const FORM_FIELDS: FormField[] = [
  {
    name: 'Time',
    label: 'Time',
    description: 'Seconds elapsed since first transaction in dataset',
    min: 0,
    step: 1,
    defaultValue: 0,
  },
  {
    name: 'Amount',
    label: 'Amount ($)',
    description: 'Transaction amount in dollars',
    min: 0,
    step: 0.01,
    defaultValue: 100,
  },
  ...Array.from({ length: 28 }, (_, i) => ({
    name: `V${i + 1}` as keyof Transaction,
    label: `V${i + 1}`,
    description: `PCA component ${i + 1}`,
    step: 0.000001,
    defaultValue: 0,
  })),
];
