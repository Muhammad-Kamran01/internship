import React from 'react';
import { ToastMessage } from '../../hooks/useToast';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-600" />;
        let border = 'border-blue-200 bg-blue-50/95';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
          border = 'border-emerald-200 bg-emerald-50/95';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600" />;
          border = 'border-rose-200 bg-rose-50/95';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          border = 'border-amber-200 bg-amber-50/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${border} backdrop-blur-md shadow-lg transition-all duration-300 animate-slide-up`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              {toast.message && <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
