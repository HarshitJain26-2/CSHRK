import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const ConfirmationDialogsView: React.FC = () => {
  const { openConfirmDialog, addToast } = useWorkforce();

  const handleDeactivateWorker = () => {
    openConfirmDialog({
      title: 'Stand-Down Worker Carlos Mendez?',
      description: 'Worker WKR-8042 will be placed on Stand-down / Inactive status. Their active agricultural machine operation assignments and dispatch authorization will be paused.',
      confirmLabel: 'Confirm Stand-Down',
      isDestructive: true,
      onConfirm: () => {
        addToast('warning', 'Worker Deactivated', 'Carlos Mendez has been moved to Stand-down status.');
      },
    });
  };

  const handleDeactivateSkill = () => {
    openConfirmDialog({
      title: 'Deactivate Skill: Tractor Operations?',
      description: 'CRITICAL WARNING: 642 workers are currently mapped to Tractor Operations. Deactivating this competency will immediately flag their roster clearance and freeze related shift dispatches.',
      confirmLabel: 'Deactivate Competency',
      isDestructive: true,
      onConfirm: () => {
        addToast('error', 'Skill Deactivated', 'Tractor Operations (SKL-1042) marked deprecated.');
      },
    });
  };

  const handleRevokeCert = () => {
    openConfirmDialog({
      title: 'Revoke Regulatory License AWS D1.1?',
      description: 'Revoking AWS-D1-840921 will dispatch an immediate compliance breach notification to the Midland Fabrication Cooperative delegate and remove structural welding clearance.',
      confirmLabel: 'Revoke License Immediately',
      isDestructive: true,
      onConfirm: () => {
        addToast('error', 'License Revoked', 'AWS D1.1 Structural Welding revoked for non-compliance.');
      },
    });
  };

  const handleTransferWorker = () => {
    openConfirmDialog({
      title: 'Transfer Member to Cascadia Forestry?',
      description: 'This will reassign Elena Rostova (WKR-9120) from Midland Fabrication Cooperative to Cascadia Forestry Cooperative. Regional collective agreement transfer fees will apply.',
      confirmLabel: 'Execute Cooperative Transfer',
      isDestructive: false,
      onConfirm: () => {
        addToast('success', 'Transfer Completed', 'Elena Rostova transferred to Cascadia Forestry Cooperative.');
      },
    });
  };

  const handleUnsavedChanges = () => {
    openConfirmDialog({
      title: 'Discard Unsaved Profile Modifications?',
      description: 'You have uncommitted modifications to the worker competencies rubric. Navigating away now will permanently discard all unsaved edits.',
      confirmLabel: 'Discard Changes',
      cancelLabel: 'Keep Editing',
      isDestructive: true,
      onConfirm: () => {
        addToast('info', 'Changes Discarded', 'Form reverted to last saved state.');
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="px-space-md pt-space-md pb-space-sm border-b border-surface-container-high bg-surface-container-low">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Confirmation Dialogs System</h1>
        <p className="font-body-sm text-body-sm text-secondary">
          High-friction accessible modal dialogs for destructive actions, worker transfers, and compliance alerts.
        </p>
      </div>

      <div className="p-space-md max-w-4xl mx-auto w-full space-y-4">
        <div className="p-space-md bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">
            Enterprise Destructive Action Triggers
          </span>
          <p className="font-body-sm text-body-sm text-secondary">
            Click any trigger below to inspect the accessible backdrop-blurred modal dialog and review its contextual warnings and confirmation buttons:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* 1. Worker Deactivation */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-error">person_off</span>
                  <span>1. Deactivate Worker</span>
                </div>
                <p className="text-[12px] font-body-sm text-secondary">
                  Fires when shift supervisor stands down a collective worker.
                </p>
              </div>
              <button
                onClick={handleDeactivateWorker}
                className="w-full py-2 rounded-xl bg-error text-on-error hover:opacity-90 font-label-md text-label-md transition-opacity"
              >
                Trigger Worker Deactivation Modal
              </button>
            </div>

            {/* 2. Skill Deactivation */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-error">psychology_alt</span>
                  <span>2. Deactivate Skill (High Impact)</span>
                </div>
                <p className="text-[12px] font-body-sm text-secondary">
                  Warns administrator that 642 workers are currently mapped to the skill.
                </p>
              </div>
              <button
                onClick={handleDeactivateSkill}
                className="w-full py-2 rounded-xl bg-error text-on-error hover:opacity-90 font-label-md text-label-md transition-opacity"
              >
                Trigger Skill Impact Warning
              </button>
            </div>

            {/* 3. Revoke Certification */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-error">gavel</span>
                  <span>3. Revoke Certification License</span>
                </div>
                <p className="text-[12px] font-body-sm text-secondary">
                  Breach notice dispatched to regional cooperative delegate upon confirm.
                </p>
              </div>
              <button
                onClick={handleRevokeCert}
                className="w-full py-2 rounded-xl bg-error text-on-error hover:opacity-90 font-label-md text-label-md transition-opacity"
              >
                Trigger Revocation Modal
              </button>
            </div>

            {/* 4. Transfer Cooperative */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-primary">move_down</span>
                  <span>4. Cooperative Transfer</span>
                </div>
                <p className="text-[12px] font-body-sm text-secondary">
                  Non-destructive administrative member relocation across societies.
                </p>
              </div>
              <button
                onClick={handleTransferWorker}
                className="w-full py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors"
              >
                Trigger Society Transfer Modal
              </button>
            </div>

            {/* 5. Unsaved Changes */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between gap-3 sm:col-span-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-semibold">
                  <span className="material-symbols-outlined text-[18px] text-primary">edit_off</span>
                  <span>5. Unsaved Form Modifications Warning</span>
                </div>
                <p className="text-[12px] font-body-sm text-secondary">
                  Prevents accidental data loss when navigating away from edited rubrics.
                </p>
              </div>
              <button
                onClick={handleUnsavedChanges}
                className="w-full py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors"
              >
                Trigger Discard Changes Modal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
