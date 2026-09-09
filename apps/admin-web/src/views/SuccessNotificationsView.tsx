import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const SuccessNotificationsView: React.FC = () => {
  const { addToast } = useWorkforce();

  const handleTriggerToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, msg: string) => {
    addToast(type, title, msg);
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="px-space-md pt-space-md pb-space-sm border-b border-surface-container-high bg-surface-container-low">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Success Notifications System</h1>
        <p className="font-body-sm text-body-sm text-secondary">
          Enterprise toast notification stack, inline confirmation banners, and feedback patterns.
        </p>
      </div>

      <div className="p-space-md max-w-4xl mx-auto w-full space-y-space-md">
        {/* Inline Success Banners Showcase */}
        <div className="p-space-md bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm space-y-3">
          <span className="font-headline-sm text-headline-sm text-on-surface">Inline System Banners</span>

          {/* Success Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <span className="material-symbols-outlined text-[22px] text-emerald-700 shrink-0">check_circle</span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-md text-label-md text-emerald-950 font-semibold">
                Worker WKR-8042 (Carlos Mendez) Profile Successfully Synchronized
              </span>
              <p className="text-[12px] font-body-sm text-emerald-800 mt-0.5">
                All updated competencies and agricultural licenses have been propagated to the Pacific Northwest regional ledger.
              </p>
            </div>
          </div>

          {/* Regulatory Verification Banner */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex items-start gap-3">
            <span className="material-symbols-outlined text-[22px] text-primary shrink-0">verified</span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Certification OSHA-30 Verified & Cryptographically Signed
              </span>
              <p className="text-[12px] font-body-sm text-secondary mt-0.5">
                Inspector sign-off stamped by Platform Compliance Lead. License expiry set to Aug 15, 2027.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Toast Triggers Card */}
        <div className="p-space-md bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">
            Floating Toast Notification Triggers
          </span>
          <p className="font-body-sm text-body-sm text-secondary">
            Click any trigger below to spawn a floating enterprise toast notification with auto-fade timer in the bottom right corner:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() =>
                handleTriggerToast(
                  'success',
                  'Worker Profile Updated',
                  'Worker WKR-8042 (Carlos Mendez) successfully updated and verified.'
                )
              }
              className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary text-left transition-colors flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  1. Worker Profile Updated
                </span>
                <span className="text-[11px] font-body-sm text-secondary">WKR-8042 Carlos Mendez</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
            </button>

            <button
              onClick={() =>
                handleTriggerToast(
                  'success',
                  'Certification Signed Off',
                  'Certification OSHA-30 verified and signed off for Carlos Mendez.'
                )
              }
              className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary text-left transition-colors flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  2. Credential Verified
                </span>
                <span className="text-[11px] font-body-sm text-secondary">OSHA-30 Verified</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-tertiary">verified</span>
            </button>

            <button
              onClick={() =>
                handleTriggerToast(
                  'success',
                  'New Competency Registered',
                  'New skill "Robotic MIG Welding" added to catalog across 8 cooperatives.'
                )
              }
              className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary text-left transition-colors flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  3. New Skill Cataloged
                </span>
                <span className="text-[11px] font-body-sm text-secondary">Added to 12 active domains</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
            </button>

            <button
              onClick={() =>
                handleTriggerToast(
                  'info',
                  'Audit Report Ready',
                  'Report Q3_Workforce_Compliance.pdf is ready for download (4.8 MB).'
                )
              }
              className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high hover:border-primary text-left transition-colors flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  4. Regulatory Report Exported
                </span>
                <span className="text-[11px] font-body-sm text-secondary">Q3_Workforce_Compliance.pdf</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-primary">download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
