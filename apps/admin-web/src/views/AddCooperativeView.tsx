import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const AddCooperativeView: React.FC = () => {
  const { navigate, addCooperative } = useWorkforce();

  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [region, setRegion] = useState('Pacific Northwest');
  const [headquarters, setHeadquarters] = useState('');
  const [delegateName, setDelegateName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [memberCapacity, setMemberCapacity] = useState('100');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCooperative({
      name,
      registrationNumber: registrationNumber || `REG-${Math.floor(10000 + Math.random() * 90000)}`,
      region,
      headquarters,
      delegateName,
      contactEmail,
      contactPhone,
      memberCount: parseInt(memberCapacity, 10) || 50,
      complianceRate: 98.0,
      status: 'Active',
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('cooperatives')}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Cancel & Return</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">Federation Charter Registration</span>
      </div>

      <form onSubmit={handleSubmit} className="p-space-md space-y-space-md max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Register New Cooperative</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Establish a new regional cooperative society under the Federation collective bargaining charter.
          </p>
        </div>

        {/* Core Society Info */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Society Identity</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Cooperative Legal Entity Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Willamette Valley Viticulture Cooperative"
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                State Registration / Charter #
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. REG-99412 (Auto if empty)"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Federation Geographic Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              >
                <option value="Pacific Northwest">Pacific Northwest</option>
                <option value="Midwest">Midwest</option>
                <option value="West Coast">West Coast</option>
                <option value="Southwest">Southwest</option>
                <option value="Great Lakes">Great Lakes</option>
                <option value="East Coast">East Coast</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Headquarters City & State</label>
              <input
                type="text"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                placeholder="e.g. Salem, OR"
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Governance Contacts */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Governance & Representation</span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Elected Delegate Lead</label>
              <input
                type="text"
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                placeholder="e.g. Marcus Thorne"
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
                placeholder="dispatch@coop.org"
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Contact Hotline</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Projected Initial Member Capacity</label>
            <input
              type="number"
              value={memberCapacity}
              onChange={(e) => setMemberCapacity(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none max-w-xs"
            />
          </div>
        </div>

        {/* Charter Document Upload Zone */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
          <span className="font-headline-sm text-headline-sm text-on-surface">Signed Federation Charter Document</span>
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center space-y-1 bg-surface-container-low/50">
            <span className="material-symbols-outlined text-[32px] text-primary">domain_verification</span>
            <div className="font-label-md text-label-md text-on-surface">Upload Signed Charter Deed</div>
            <p className="text-[11px] font-body-sm text-secondary">PDF deed document stamped by state registrar</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('cooperatives')}
            className="h-11 px-5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
          >
            <span>Register Cooperative</span>
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
