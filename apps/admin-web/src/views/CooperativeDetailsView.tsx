import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const CooperativeDetailsView: React.FC = () => {
  const { selectedCoopId, cooperatives, workers, navigate, setSelectedWorkerId } = useWorkforce();

  const coop = cooperatives.find((c) => c.id === selectedCoopId) || cooperatives[0];

  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'workforce' | 'skills' | 'certs' | 'compliance' | 'activity'
  >('overview');

  const coopWorkers = workers.filter(
    (w) => w.cooperativeId === coop.id || w.cooperativeName === coop.name
  );

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('cooperatives')}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Cooperatives Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('coop-members', coop.id)}
            className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>Roster ({coop.memberCount})</span>
          </button>
          <button
            onClick={() => navigate('edit-coop', coop.id)}
            className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit Charter</span>
          </button>
        </div>
      </div>

      {/* Hero Dossier Surface */}
      <div className="px-space-md pt-space-md pb-space-lg bg-surface-container-low border-b border-surface-container-high space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface truncate">
                  {coop.name}
                </h1>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                  {coop.registrationNumber}
                </span>
              </div>
              <span className="font-body-md text-body-md text-primary font-medium mt-0.5">
                {coop.region} • Chartered in {coop.foundedYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-tertiary font-label-md text-label-md shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="font-bold text-[15px]">{coop.complianceRate}%</span>
            <span className="text-[11px] text-secondary">Compliance</span>
          </div>
        </div>

        {/* Quick Numbers Band */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high">
            <span className="text-[11px] font-label-sm uppercase text-secondary block">Total Members</span>
            <strong className="text-on-surface font-headline-sm">{coop.memberCount}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high">
            <span className="text-[11px] font-label-sm uppercase text-secondary block">Active Shift Workers</span>
            <strong className="text-tertiary font-headline-sm">{coop.activeMembers}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high">
            <span className="text-[11px] font-label-sm uppercase text-secondary block">Valid Licenses</span>
            <strong className="text-on-surface font-headline-sm">{coop.validCerts}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high">
            <span className="text-[11px] font-label-sm uppercase text-secondary block">Pending Review</span>
            <strong className="text-primary font-headline-sm">{coop.pendingCerts}</strong>
          </div>
        </div>
      </div>

      {/* 7 Interactive Tabs: Overview, Members, Workforce, Skills, Certifications, Compliance, Activity */}
      <div className="w-full bg-surface-container-lowest border-b border-surface-container-high sticky top-16 z-20 overflow-x-auto no-scrollbar">
        <div className="flex items-center px-space-md gap-4 min-w-max">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'members', label: `Members (${coop.memberCount})` },
            { id: 'workforce', label: 'Workforce Logistics' },
            { id: 'skills', label: 'Skills Portfolio' },
            { id: 'certs', label: 'Certifications' },
            { id: 'compliance', label: 'Compliance Audit' },
            { id: 'activity', label: 'Activity Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 font-label-md text-label-md border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-space-md space-y-space-md">
        {/* 1. Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
              <span className="font-headline-sm text-headline-sm text-on-surface">Governance & Contacts</span>
              <div className="space-y-2 text-body-sm text-[13px]">
                <div>
                  <span className="text-secondary font-semibold">Elected Delegate:</span> {coop.delegateName}
                </div>
                <div>
                  <span className="text-secondary font-semibold">Headquarters:</span> {coop.headquarters}
                </div>
                <div>
                  <span className="text-secondary font-semibold">Contact Email:</span> {coop.contactEmail}
                </div>
                <div>
                  <span className="text-secondary font-semibold">Phone:</span> {coop.contactPhone}
                </div>
                <div>
                  <span className="text-secondary font-semibold">Charter Established:</span> {coop.foundedYear} (12 Years active)
                </div>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
              <span className="font-headline-sm text-headline-sm text-on-surface">Regional Jurisdiction</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Operating under the {coop.region} labor federation charter with collective bargaining agreements for agricultural, logistics, and technical workforce deployment.
              </p>
              <div className="p-2.5 rounded-lg bg-surface-container-low text-[12px] font-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                <span>OSHA and Department of Labor Good Standing Confirmed.</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Members */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Affiliated Workers in {coop.name}
              </span>
              <button
                onClick={() => navigate('coop-members', coop.id)}
                className="text-primary font-label-sm text-label-sm hover:underline"
              >
                View Full Roster
              </button>
            </div>

            <div className="space-y-2">
              {coopWorkers.map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => {
                    setSelectedWorkerId(worker.id);
                    navigate('worker-profile', worker.id);
                  }}
                  className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.avatar}
                      alt={worker.fullName}
                      className="w-10 h-10 rounded-xl object-cover bg-surface-container"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          {worker.fullName}
                        </span>
                        <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1 py-0.2 rounded">
                          {worker.id}
                        </span>
                      </div>
                      <span className="text-[12px] font-body-sm text-on-surface-variant">
                        {worker.role} • {worker.employmentType}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Workforce */}
        {activeTab === 'workforce' && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
            <span className="font-headline-sm text-headline-sm text-on-surface">Workforce Logistics & Shifts</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-[11px] font-label-sm text-secondary uppercase block">Full-Time Workforce</span>
                <strong className="font-headline-sm text-on-surface">{coop.fullTimeCount} Workers</strong>
                <span className="text-[11px] text-on-surface-variant block mt-1">Permanent collective members</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-[11px] font-label-sm text-secondary uppercase block">Contract / Apprentice</span>
                <strong className="font-headline-sm text-on-surface">{coop.contractCount} Workers</strong>
                <span className="text-[11px] text-on-surface-variant block mt-1">Specialized seasonal deployment</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low">
                <span className="text-[11px] font-label-sm text-secondary uppercase block">Shift Utilization</span>
                <strong className="font-headline-sm text-tertiary">94.2%</strong>
                <span className="text-[11px] text-on-surface-variant block mt-1">Optimal coverage</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Skills */}
        {activeTab === 'skills' && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
            <span className="font-headline-sm text-headline-sm text-on-surface">Top Competencies in Society</span>
            <div className="space-y-2">
              {coop.topSkills.map((sk) => (
                <div key={sk.name} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                  <span className="font-body-md text-body-md text-on-surface font-medium">{sk.name}</span>
                  <span className="font-code-sm text-[12px] text-primary font-bold">{sk.count} workers mapped</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Certifications */}
        {activeTab === 'certs' && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
            <span className="font-headline-sm text-headline-sm text-on-surface">Credential Compliance Status</span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface-container-low text-center">
                <span className="text-[11px] font-label-sm text-secondary block">Valid Licenses</span>
                <strong className="font-headline-lg text-tertiary">{coop.validCerts}</strong>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low text-center">
                <span className="text-[11px] font-label-sm text-secondary block">Expiring in 30 Days</span>
                <strong className="font-headline-lg text-error">{coop.expiringCerts}</strong>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low text-center">
                <span className="text-[11px] font-label-sm text-secondary block">Pending Review</span>
                <strong className="font-headline-lg text-primary">{coop.pendingCerts}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 6. Compliance */}
        {activeTab === 'compliance' && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
            <span className="font-headline-sm text-headline-sm text-on-surface">Regulatory & Safety Audit Report</span>
            <div className="p-3 rounded-lg bg-tertiary-fixed/20 border border-tertiary-fixed-dim/40 flex items-center justify-between">
              <div>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Overall Compliance Rating: {coop.complianceRate}%
                </span>
                <p className="text-[12px] font-body-sm text-on-surface-variant">
                  Exceeds the 90.0% minimum collective regulatory benchmark.
                </p>
              </div>
              <span className="material-symbols-outlined text-[24px] text-tertiary">check_circle</span>
            </div>
          </div>
        )}

        {/* 7. Activity */}
        {activeTab === 'activity' && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
            <span className="font-headline-sm text-headline-sm text-on-surface">Recent Operational Log</span>
            <div className="space-y-3 border-l-2 border-surface-container-high pl-4 ml-2">
              {coop.recentActivity.map((act) => (
                <div key={act.id} className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[21px] top-1"></span>
                  <div className="font-label-md text-label-md text-on-surface">{act.title}</div>
                  <div className="text-[11px] font-body-sm text-on-surface-variant">{act.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
