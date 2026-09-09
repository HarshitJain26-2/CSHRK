import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const ToastStack: React.FC = () => {
  const { toasts, removeToast } = useWorkforce();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = 'info';
        let bgClass = 'bg-surface-container-lowest text-on-surface border-surface-container-high';
        let iconClass = 'text-primary';

        if (toast.type === 'success') {
          icon = 'check_circle';
          iconClass = 'text-tertiary';
        } else if (toast.type === 'warning') {
          icon = 'warning';
          iconClass = 'text-error';
        } else if (toast.type === 'error') {
          icon = 'error';
          iconClass = 'text-error';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border ${bgClass} transition-all transform translate-y-0`}
          >
            <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${iconClass}`}>
              {icon}
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  {toast.title}
                </span>
                <span className="text-[10px] text-outline font-label-sm ml-2 shrink-0">
                  {toast.timestamp}
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-outline hover:text-on-surface p-1 rounded-lg shrink-0"
              title="Dismiss"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
