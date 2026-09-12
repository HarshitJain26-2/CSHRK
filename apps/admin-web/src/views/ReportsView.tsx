import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const ReportsView: React.FC = () => {
  const { metrics, addToast } = useWorkforce();

  const standardReports = [
    {
      id: 'rep-1',
      title: 'Workforce Summary',
      description: 'Overall headcount breakdown, full-time vs contract distribution, and annual growth.',
      stat: `${metrics.totalWorkforce.toLocaleString()} total workers registered`,
      icon: 'groups',
    },
    {
      id: 'rep-2',
      title: 'Worker Status Report',
      description: 'Breakdown of active operational workers, stand-down personnel, and pending onboardings.',
      stat: `${metrics.activeWorkers.toLocaleString()} active • ${metrics.onboardingWorkers} onboarding`,
      icon: 'badge',
    },
    {
      id: 'rep-3',
      title: 'Skills Summary',
      description: 'Coverage of standardized technical competencies and trade levels across all cooperatives.',
      stat: `${metrics.totalSkills} master skills mapped`,
      icon: 'psychology',
    },
    {
      id: 'rep-4',
      title: 'Certification Status Report',
      description: 'Safety compliance audit, expired credentials, and upcoming 30-day renewal deadlines.',
      stat: `${metrics.validCertifications.toLocaleString()} valid • ${metrics.expiringCertifications} expiring soon`,
      icon: 'workspace_premium',
    },
    {
      id: 'rep-5',
      title: 'Cooperative Summary',
      description: 'Member society governance audits, member allocations, and federation standing.',
      stat: `${metrics.totalCooperatives} registered societies`,
      icon: 'account_balance',
    },
  ];

  const handleExport = (reportTitle: string, format: 'PDF' | 'CSV') => {
    addToast('success', `${reportTitle} Generated`, `Export downloaded in ${format} format.`);
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
          Reports
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Simple, ready-to-export reports on workers, skills, compliance, and cooperatives.
        </p>
      </div>

      {/* 5 Clean Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {standardReports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{rep.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-base">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {rep.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface">
                {rep.stat}
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-2">
              <button
                onClick={() => handleExport(rep.title, 'CSV')}
                className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">table_chart</span>
                <span>Download CSV</span>
              </button>
              <button
                onClick={() => handleExport(rep.title, 'PDF')}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
