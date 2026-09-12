import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const WorkforceDashboardView: React.FC = () => {
  const { navigate, metrics, verificationQueue } = useWorkforce();

  const recentActivities = [
    {
      id: 'act-1',
      title: 'Carlos Mendez renewed High-Voltage Safety License',
      time: '15 mins ago',
      type: 'cert',
      icon: 'verified',
    },
    {
      id: 'act-2',
      title: 'Aarav Sharma completed worker onboarding',
      time: '1 hour ago',
      type: 'worker',
      icon: 'person_add',
    },
    {
      id: 'act-3',
      title: '3 certificates submitted for cooperative approval',
      time: '3 hours ago',
      type: 'audit',
      icon: 'pending_actions',
    },
    {
      id: 'act-4',
      title: 'Apex Agro Cooperative added 5 new active members',
      time: 'Yesterday',
      type: 'coop',
      icon: 'domain',
    },
  ];

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-lg pb-24 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Workforce Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Quick overview of workers, cooperatives, and items needing attention.
          </p>
        </div>
        <button
          onClick={() => navigate('worker-onboarding')}
          className="self-start sm:self-auto flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary-container active:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Add Worker</span>
        </button>
      </div>

      {/* 4 Core Numbers (Large, Simple, Readable) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workers */}
        <div
          onClick={() => navigate('workers')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-md text-label-md font-medium">Total Workers</span>
            <span className="material-symbols-outlined text-primary text-[22px]">groups</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-on-surface tabular-nums">
              {metrics.totalWorkforce.toLocaleString()}
            </div>
            <div className="text-xs text-on-surface-variant mt-1">Across all cooperatives</div>
          </div>
        </div>

        {/* Active Workers */}
        <div
          onClick={() => navigate('workers')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-md text-label-md font-medium">Active Workers</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-emerald-950 tabular-nums">
              {metrics.activeWorkers.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-800 mt-1">Ready for work & jobs</div>
          </div>
        </div>

        {/* Onboarding */}
        <div
          onClick={() => navigate('workers')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-md text-label-md font-medium">Onboarding</span>
            <span className="material-symbols-outlined text-amber-600 text-[22px]">hourglass_top</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-amber-950 tabular-nums">
              {metrics.onboardingWorkers.toLocaleString()}
            </div>
            <div className="text-xs text-amber-800 mt-1">Finishing enrollment</div>
          </div>
        </div>

        {/* Cooperatives */}
        <div
          onClick={() => navigate('cooperatives')}
          className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="font-label-md text-label-md font-medium">Cooperatives</span>
            <span className="material-symbols-outlined text-secondary text-[22px]">account_balance</span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-on-surface tabular-nums">
              {metrics.totalCooperatives.toLocaleString()}
            </div>
            <div className="text-xs text-on-surface-variant mt-1">Member societies</div>
          </div>
        </div>
      </div>

      {/* Workers Needing Attention Section */}
      <div className="space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
          Workers Needing Attention
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Expiring Certifications */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-error/30 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Certifications Expiring Soon
                </h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {metrics.expiringCertifications} certificates need renewal within 30 days.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('certs')}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors text-center"
            >
              Review Certificates
            </button>
          </div>

          {/* Card 2: Waiting for Approval */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-amber-500/30 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Waiting for Approval
                </h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {verificationQueue.length} worker qualifications need verification.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('cert-verify')}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors text-center"
            >
              Approve Qualifications
            </button>
          </div>

          {/* Card 3: In Onboarding */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">badge</span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Currently Onboarding
                </h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {metrics.onboardingWorkers} new workers completing registration.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('workers')}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors text-center"
            >
              View Onboarding Workers
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Recent Activity
          </h2>
          <span className="text-xs text-on-surface-variant">Updated live</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs divide-y divide-surface-container-high">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-[18px]">{act.icon}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface truncate">
                  {act.title}
                </p>
              </div>
              <span className="text-xs text-on-surface-variant shrink-0 font-medium">
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div
          onClick={() => navigate('skills')}
          className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">psychology</span>
            <div>
              <div className="font-semibold text-on-surface">Manage Trade Skills</div>
              <div className="text-xs text-on-surface-variant">{metrics.totalSkills} skills cataloged</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_forward</span>
        </div>

        <div
          onClick={() => navigate('reports')}
          className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[24px]">bar_chart</span>
            <div>
              <div className="font-semibold text-on-surface">Workforce Reports</div>
              <div className="text-xs text-on-surface-variant">Export summaries & audits</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_forward</span>
        </div>
      </div>
    </div>
  );
};
