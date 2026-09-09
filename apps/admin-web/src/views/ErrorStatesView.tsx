import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const ErrorStatesView: React.FC = () => {
  const { navigate, addToast } = useWorkforce();
  const [activeTab, setActiveTab] = useState<'404' | '403' | '500' | 'inline' | 'timeout'>('404');
  const [retrySimulating, setRetrySimulating] = useState(false);

  const handleRetry = () => {
    setRetrySimulating(true);
    setTimeout(() => {
      setRetrySimulating(false);
      addToast('success', 'Telemetry Reconnected', 'Secure connection to federation registry restored.');
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="px-space-md pt-space-md pb-space-sm border-b border-surface-container-high bg-surface-container-low">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Error States System</h1>
        <p className="font-body-sm text-body-sm text-secondary">
          Design system patterns for regulatory exceptions, HTTP fault codes, and inline form validations.
        </p>

        {/* State Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-1">
          {[
            { id: '404', label: '1. 404 Not Found' },
            { id: '403', label: '2. 403 Restricted' },
            { id: '500', label: '3. 500 Telemetry Down' },
            { id: 'inline', label: '4. Inline Form Validation' },
            { id: 'timeout', label: '5. Network Timeout' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-error text-on-error font-semibold shadow-xs'
                  : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low border border-surface-container-high'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-space-md max-w-2xl mx-auto w-full">
        {/* 404 Not Found */}
        {activeTab === '404' && (
          <div className="p-12 bg-surface-container-lowest rounded-2xl text-center space-y-4 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-outline mx-auto">
              <span className="material-symbols-outlined text-[40px]">person_search</span>
            </div>
            <div className="space-y-1">
              <span className="font-code-sm text-[12px] font-bold text-primary uppercase">Error 404</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Worker Record Not Found</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm mx-auto">
                Worker profile with identifier WKR-9999 could not be resolved in the federation database. It may have been archived or transferred.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('workers')}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm"
              >
                Return to Workers Directory
              </button>
            </div>
          </div>
        )}

        {/* 403 Forbidden / Regulatory Restriction */}
        {activeTab === '403' && (
          <div className="p-12 bg-surface-container-lowest rounded-2xl text-center space-y-4 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-error-container/40 flex items-center justify-center text-error mx-auto">
              <span className="material-symbols-outlined text-[40px]">lock</span>
            </div>
            <div className="space-y-1">
              <span className="font-code-sm text-[12px] font-bold text-error uppercase">Security Clearance 403</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Regulatory Clearance Required</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm mx-auto">
                Your role credentials lack supervisory clearance to modify federal hazmat transport certification logs. Contact the Lead Federation Delegate.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('dashboard')}
                className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* 500 Internal Error */}
        {activeTab === '500' && (
          <div className="p-12 bg-surface-container-lowest rounded-2xl text-center space-y-4 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-error-container flex items-center justify-center text-on-error-container mx-auto">
              <span className="material-symbols-outlined text-[40px]">dns</span>
            </div>
            <div className="space-y-1">
              <span className="font-code-sm text-[12px] font-bold text-error uppercase">Server Error 500</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Telemetry Service Disruption</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm mx-auto">
                The centralized licensing registry API timed out while reconciling cryptographic worker hashes. Our infrastructure team has been alerted.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetry}
                disabled={retrySimulating}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm flex items-center gap-2"
              >
                {retrySimulating && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>}
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Inline Form Validation Showcase */}
        {activeTab === 'inline' && (
          <div className="p-space-md bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-error">report</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Inline Form Validation Tokens</span>
            </div>

            <div className="space-y-3">
              {/* Field 1: Invalid License Number */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-error font-semibold">
                  Credential Number (Format Invalid)
                </label>
                <input
                  type="text"
                  defaultValue="INVALID-123"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border-2 border-error focus:outline-none"
                />
                <span className="text-[11px] font-body-sm text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  Must match regulatory format AWS-XX-###### or OSHA-##-######.
                </span>
              </div>

              {/* Field 2: Expiration Date in Past */}
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-label-sm text-error font-semibold">
                  Expiration Date (Expired)
                </label>
                <input
                  type="date"
                  defaultValue="2024-01-01"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border-2 border-error focus:outline-none"
                />
                <span className="text-[11px] font-body-sm text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  New credentials cannot be onboarded with past expiration dates.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Network Timeout State */}
        {activeTab === 'timeout' && (
          <div className="p-12 bg-surface-container-lowest rounded-2xl text-center space-y-4 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary mx-auto">
              <span className="material-symbols-outlined text-[40px]">wifi_off</span>
            </div>
            <div className="space-y-1">
              <span className="font-code-sm text-[12px] font-bold text-secondary uppercase">Network Timeout</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Offline or Unstable Link</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm mx-auto">
                Real-time cooperative worker synchronization paused due to offline network connection. Cached records remain safely available.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetry}
                disabled={retrySimulating}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm flex items-center gap-2"
              >
                {retrySimulating && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>}
                <span>Reconnect Telemetry</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
