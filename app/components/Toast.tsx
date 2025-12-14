'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const bgColors = {
    success: 'bg-green-600/95',
    error: 'bg-red-600/95',
    info: 'bg-blue-600/95',
  };

  const borderColors = {
    success: 'border-green-400/40',
    error: 'border-red-400/40',
    info: 'border-blue-400/40',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-up">
      <div className={`glass-card ${bgColors[type]} ${borderColors[type]} p-4 rounded-xl shadow-2xl max-w-md min-w-[300px]`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">{icons[type]}</span>
          <p className="text-white font-medium flex-1 text-sm md:text-base">{message}</p>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold transition-colors flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
