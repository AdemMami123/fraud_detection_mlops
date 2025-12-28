'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/lib/api';
import { 
  BarChart3, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Clock
} from 'lucide-react';

interface StatsData {
  total_requests: number;
  avg_fraud_probability: number;
  fraud_count: number;
  fraud_rate: number;
}

interface StatsPanelProps {
  disabled: boolean;
}

export default function StatsPanel({ disabled }: StatsPanelProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    if (disabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [disabled]);

  if (disabled) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="font-medium">API Disconnected</p>
        <p className="text-sm mt-1">Connect to the API to view statistics</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <p className="font-medium text-gray-700">{error}</p>
        <button
          onClick={fetchStats}
          className="btn btn-primary mt-4"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          API Statistics
        </h3>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Requests */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Requests</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_requests.toLocaleString()}
              </p>
            </div>

            {/* Fraud Count */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Fraud Detected</span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {stats.fraud_count.toLocaleString()}
              </p>
            </div>

            {/* Fraud Rate */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Fraud Rate</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {stats.fraud_rate.toFixed(2)}%
              </p>
            </div>

            {/* Avg Probability */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Avg Probability</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {(stats.avg_fraud_probability * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Visual representation */}
          {stats.total_requests > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-4">Request Distribution</h4>
              <div className="space-y-4">
                {/* Normal transactions bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Normal Transactions</span>
                    <span className="font-medium text-green-600">
                      {stats.total_requests - stats.fraud_count} ({(100 - stats.fraud_rate).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${100 - stats.fraud_rate}%` }}
                    />
                  </div>
                </div>

                {/* Fraud transactions bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Fraudulent Transactions</span>
                    <span className="font-medium text-red-600">
                      {stats.fraud_count} ({stats.fraud_rate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.fraud_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">About these statistics</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Statistics are collected from all API prediction requests</li>
              <li>• Data is stored in the server's request log file</li>
              <li>• Statistics auto-refresh every 30 seconds</li>
              <li>• Use the Refresh button for immediate updates</li>
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
