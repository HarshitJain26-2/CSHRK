import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const CertificationDetailsView: React.FC = () => {
  const {
    selectedCertId,
    certifications,
    navigate,
    verifyCertification,
    renewCertification,
    revokeCertification,
    openConfirmDialog,
    setSelectedWorkerId,
  } = useWorkforce();

  const cert = certifications.find((c) => c.id === selectedCertId) || certifications[0];

  const handleRenew = () => {
    openConfirmDialog({
      title: `Renew Credential ${cert.certificationName}?`,
      description: `This will update the expiration date to Sep 09, 2029 (3-Year extension) and mark the credential status Valid.`,
      confirmLabel: 'Confirm Renewal',
      onConfirm: () => {
        renewCertification(cert.id, '2029-09-09');
      },
    });
  };

  const handleRevoke = () => {
    openConfirmDialog({
      title: `Revoke Credential ${cert.credentialNumber}?`,
      description: `Warning: Revoking this license will immediately trigger a non-compliance notice for ${cert.workerName} (${cert.workerId}) and notify the ${cert.cooperativeName} delegate.`,
      confirmLabel: 'Revoke License',
      isDestructive: true,
      onConfirm: () => {
        revokeCertification(cert.id, 'Supervisory compliance audit non-adherence.');
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Bar */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('certs')}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Certifications</span>
        </button>

        <div className="flex items-center gap-2">
          {cert.status === 'pending' && (
            <button
              onClick={() => verifyCertification(cert.id)}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container shadow-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Approve & Verify</span>
            </button>
          )}

          <button
            onClick={handleRenew}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
            <span>Renew</span>
          </button>

          <button
            onClick={() => navigate('edit-cert', cert.id)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-label-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit</span>
          </button>

          <button
            onClick={handleRevoke}
            className="px-3 py-1.5 rounded-xl bg-error-container/40 text-error hover:bg-error-container font-label-sm text-label-sm flex items-center gap-1"
            title="Revoke License"
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Revoke</span>
          </button>
        </div>
      </div>

      {/* Hero Credential Dossier */}
      <div className="px-space-md pt-space-md pb-space-lg bg-surface-container-low border-b border-surface-container-high space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface truncate">
                  {cert.certificationName}
                </h1>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                  {cert.id}
                </span>
              </div>
              <span className="font-body-md text-body-md text-primary font-medium mt-0.5">
                {cert.issuingOrganization} • Credential #{cert.credentialNumber}
              </span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[12px] font-label-sm font-semibold shrink-0 ${
              cert.status === 'valid'
                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                : cert.status === 'expiring'
                ? 'bg-error text-on-error font-bold'
                : cert.status === 'pending'
                ? 'bg-primary-fixed text-on-primary-fixed'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {cert.status.toUpperCase()}
          </span>
        </div>

        {/* Worker Holder Card */}
        <div
          onClick={() => {
            setSelectedWorkerId(cert.workerId);
            navigate('worker-profile', cert.workerId);
          }}
          className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between hover:bg-surface-container/50 cursor-pointer transition-colors max-w-xl"
        >
          <div className="flex items-center gap-3">
            <img
              src={cert.workerAvatar}
              alt={cert.workerName}
              className="w-10 h-10 rounded-xl object-cover bg-surface-container"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {cert.workerName}
                </span>
                <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1 py-0.2 rounded">
                  {cert.workerId}
                </span>
              </div>
              <span className="text-[12px] font-body-sm text-on-surface-variant">
                {cert.workerRole} • {cert.cooperativeName}
              </span>
            </div>
          </div>
          <span className="text-primary font-label-sm text-label-sm flex items-center gap-1">
            <span>View Worker</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </div>

      {/* Main Dossier Content */}
      <div className="p-space-md grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Left: Metadata & Verification History */}
        <div className="lg:col-span-2 space-y-space-md">
          {/* Metadata Grid */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
            <span className="font-headline-sm text-headline-sm text-on-surface">Registration Metadata</span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-body-sm text-[13px]">
              <div>
                <span className="text-secondary block text-[11px] font-label-sm uppercase">License Number</span>
                <strong className="text-on-surface font-code-sm">{cert.credentialNumber}</strong>
              </div>
              <div>
                <span className="text-secondary block text-[11px] font-label-sm uppercase">Issue Date</span>
                <strong className="text-on-surface">{cert.issueDate}</strong>
              </div>
              <div>
                <span className="text-secondary block text-[11px] font-label-sm uppercase">Expiration Date</span>
                <strong className={cert.status === 'expiring' ? 'text-error font-bold' : 'text-on-surface'}>
                  {cert.expiryDate}
                </strong>
              </div>
              <div>
                <span className="text-secondary block text-[11px] font-label-sm uppercase">Verification Mode</span>
                <strong className="text-on-surface">{cert.verificationMethod}</strong>
              </div>
              <div>
                <span className="text-secondary block text-[11px] font-label-sm uppercase">Verified Sign-off</span>
                <strong className="text-on-surface">{cert.verifiedBy || 'Pending Official'}</strong>
              </div>
              <div>
                <span className="text-secondary block text-[11px] font-label-sm uppercase">Regulatory Jurisdiction</span>
                <strong className="text-on-surface">National Standards Board</strong>
              </div>
            </div>

            {cert.verificationNotes && (
              <div className="p-3 rounded-lg bg-surface-container-low text-[13px] font-body-sm border border-surface-container-high text-on-surface">
                <span className="font-semibold text-secondary">Inspector Audit Notes:</span> {cert.verificationNotes}
              </div>
            )}
          </div>

          {/* Audit & Renewal Timeline */}
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
            <span className="font-headline-sm text-headline-sm text-on-surface">Licensing Timeline</span>

            <div className="space-y-3 border-l-2 border-surface-container-high pl-4 ml-2">
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary absolute -left-[21px] top-1"></span>
                <div className="font-label-md text-label-md text-on-surface">Registry Hash Confirmed</div>
                <div className="text-[11px] font-body-sm text-on-surface-variant">Validated against issuing registry server</div>
              </div>
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[21px] top-1"></span>
                <div className="font-label-md text-label-md text-on-surface">Uploaded via Worker Onboarding</div>
                <div className="text-[11px] font-body-sm text-on-surface-variant">Document hash registered on {cert.issueDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Document Viewer / Scanned Certificate Pane */}
        <div className="space-y-3">
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">Document Attachment</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-label-sm bg-surface-container text-secondary">
                PDF / Scan
              </span>
            </div>

            {/* Document Scan Simulated Preview */}
            <div className="aspect-[3/4] w-full rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group">
              <span className="material-symbols-outlined text-[48px] text-primary/70 mb-2">
                description
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Official Regulatory Certificate
              </span>
              <span className="font-code-sm text-[11px] text-secondary mt-1">
                {cert.credentialNumber}.pdf
              </span>
              <span className="text-[10px] font-label-sm text-tertiary mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span> Watermarked & Tamper-checked
              </span>

              {/* Hover overlay with download */}
              <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href="#download-doc"
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-md flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>View Full</span>
                </a>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => {
                  window.open('#', '_blank');
                }}
                className="w-full py-2.5 rounded-xl bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download Verified PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
