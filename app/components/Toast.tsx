'use client';

import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
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

  const styleMap = {
    success: {
      Icon: CheckCircle2,
      ring: 'border-emerald-300/45',
      icon: 'text-emerald-300',
    },
    error: {
      Icon: TriangleAlert,
      ring: 'border-amber-300/45',
      icon: 'text-amber-300',
    },
    info: {
      Icon: Info,
      ring: 'border-sky-300/45',
      icon: 'text-sky-300',
    },
  } as const;

  const { Icon, ring, icon } = styleMap[type];

  return (
    <div className="fixed right-4 top-4 z-[100] fade-in">
      <div className={`toast ${ring} min-w-[280px] max-w-md p-4`} role="status" aria-live="polite">
        <div className="flex items-start gap-3">
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} />
          <p className="text-body flex-1 leading-snug text-slate-100">{message}</p>
          <button onClick={onClose} className="btn btn-ghost h-7 w-7 p-0" aria-label="Close notification">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

