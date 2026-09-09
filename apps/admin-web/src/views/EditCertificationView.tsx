import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const EditCertificationView: React.FC = () => {
  const { selectedCertId, certifications, updateCertification, navigate } = useWorkforce();

  const cert = certifications.find((c) => c.id === selectedCertId) || certifications[0];

  const [certificationName, setCertificationName] = useState(cert.certificationName);
  const [issuingOrganization, setIssuingOrganization] = useState(cert.issuingOrganization);
  const [credentialNumber, setCredentialNumber] = useState(cert.credentialNumber);
  const [issueDate, setIssueDate] = useState(cert.issueDate);
  const [expiryDate, setExpiryDate] = useState(cert.expiryDate);
  const [status, setStatus] = useState(cert.status);
  const [notes, setNotes] = useState(cert.verificationNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCertification(cert.id, {
      certificationName,
      issuingOrganization,
      credentialNumber,
      issueDate,
      expiryDate,
      status: status as any,
      verificationNotes: notes,
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('cert-details', cert.id)}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Credential Dossier</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">Editing {cert.id}</span>
      </div>

      <form onSubmit={handleSubmit} className="p-space-md space-y-space-md max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Edit Credential: {cert.certificationName}
            </h1>
            <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
              {cert.id}
            </span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            Holder: {cert.workerName} ({cert.workerId}) • {cert.cooperativeName}
          </p>
        </div>

        {/* Form Fields */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Certification Title</label>
              <input
                type="text"
                value={certificationName}
                onChange={(e) => setCertificationName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Credential / License #</label>
              <input
                type="text"
                value={credentialNumber}
                onChange={(e) => setCredentialNumber(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Issuing Authority</label>
              <input
                type="text"
                value={issuingOrganization}
                onChange={(e) => setIssuingOrganization(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Compliance Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              >
                <option value="valid">Valid / In Good Standing</option>
                <option value="expiring">Expiring Soon (Under 30 Days)</option>
                <option value="expired">Expired / Stand-down</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Expiration Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Inspector Verification Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('cert-details', cert.id)}
            className="h-11 px-5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
          >
            <span>Save Changes</span>
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
