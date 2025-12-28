'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { ApiStatus as ApiStatusType } from '@/types';

interface ApiStatusProps {
  status: ApiStatusType;
  onRetry: () => void;
}

export default function ApiStatus({ status, onRetry }: ApiStatusProps) {
  const statusConfig = {
    connected: {
      label: 'API Connected',
      description: 'FastAPI backend is online and ready',
      icon: Wifi,
      dotClass: 'connected',
      bgClass: 'bg-green-50 border-green-200',
      textClass: 'text-green-700',
    },
    disconnected: {
      label: 'API Disconnected',
      description: 'Unable to connect to FastAPI backend at localhost:8000',
      icon: WifiOff,
      dotClass: 'disconnected',
      bgClass: 'bg-red-50 border-red-200',
      textClass: 'text-red-700',
    },
    checking: {
      label: 'Checking Connection',
      description: 'Verifying API connection status...',
      icon: RefreshCw,
      dotClass: 'checking',
      bgClass: 'bg-yellow-50 border-yellow-200',
      textClass: 'text-yellow-700',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border px-4 py-3 ${config.bgClass} animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`status-dot ${config.dotClass}`} />
            <Icon className={`w-5 h-5 ${config.textClass} ${status === 'checking' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className={`font-medium ${config.textClass}`}>
              {config.label}
            </p>
            <p className={`text-sm ${config.textClass} opacity-80`}>
              {config.description}
            </p>
          </div>
        </div>
        
        {status === 'disconnected' && (
          <button
            onClick={onRetry}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
