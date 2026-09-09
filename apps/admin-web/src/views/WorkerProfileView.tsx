import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';
import { MASTER_AVATARS } from '../data/workforceData';

export const WorkerProfileView: React.FC = () => {
  const { selectedWorkerId, workers, navigate, openConfirmDialog, deactivateWorker, addToast } = useWorkforce();

  // Find currently selected worker or default to Carlos Mendez WKR-8042
  const worker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'certs' | 'activity'>('overview');

  const handleDeactivate = () => {
    openConfirmDialog({
      title: `Stand-down Worker ${worker.fullName}?`,
      description: `Worker ${worker.id} will be placed into Stand-down / Inactive status. Their active shift assignments and cooperative dispatch permissions will be temporarily paused.`,
      confirmLabel: 'Confirm Stand-down',
      isDestructive: true,
      onConfirm: () => {
        deactivateWorker(worker.id);
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Bar with Back Button */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('workers')}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Workers Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              addToast('info', 'Profile Link Copied', `Direct shareable URL for ${worker.id} copied to clipboard.`);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Share Profile"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>
          <button
            onClick={handleDeactivate}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-error hover:bg-error-container/30 transition-colors"
            title="Deactivate Worker"
          >
            <span className="material-symbols-outlined text-[18px]">block</span>
          </button>
        </div>
      </div>

      {/* Profile Header Hero Surface */}
      <div className="px-space-md pt-space-md pb-space-lg flex flex-col gap-space-md bg-surface-container-low border-b border-surface-container-high shadow-xs">
        {/* Top Identity Row */}
        <div className="flex items-start gap-space-md">
          <div className="relative shrink-0">
            <img
              className="w-20 h-20 rounded-full object-cover shadow-sm ring-2 ring-surface-container-lowest"
              src={worker.id === 'WKR-8042' ? MASTER_AVATARS.CARLOS_PROFILE : worker.avatar}
              alt={worker.fullName}
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim fill-1">
                verified
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h2 className="font-headline-md text-headline-md text-on-surface truncate">
                {worker.fullName}
              </h2>
              <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded-lg shrink-0">
                {worker.id}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mt-0.5">
              {worker.role}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-secondary">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span className="font-body-sm text-body-sm text-secondary">
                Joined {worker.joinedDate} <span className="text-on-surface-variant font-label-sm">({worker.yearsOfService})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status Chips Band */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {worker.status === 'active' ? 'Active' : worker.status}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            {worker.employmentType}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-fixed font-label-sm">
            <span className="material-symbols-outlined text-[13px]">shield_person</span>
            Verified Member
          </span>
        </div>

        {/* Direct Fast-Contact Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs pt-1">
          <a
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container transition-colors shadow-xs"
            href={`tel:${worker.phone}`}
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span className="font-label-md text-label-md truncate">{worker.phone}</span>
          </a>
          <a
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container transition-colors shadow-xs"
            href={`mailto:${worker.email}`}
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span className="font-label-md text-label-md truncate">{worker.email}</span>
          </a>
        </div>

        {/* Main Header Action CTA Strip */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              addToast('info', 'Edit Mode Active', `Editing worker profile for ${worker.fullName}.`);
            }}
            className="flex-1 h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary-container active:opacity-90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit Profile</span>
          </button>
          <button
            onClick={handleDeactivate}
            className="flex-1 h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-xs hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">published_with_changes</span>
            <span>Change Status</span>
          </button>
        </div>
      </div>

      {/* Horizontal Navigation Tabs */}
      <div className="w-full bg-surface-container-lowest border-b border-surface-container-high sticky top-16 z-20">
        <div className="flex items-center px-space-md gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 font-label-md text-label-md border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Overview & Society
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 font-label-md text-label-md border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Skills Matrix ({worker.skills.length})
          </button>
          <button
            onClick={() => setActiveTab('certs')}
            className={`py-3 font-label-md text-label-md border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'certs'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Certifications ({worker.certifications.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 font-label-md text-label-md border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Audits & History
          </button>
        </div>
      </div>

      {/* Tab Content Section */}
      <div className="p-space-md space-y-space-md">
        {activeTab === 'overview' && (
          <div className="space-y-space-md">
            {/* Cooperative Affiliation Card */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">account_balance</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Cooperative Affiliation
                  </span>
                </div>
                <button
                  onClick={() => navigate('cooperatives')}
                  className="text-primary font-label-sm text-label-sm hover:underline"
                >
                  View Society
                </button>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    {worker.cooperativeName}
                  </span>
                  <span className="text-[12px] font-body-sm text-on-surface-variant">
                    Pacific Northwest Regional Federation • ID: REG-88214
                  </span>
                </div>
                <div className="flex items-center gap-1 text-tertiary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>98.4%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px] font-body-sm text-on-surface-variant pt-1">
                <div>
                  <span className="font-semibold text-on-surface">Elected Delegate:</span> Sarah Jenkins
                </div>
                <div>
                  <span className="font-semibold text-on-surface">Charter Status:</span> Fully Compliant
                </div>
                <div>
                  <span className="font-semibold text-on-surface">Shift Assignment:</span> Sector A Morning Run
                </div>
                <div>
                  <span className="font-semibold text-on-surface">Incident History:</span> 0 Breaches (Clean)
                </div>
              </div>
            </div>

            {/* Quick Summary of Top Competencies */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface">Core Competencies</span>
                <button
                  onClick={() => setActiveTab('skills')}
                  className="text-primary font-label-sm text-label-sm hover:underline"
                >
                  Full Matrix
                </button>
              </div>

              <div className="space-y-2">
                {worker.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span className="font-body-md text-body-md text-on-surface font-medium">
                        {skill.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-label-sm font-semibold bg-primary text-on-primary">
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">Verified Skills Portfolio</span>
              <button
                onClick={() => navigate('skills')}
                className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container"
              >
                + Map New Skill
              </button>
            </div>

            <div className="space-y-3">
              {worker.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">{skill.name}</span>
                      <span className="text-[12px] font-body-sm text-on-surface-variant">
                        Competency Code: {skill.skillId} • Supervisor Signed Off
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[12px] font-label-sm font-bold bg-primary text-on-primary">
                      {skill.level} Proficiency
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-label-sm text-tertiary">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Audited against enterprise rubric level</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">Registered Credentials</span>
              <button
                onClick={() => navigate('add-cert')}
                className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container"
              >
                + Add Credential
              </button>
            </div>

            <div className="space-y-3">
              {worker.certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">{cert.name}</span>
                      <span className="text-[12px] font-body-sm text-on-surface-variant">
                        Issuing Body: {cert.issuer}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-label-sm font-semibold ${
                        cert.status === 'valid'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : cert.status === 'expiring'
                          ? 'bg-error text-on-error'
                          : 'bg-primary-fixed text-on-primary-fixed'
                      }`}
                    >
                      {cert.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] font-body-sm text-on-surface-variant pt-1 border-t border-surface-container-low">
                    <span>Valid until: {cert.expiryDate}</span>
                    <button
                      onClick={() => navigate('certs')}
                      className="text-primary font-label-sm text-label-sm hover:underline"
                    >
                      Inspect Verification Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
            <span className="font-headline-sm text-headline-sm text-on-surface">Audit & Shift History</span>
            <div className="space-y-3 border-l-2 border-surface-container-high pl-4 ml-2">
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-primary absolute -left-[21px] top-1"></span>
                <div className="font-label-md text-label-md text-on-surface">Annual Compliance Review Completed</div>
                <div className="text-[11px] font-body-sm text-on-surface-variant">Sep 01, 2026 • Auditor Sarah Jenkins</div>
              </div>
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary absolute -left-[21px] top-1"></span>
                <div className="font-label-md text-label-md text-on-surface">Agro-Tech II Machinery License Verified</div>
                <div className="text-[11px] font-body-sm text-on-surface-variant">Mar 20, 2024 • State Agricultural Board</div>
              </div>
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full bg-outline absolute -left-[21px] top-1"></span>
                <div className="font-label-md text-label-md text-on-surface">Enrolled in Apex Agro Cooperative</div>
                <div className="text-[11px] font-body-sm text-on-surface-variant">Mar 14, 2021 • Charter Member Onboarding</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
