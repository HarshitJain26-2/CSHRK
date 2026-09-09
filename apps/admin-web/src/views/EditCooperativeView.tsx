import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const EditCooperativeView: React.FC = () => {
  const { selectedCoopId, cooperatives, updateCooperative, navigate } = useWorkforce();

  const coop = cooperatives.find((c) => c.id === selectedCoopId) || cooperatives[0];

  const [name, setName] = useState(coop.name);
  const [headquarters, setHeadquarters] = useState(coop.headquarters);
  const [delegateName, setDelegateName] = useState(coop.delegateName);
  const [contactEmail, setContactEmail] = useState(coop.contactEmail);
  const [contactPhone, setContactPhone] = useState(coop.contactPhone);
  const [complianceRate, setComplianceRate] = useState(String(coop.complianceRate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCooperative(coop.id, {
      name,
      headquarters,
      delegateName,
      contactEmail,
      contactPhone,
      complianceRate: parseFloat(complianceRate) || coop.complianceRate,
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('coop-details', coop.id)}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Cooperative Dossier</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">Editing Charter {coop.registrationNumber}</span>
      </div>

      <form onSubmit={handleSubmit} className="p-space-md space-y-space-md max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Edit Cooperative: {coop.name}
            </h1>
            <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
              {coop.id}
            </span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            Regional Jurisdiction: {coop.region} • {coop.memberCount} Members
          </p>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Governance & Representation</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Cooperative Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Headquarters Address</label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Elected Delegate Lead</label>
              <input
                type="text"
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Audited Compliance Score (%)</label>
              <input
                type="number"
                step="0.1"
                value={complianceRate}
                onChange={(e) => setComplianceRate(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Official Dispatch Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Hotline Telephone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('coop-details', coop.id)}
            className="h-11 px-5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
          >
            <span>Save Charter Updates</span>
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
