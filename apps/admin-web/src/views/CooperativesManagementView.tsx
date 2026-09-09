import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const CooperativesManagementView: React.FC = () => {
  const { cooperatives, metrics, navigate, setSelectedCoopId } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = ['All', 'Pacific Northwest', 'Midwest', 'West Coast', 'Southwest', 'Great Lakes', 'East Coast'];

  const filteredCoops = useMemo(() => {
    return cooperatives.filter((coop) => {
      if (selectedRegion !== 'All' && coop.region !== selectedRegion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = coop.name.toLowerCase().includes(q);
        const matchesReg = coop.registrationNumber.toLowerCase().includes(q);
        const matchesRegion = coop.region.toLowerCase().includes(q);
        const matchesDelegate = coop.delegateName.toLowerCase().includes(q);
        if (!matchesName && !matchesReg && !matchesRegion && !matchesDelegate) return false;
      }
      return true;
    });
  }, [cooperatives, selectedRegion, searchQuery]);

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Section: Header & Action */}
      <section className="px-space-md pt-space-md pb-space-sm">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight truncate">
              Cooperatives Management
            </h1>
            <p className="font-body-sm text-body-sm text-secondary mt-space-2xs">
              Manage cooperative member societies, regional charters, and workforce affiliations.
            </p>
          </div>
          <button
            onClick={() => navigate('add-coop')}
            className="shrink-0 flex items-center justify-center gap-space-2xs bg-primary text-on-primary px-space-md h-10 rounded-xl shadow-sm hover:bg-primary-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="font-label-md text-label-md">Add Cooperative</span>
          </button>
        </div>
      </section>

      {/* KPI Metrics Grid (2x2 or 4x1) */}
      <section className="px-space-md py-space-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
          {/* Total Coops */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Total Coops</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-headline-lg text-headline-lg text-on-surface font-bold tabular-nums">
                {metrics.totalCooperatives}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                <span className="font-code-sm text-code-sm text-secondary font-medium">
                  {metrics.activeCooperatives} Active
                </span>
              </div>
            </div>
          </div>

          {/* Total Members */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Total Members</span>
              <div className="w-7 h-7 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-headline-lg text-headline-lg text-on-surface font-bold tabular-nums">
                {metrics.totalWorkforce.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-code-sm text-code-sm text-secondary font-medium">Workers affiliated</span>
              </div>
            </div>
          </div>

          {/* Avg Compliance */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Avg Compliance</span>
              <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-headline-lg text-headline-lg text-tertiary font-bold tabular-nums">
                {metrics.avgComplianceRate}%
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-code-sm text-code-sm text-secondary font-medium">Federation standard</span>
              </div>
            </div>
          </div>

          {/* Active Societies */}
          <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm border border-surface-container-high flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Active Status</span>
              <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">rule</span>
              </div>
            </div>
            <div className="mt-space-sm">
              <div className="font-headline-lg text-headline-lg text-on-surface font-bold tabular-nums">
                100%
              </div>
              <span className="font-code-sm text-code-sm text-tertiary font-medium">All charters valid</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-space-md py-space-xs space-y-2">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cooperative society, registration #, delegate, or region..."
            className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl outline-none border border-surface-container-high focus:border-primary transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                selectedRegion === reg
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low border border-surface-container-high'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </section>

      {/* Cooperatives List */}
      <section className="px-space-md space-y-3 mt-space-xs">
        {filteredCoops.map((coop) => (
          <div
            key={coop.id}
            className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">corporate_fare</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      {coop.name}
                    </span>
                    <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                      {coop.registrationNumber}
                    </span>
                  </div>
                  <span className="font-body-sm text-[12px] text-secondary mt-0.5">
                    {coop.region} • HQ: {coop.headquarters} • Delegate: {coop.delegateName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-tertiary font-label-md text-label-md shrink-0">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="font-bold">{coop.complianceRate}%</span>
              </div>
            </div>

            {/* Member & Workforce Breakdown Bar */}
            <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center justify-between text-[12px] font-body-sm text-on-surface">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                <strong>{coop.memberCount} Workers</strong>
                <span className="text-secondary text-[11px]">
                  ({coop.activeMembers} active • {coop.onboardingMembers} onboarding • {coop.standdownMembers} stand-down)
                </span>
              </div>
              <span className="font-code-sm text-[11px] text-secondary">
                Valid Certs: {coop.validCerts}
              </span>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-surface-container-low">
              <button
                onClick={() => {
                  setSelectedCoopId(coop.id);
                  navigate('coop-details', coop.id);
                }}
                className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline"
              >
                <span>Society Governance Dossier</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCoopId(coop.id);
                    navigate('coop-members', coop.id);
                  }}
                  className="px-3 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
                >
                  View Members ({coop.memberCount})
                </button>
                <button
                  onClick={() => {
                    setSelectedCoopId(coop.id);
                    navigate('edit-coop', coop.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-low text-secondary font-label-sm text-label-sm hover:text-on-surface transition-colors"
                >
                  Edit Charter
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
