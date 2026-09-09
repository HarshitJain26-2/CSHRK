import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const AddCertificationView: React.FC = () => {
  const { workers, navigate, addCertification } = useWorkforce();

  const [workerId, setWorkerId] = useState(workers[0]?.id || 'WKR-8042');
  const [certificationName, setCertificationName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('US Dept of Labor / OSHA');
  const [credentialNumber, setCredentialNumber] = useState('');
  const [issueDate, setIssueDate] = useState('2026-09-09');
  const [expiryDate, setExpiryDate] = useState('2029-09-09');
  const [verificationMethod, setVerificationMethod] = useState('Digital Credential Registry Lookup');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('certificate_scan_official.pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCertification({
      workerId,
      certificationName,
      issuingOrganization,
      credentialNumber: credentialNumber || `CR-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate,
      expiryDate,
      verificationMethod,
      verificationNotes: notes,
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('certs')}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Cancel & Return to Certifications</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">New Credential Entry</span>
      </div>

      <form onSubmit={handleSubmit} className="p-space-md space-y-space-md max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Add New Certification</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Register a worker license, trade qualification, or regulatory certification.
          </p>
        </div>

        {/* Worker Selector */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
          <label className="font-label-sm text-label-sm text-on-surface-variant block">
            Select Worker Holder <span className="text-error">*</span>
          </label>
          <select
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className="w-full h-11 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
          >
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.fullName} ({w.id}) — {w.role} ({w.cooperativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Credential Attributes */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Credential Attributes</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Certification Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={certificationName}
                onChange={(e) => setCertificationName(e.target.value)}
                placeholder="e.g. AWS D1.1 Structural Welding"
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Credential / License Number <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={credentialNumber}
                onChange={(e) => setCredentialNumber(e.target.value)}
                placeholder="e.g. AWS-D1-840921"
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Issuing Organization / Authority <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={issuingOrganization}
                onChange={(e) => setIssuingOrganization(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Verification Method
              </label>
              <select
                value={verificationMethod}
                onChange={(e) => setVerificationMethod(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              >
                <option value="Digital Credential Registry Lookup">Digital Credential Registry Lookup</option>
                <option value="In-person Supervisor Practical Exam">In-person Supervisor Practical Exam</option>
                <option value="Third-Party Registry API Match">Third-Party Registry API Match</option>
                <option value="State Licensing Board Verification">State Licensing Board Verification</option>
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
        </div>

        {/* Upload Certificate File Zone */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
          <span className="font-headline-sm text-headline-sm text-on-surface">Upload Document Attachment</span>

          <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center space-y-2 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[36px] text-primary">cloud_upload</span>
            <div className="font-label-md text-label-md text-on-surface">
              Click to select certificate scan or drag file here
            </div>
            <p className="text-[11px] font-body-sm text-on-surface-variant">
              PDF, JPG, or PNG up to 10MB (Government and trade licensing format)
            </p>
            {fileName && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-highest text-primary text-[12px] font-label-sm mt-2">
                <span className="material-symbols-outlined text-[14px]">attach_file</span>
                <span>{fileName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Audit Notes */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-2">
          <label className="font-label-sm text-label-sm text-on-surface-variant">
            Compliance & Verification Audit Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document registry transaction ID, examiner name, or special restrictions."
            className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('certs')}
            className="h-11 px-5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
          >
            <span>Register Certification</span>
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
