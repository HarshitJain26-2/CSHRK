import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';
import { CertificationRecord } from '../data/workforceData';

export const CertificationVerificationView: React.FC = () => {
  const { verificationQueue, verifyCertification, openConfirmDialog, addToast, navigate } = useWorkforce();

  const [selectedQueueItem, setSelectedQueueItem] = useState<CertificationRecord>(
    verificationQueue[0] || ({} as CertificationRecord)
  );

  const [inspectorNotes, setInspectorNotes] = useState('Registry credential hash validated against national database.');

  const handleApprove = (cert: CertificationRecord) => {
    verifyCertification(cert.id, inspectorNotes);
    // Switch to next pending if available
    const remaining = verificationQueue.filter((q) => q.id !== cert.id);
    if (remaining.length > 0) {
      setSelectedQueueItem(remaining[0]);
    }
  };

  const handleReject = (cert: CertificationRecord) => {
    openConfirmDialog({
      title: `Reject Credential ${cert.credentialNumber}?`,
      description: `Please confirm rejection of ${cert.certificationName} for ${cert.workerName}. A compliance clarification request will be dispatched to the ${cert.cooperativeName} delegate.`,
      confirmLabel: 'Reject Credential',
      isDestructive: true,
      onConfirm: () => {
        verifyCertification(cert.id, 'REJECTED: Document tamper/illegibility check failed.');
        addToast('warning', 'Credential Rejected', `${cert.id} rejected and returned to worker for re-upload.`);
        const remaining = verificationQueue.filter((q) => q.id !== cert.id);
        if (remaining.length > 0) {
          setSelectedQueueItem(remaining[0]);
        }
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Action Header */}
      <div className="px-space-md pt-space-md pb-space-xs flex flex-col gap-space-sm border-b border-surface-container-high bg-surface-container-low">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Certification Verification Workspace
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[12px] font-label-sm font-bold bg-error text-on-error animate-pulse">
                {verificationQueue.length} Pending
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">
              Review candidate licensing documents, audit verification hashes, and sign off regulatory clearance.
            </p>
          </div>

          <button
            onClick={() => navigate('certs')}
            className="h-[38px] px-space-sm bg-surface-container text-secondary hover:text-on-surface rounded-xl font-label-md text-label-md flex items-center gap-space-2xs transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>All Certifications</span>
          </button>
        </div>

        {/* Verification Queue Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs py-1">
          <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container-high">
            <span className="text-[12px] font-label-sm text-secondary">Queue Depth</span>
            <strong className="text-primary font-headline-sm">{verificationQueue.length} items</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container-high">
            <span className="text-[12px] font-label-sm text-secondary">Avg Review Time</span>
            <strong className="text-on-surface font-headline-sm">4.2 hrs</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container-high">
            <span className="text-[12px] font-label-sm text-secondary">Verified Today</span>
            <strong className="text-tertiary font-headline-sm">38 certs</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container-high">
            <span className="text-[12px] font-label-sm text-secondary">Match Accuracy</span>
            <strong className="text-tertiary font-headline-sm">99.8%</strong>
          </div>
        </div>
      </div>

      {verificationQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl text-center space-y-3 m-6 border border-surface-container-high shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[36px]">verified</span>
          </div>
          <span className="font-headline-lg text-headline-lg text-on-surface">Queue All Clear</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Zero credentials are currently awaiting regulatory sign-off. All active certifications are compliant.
          </p>
          <button
            onClick={() => navigate('certs')}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md"
          >
            Inspect Registered Certifications
          </button>
        </div>
      ) : (
        /* Split Screen Dual-Inspector Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-surface-container-high">
          {/* Left Column: Queue List (5 cols) */}
          <div className="lg:col-span-5 border-r border-surface-container-high bg-surface-container-lowest p-space-sm space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
                Pending Verification Queue ({verificationQueue.length})
              </span>
              <span className="text-[11px] font-code-sm text-secondary">Sorted by Urgency</span>
            </div>

            {verificationQueue.map((item) => {
              const isSelected = selectedQueueItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedQueueItem(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-surface-container-low border-primary ring-1 ring-primary shadow-xs'
                      : 'bg-surface-container-lowest border-surface-container-high hover:bg-surface-container-low/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.workerAvatar}
                        alt={item.workerName}
                        className="w-9 h-9 rounded-lg object-cover bg-surface-container shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {item.workerName}
                        </span>
                        <span className="text-[11px] font-body-sm text-primary truncate">
                          {item.certificationName}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-label-sm font-bold uppercase shrink-0 ${
                        item.urgency === 'high'
                          ? 'bg-error-container text-on-error-container animate-pulse'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      {item.urgency === 'high' ? 'High Urgency' : 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-body-sm text-on-surface-variant pt-1 border-t border-surface-container-low">
                    <span>{item.cooperativeName}</span>
                    <span className="font-code-sm">{item.credentialNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Credential Inspector & Document Preview (7 cols) */}
          {selectedQueueItem && (
            <div className="lg:col-span-7 bg-surface p-space-md space-y-space-md overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
              {/* Active Inspector Top Dossier */}
              <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedQueueItem.workerAvatar}
                      alt={selectedQueueItem.workerName}
                      className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0 shadow-xs"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                          {selectedQueueItem.workerName}
                        </h2>
                        <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                          {selectedQueueItem.workerId}
                        </span>
                      </div>
                      <span className="font-body-sm text-[12px] text-secondary mt-0.5">
                        {selectedQueueItem.workerRole} • {selectedQueueItem.cooperativeName}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-primary-fixed text-on-primary-fixed font-semibold">
                    Review Required
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low grid grid-cols-2 gap-2 text-[12px] font-body-sm text-on-surface">
                  <div>
                    <span className="text-secondary block font-label-sm text-[10px] uppercase">Credential Title</span>
                    <strong className="text-on-surface">{selectedQueueItem.certificationName}</strong>
                  </div>
                  <div>
                    <span className="text-secondary block font-label-sm text-[10px] uppercase">Issuing Organization</span>
                    <strong className="text-on-surface">{selectedQueueItem.issuingOrganization}</strong>
                  </div>
                  <div>
                    <span className="text-secondary block font-label-sm text-[10px] uppercase">License Serial #</span>
                    <strong className="font-code-sm text-primary">{selectedQueueItem.credentialNumber}</strong>
                  </div>
                  <div>
                    <span className="text-secondary block font-label-sm text-[10px] uppercase">Expiration Horizon</span>
                    <strong>{selectedQueueItem.expiryDate}</strong>
                  </div>
                </div>
              </div>

              {/* Automated Registry Hash Telemetry Check */}
              <div className="p-3 rounded-xl bg-tertiary-fixed/20 border border-tertiary-fixed-dim/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-tertiary">check_circle</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Automated Registry API Match: 100% Confirmed
                    </span>
                    <span className="text-[11px] font-body-sm text-on-surface-variant">
                      Certificate serial {selectedQueueItem.credentialNumber} validated against {selectedQueueItem.issuingOrganization} ledger.
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-label-sm bg-tertiary-fixed text-on-tertiary-fixed font-bold shrink-0">
                  PASS
                </span>
              </div>

              {/* Simulated Document Viewer Scrim */}
              <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Uploaded Certificate Scan</span>
                  <span className="text-[11px] font-code-sm text-secondary">
                    {selectedQueueItem.credentialNumber}_OFFICIAL.pdf
                  </span>
                </div>

                <div className="aspect-[16/9] w-full rounded-xl bg-surface-container-low border border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                  <span className="material-symbols-outlined text-[44px] text-primary/60 mb-1">
                    verified_user
                  </span>
                  <div className="font-label-md text-label-md text-on-surface font-semibold">
                    {selectedQueueItem.certificationName}
                  </div>
                  <div className="text-[11px] font-body-sm text-secondary">
                    Issued to {selectedQueueItem.workerName} • Validated on {selectedQueueItem.issueDate}
                  </div>
                  <div className="mt-3 px-3 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-[11px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Digital Cryptographic Signature Verified</span>
                  </div>
                </div>
              </div>

              {/* Sign-Off Action Deck */}
              <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                    Inspector Regulatory Sign-Off Note
                  </label>
                  <input
                    type="text"
                    value={inspectorNotes}
                    onChange={(e) => setInspectorNotes(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-low">
                  <button
                    type="button"
                    onClick={() => handleReject(selectedQueueItem)}
                    className="px-4 py-2 rounded-xl bg-surface-container text-error hover:bg-error-container/40 font-label-md text-label-md transition-colors"
                  >
                    Reject Credential
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      addToast('info', 'Clarification Sent', `Requested supplemental training record from ${selectedQueueItem.workerName}.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
                  >
                    Request Info
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedQueueItem)}
                    className="px-5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
