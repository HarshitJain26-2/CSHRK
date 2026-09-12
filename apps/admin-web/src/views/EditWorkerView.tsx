import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const EditWorkerView: React.FC = () => {
  const { selectedWorkerId, workers, cooperatives, updateWorker, deactivateWorker, openConfirmDialog, navigate } = useWorkforce();

  const worker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  const [fullName, setFullName] = useState(worker.fullName);
  const [role, setRole] = useState(worker.role);
  const [phone, setPhone] = useState(worker.phone);
  const [email, setEmail] = useState(worker.email);
  const [employmentType, setEmploymentType] = useState(worker.employmentType);
  const [status, setStatus] = useState(worker.status);
  const [cooperativeId, setCooperativeId] = useState(worker.cooperativeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coopName = cooperatives.find((c) => c.id === cooperativeId)?.name || worker.cooperativeName;
    updateWorker(worker.id, {
      fullName,
      role,
      phone,
      email,
      employmentType,
      status,
      cooperativeId,
      cooperativeName: coopName,
    });
  };

  const handleDeactivate = () => {
    openConfirmDialog({
      title: `Stand-down Worker ${worker.fullName}?`,
      description: `Worker ${worker.id} will be placed into Stand-down / Inactive status. Shift assignments and dispatch permissions will be temporarily paused.`,
      confirmLabel: 'Confirm Stand-down',
      isDestructive: true,
      onConfirm: () => {
        deactivateWorker(worker.id);
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('worker-profile', worker.id)}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Worker Profile</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">Editing Worker Dossier {worker.id}</span>
      </div>

      <form onSubmit={handleSubmit} className="p-space-md space-y-space-md max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Edit Worker Profile: {worker.fullName}
            </h1>
            <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
              {worker.id}
            </span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            Joined: {worker.joinedDate} • Member of {worker.cooperativeName}
          </p>
        </div>

        {/* Identity & Professional Role */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Personal Information & Trade</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Full Legal Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-on-surface font-body-md text-body-md"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Role / Trade Title <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-on-surface font-body-md text-body-md"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Contact Information</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Official Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-on-surface font-body-md text-body-md"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-on-surface font-body-md text-body-md"
              />
            </div>
          </div>
        </div>

        {/* Cooperative Affiliation & Employment Status */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Cooperative & Employment Status</span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Cooperative Society <span className="text-error">*</span>
              </label>
              <select
                value={cooperativeId}
                onChange={(e) => setCooperativeId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-on-surface font-body-md text-body-md"
              >
                {cooperatives.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Employment Type <span className="text-error">*</span>
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-on-surface font-body-md text-body-md"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Contract">Contract</option>
                <option value="In Onboarding">In Onboarding</option>
                <option value="Stand-down">Stand-down</option>
              </select>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Operational Status <span className="text-error">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-none focus:border-primary text-on-surface font-body-md text-body-md"
              >
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="inactive">Inactive</option>
                <option value="expiring">Expiring Certs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
          <button
            type="button"
            onClick={handleDeactivate}
            className="px-4 py-2.5 rounded-xl border border-error/40 text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">block</span>
            <span>Stand-down Worker</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('worker-profile', worker.id)}
              className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
