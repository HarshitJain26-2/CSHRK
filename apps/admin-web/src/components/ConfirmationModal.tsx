import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const ConfirmationModal: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useWorkforce();

  if (!confirmDialog.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/45 backdrop-blur-[2px] animate-fadeIn"
      onClick={closeConfirmDialog}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-6 flex flex-col gap-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              confirmDialog.isDestructive
                ? 'bg-error-container text-error'
                : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {confirmDialog.isDestructive ? 'warning' : 'help'}
            </span>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              {confirmDialog.title}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
              {confirmDialog.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-low">
          <button
            type="button"
            onClick={closeConfirmDialog}
            className="px-4 py-2 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            {confirmDialog.cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              confirmDialog.onConfirm();
              closeConfirmDialog();
            }}
            className={`px-4 py-2 rounded-xl font-label-md text-label-md shadow-sm transition-opacity active:opacity-90 ${
              confirmDialog.isDestructive
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            {confirmDialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
