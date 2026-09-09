import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const WorkforceDashboardView: React.FC = () => {
  const { navigate, metrics, verificationQueue, cooperatives } = useWorkforce();

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24">
      {/* Action Header Section */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-start justify-between gap-space-xs">
          <div className="flex flex-col min-w-0">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">
              Workforce Management
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Monitor workers, skills, certifications, and cooperative affiliations.
            </p>
          </div>
          <button
            onClick={() => navigate('worker-onboarding')}
            className="shrink-0 flex items-center justify-center gap-space-2xs bg-primary text-on-primary px-space-sm py-2 rounded-xl shadow-sm hover:bg-primary-container active:opacity-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span className="font-label-md text-label-md whitespace-nowrap">+ Add Worker</span>
          </button>
        </div>
      </div>

      {/* Attention & Urgency Notification Banners */}
      <div className="flex flex-col gap-space-2xs">
        {/* Verification Alert */}
        <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-high text-on-surface shadow-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-surface truncate">
                Review Pending: {verificationQueue.length} worker certs
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Requires regulatory verification
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('cert-verify')}
            className="shrink-0 px-space-xs py-1 rounded-lg bg-surface-container-lowest text-primary font-label-sm text-label-sm shadow-sm hover:bg-surface-container transition-colors"
          >
            Resolve
          </button>
        </div>

        {/* Expiring Soon Alert */}
        <div className="flex items-center justify-between p-space-sm rounded-xl bg-error-container text-on-error-container shadow-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <div className="w-7 h-7 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0 text-error">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-on-error-container truncate">
                Expiring Soon: {metrics.expiringCertifications} credentials
              </span>
              <span className="font-label-sm text-label-sm text-on-error-container/80">
                Deadlines within 30 calendar days
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('certs')}
            className="shrink-0 px-space-xs py-1 rounded-lg bg-error text-on-error font-label-sm text-label-sm shadow-sm hover:opacity-90 transition-opacity"
          >
            Review
          </button>
        </div>
      </div>

      {/* Operational Workforce KPI Matrix */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            Core Workforce Ratios
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Real-time telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
          {/* 1. Total Workforce */}
          <div
            onClick={() => navigate('workers')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Total Workforce</span>
              <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight tabular-nums">
                {metrics.totalWorkforce.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px] text-tertiary">trending_up</span>
                <span className="font-label-sm text-label-sm text-tertiary font-semibold">+4.2% MoM</span>
              </div>
            </div>
          </div>

          {/* 2. Active Workers */}
          <div
            onClick={() => navigate('workers')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Active Active</span>
              <span className="w-2 h-2 rounded-full bg-primary"></span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight tabular-nums">
                {metrics.activeWorkers.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mt-0.5">
                <span>84.7% operational</span>
              </div>
            </div>
          </div>

          {/* 3. Inactive Workers */}
          <div
            onClick={() => navigate('workers')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Inactive</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">pause_circle</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight tabular-nums">
                {metrics.inactiveWorkers}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">10.0% stand-down</span>
            </div>
          </div>

          {/* 4. In Onboarding */}
          <div
            onClick={() => navigate('worker-onboarding')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">In Onboarding</span>
              <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight tabular-nums">
                {metrics.onboardingWorkers}
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold mt-0.5">5.3% pipeline</span>
            </div>
          </div>

          {/* 5. Certified Workers */}
          <div
            onClick={() => navigate('certs')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Certified</span>
              <span className="material-symbols-outlined text-[16px] text-primary">workspace_premium</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight tabular-nums">
                2,190
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">76.9% credentialed</span>
            </div>
          </div>

          {/* 6. Expiring Certs */}
          <div
            onClick={() => navigate('certs')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-error/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Expiring Certs</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-error-container text-on-error-container">
                Urgent
              </span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-error tracking-tight tabular-nums">
                {metrics.expiringCertifications}
              </div>
              <span className="font-label-sm text-label-sm text-error mt-0.5">Needs action</span>
            </div>
          </div>

          {/* 7. Cooperatives */}
          <div
            onClick={() => navigate('cooperatives')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Cooperatives</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">account_balance</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight tabular-nums">
                {metrics.totalCooperatives}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Affiliated societies</span>
            </div>
          </div>

          {/* 8. Mapped Skills */}
          <div
            onClick={() => navigate('skills')}
            className="p-space-sm rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Mapped Skills</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">psychology</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight tabular-nums">
                {metrics.totalSkills}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Competencies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics A: Employment Distribution */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface">Employment Distribution</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Status of 2,845 recorded members</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">donut_small</span>
        </div>

        {/* Stacked Distribution Bar */}
        <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
          <div className="h-full bg-primary" style={{ width: '84.7%' }} title="Active: 84.7%"></div>
          <div className="h-full bg-secondary" style={{ width: '5.3%' }} title="Onboarding: 5.3%"></div>
          <div className="h-full bg-outline-variant" style={{ width: '10.0%' }} title="Inactive: 10.0%"></div>
        </div>

        {/* Segment Breakdown Chips */}
        <div className="grid grid-cols-3 gap-space-2xs pt-space-2xs text-center">
          <div className="flex flex-col items-center p-space-2xs rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">84.7%</span>
            </div>
            <span className="font-label-sm text-[10px] text-on-surface-variant">Active (2,410)</span>
          </div>
          <div className="flex flex-col items-center p-space-2xs rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">5.3%</span>
            </div>
            <span className="font-label-sm text-[10px] text-on-surface-variant">Onboarding (150)</span>
          </div>
          <div className="flex flex-col items-center p-space-2xs rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">10.0%</span>
            </div>
            <span className="font-label-sm text-[10px] text-on-surface-variant">Inactive (285)</span>
          </div>
        </div>
      </div>

      {/* Analytics B: Competency Domains */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface">Competency Domains</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Workforce specialization density</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">bar_chart</span>
        </div>

        <div className="space-y-space-xs pt-space-2xs">
          {/* Domain 1 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline font-label-md text-label-md">
              <span className="text-on-surface truncate">Technical & Systems</span>
              <span className="text-on-surface-variant tabular-nums">780 <span className="text-on-surface-variant/70 font-normal">(27.4%)</span></span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '27.4%' }}></div>
            </div>
          </div>

          {/* Domain 2 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline font-label-md text-label-md">
              <span className="text-on-surface truncate">Manufacturing & Assembly</span>
              <span className="text-on-surface-variant tabular-nums">640 <span className="text-on-surface-variant/70 font-normal">(22.5%)</span></span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '22.5%' }}></div>
            </div>
          </div>

          {/* Domain 3 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline font-label-md text-label-md">
              <span className="text-on-surface truncate">Agriculture & Natural Resources</span>
              <span className="text-on-surface-variant tabular-nums">590 <span className="text-on-surface-variant/70 font-normal">(20.7%)</span></span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-tertiary rounded-full" style={{ width: '20.7%' }}></div>
            </div>
          </div>

          {/* Domain 4 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline font-label-md text-label-md">
              <span className="text-on-surface truncate">Transportation & Logistics</span>
              <span className="text-on-surface-variant tabular-nums">415 <span className="text-on-surface-variant/70 font-normal">(14.6%)</span></span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-surface-tint rounded-full" style={{ width: '14.6%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics C: Credential Risk Horizon */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface">Credential Risk Horizon</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Verification & regulatory adherence</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">verified</span>
        </div>

        <div className="grid grid-cols-3 gap-space-xs pt-space-2xs">
          {/* Valid */}
          <div className="p-space-xs rounded-lg bg-surface-container-low flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-label-sm text-label-sm text-on-surface">Valid</span>
              </div>
              <span className="font-label-sm text-label-sm text-tertiary font-bold">89.8%</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant tabular-nums mt-1">
              {metrics.validCertifications.toLocaleString()} records
            </span>
          </div>

          {/* Expired */}
          <div className="p-space-xs rounded-lg bg-surface-container-low flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="font-label-sm text-label-sm text-on-surface">Expired</span>
              </div>
              <span className="font-label-sm text-label-sm text-error font-bold">4.2%</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant tabular-nums mt-1">
              {metrics.expiredCertifications} records
            </span>
          </div>

          {/* Expiring Soon */}
          <div className="p-space-xs rounded-lg bg-surface-container-low flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-label-sm text-label-sm text-on-surface">Expiring</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">1.1%</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant tabular-nums mt-1">
              {metrics.expiringCertifications} records
            </span>
          </div>
        </div>
      </div>

      {/* Analytics D: Top Affiliated Cooperatives */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col space-y-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface">Affiliated Cooperatives</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Regional member governance</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">hub</span>
        </div>

        {/* List of Co-ops */}
        <div className="space-y-space-xs pt-space-2xs">
          {cooperatives.slice(0, 3).map((coop) => (
            <div
              key={coop.id}
              onClick={() => navigate('coop-details', coop.id)}
              className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors"
            >
              <div className="flex flex-col min-w-0 pr-space-2xs">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                  {coop.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {coop.region} • {coop.memberCount} workers
                </span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                  <span className="font-label-md text-label-md text-tertiary">{coop.complianceRate}%</span>
                </div>
                <span className="font-label-sm text-[10px] text-on-surface-variant">Compliance</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Link */}
        <button
          onClick={() => navigate('cooperatives')}
          className="w-full pt-space-xs flex items-center justify-center gap-1 font-label-md text-label-md text-primary hover:underline active:opacity-80"
        >
          <span>View all 18 cooperatives</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
