'use client';

import { useState, useEffect } from 'react';
import { ApiStatus as ApiStatusType, Transaction, PredictionResponse } from '@/types';
import { checkHealth } from '@/lib/api';
import ApiStatus from '@/components/ApiStatus';
import TransactionForm from '@/components/TransactionForm';
import ResultDisplay from '@/components/ResultDisplay';
import BatchPrediction from '@/components/BatchPrediction';
import StatsPanel from '@/components/StatsPanel';
import { Shield, Zap, Database, TrendingUp } from 'lucide-react';

type TabType = 'single' | 'batch' | 'stats';

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatusType>('checking');
  const [activeTab, setActiveTab] = useState<TabType>('single');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check API health on mount and periodically
  useEffect(() => {
    const checkApiHealth = async () => {
      setApiStatus('checking');
      try {
        await checkHealth();
        setApiStatus('connected');
      } catch {
        setApiStatus('disconnected');
      }
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePrediction = (result: PredictionResponse) => {
    setPrediction(result);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'single', label: 'Single Transaction', icon: <Zap className="w-4 h-4" /> },
    { id: 'batch', label: 'Batch Prediction', icon: <Database className="w-4 h-4" /> },
    { id: 'stats', label: 'Statistics', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary-600 rounded-xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Fraud Detection System
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real-time credit card fraud detection powered by machine learning.
            Analyze transactions and identify potential fraud with our advanced MLOps pipeline.
          </p>
        </header>

        {/* API Status */}
        <div className="mb-6">
          <ApiStatus status={apiStatus} onRetry={() => {
            setApiStatus('checking');
            checkHealth()
              .then(() => setApiStatus('connected'))
              .catch(() => setApiStatus('disconnected'));
          }} />
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab flex items-center gap-2 ${
                    activeTab === tab.id ? 'active' : ''
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="card-body">
            {/* Single Transaction Tab */}
            {activeTab === 'single' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <TransactionForm
                    onPrediction={handlePrediction}
                    onLoadingChange={handleLoadingChange}
                    disabled={apiStatus !== 'connected'}
                  />
                </div>
                <div>
                  <ResultDisplay
                    prediction={prediction}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Batch Prediction Tab */}
            {activeTab === 'batch' && (
              <BatchPrediction disabled={apiStatus !== 'connected'} />
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <StatsPanel disabled={apiStatus !== 'connected'} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>
            Fraud Detection MLOps Pipeline • Built with Next.js, FastAPI, and scikit-learn
          </p>
          <p className="mt-1">
            Model: Random Forest Classifier • Threshold: 0.5 • ROC-AUC: 0.98
          </p>
        </footer>
      </div>
    </main>
  );
}
