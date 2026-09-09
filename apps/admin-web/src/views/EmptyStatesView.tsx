import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const EmptyStatesView: React.FC = () => {
  const { navigate } = useWorkforce();
  const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'expiring' | 'skills' | 'workers'>('search');

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="px-space-md pt-space-md pb-space-sm space-y-1 border-b border-surface-container-high bg-surface-container-low">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Empty States System</h1>
        <p className="font-body-sm text-body-sm text-secondary">
          Enterprise patterns for zero-data scenarios, cleared queues, and empty queries.
        </p>

        {/* State Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-1">
          {[
            { id: 'search', label: '1. Empty Search' },
            { id: 'queue', label: '2. Cleared Verification Queue' },
            { id: 'expiring', label: '3. Zero Expiring Certs' },
            { id: 'skills', label: '4. Empty Category' },
            { id: 'workers', label: '5. Zero Unassigned Workers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low border border-surface-container-high'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* State View Canvas */}
      <div className="p-space-md max-w-2xl mx-auto w-full">
        {activeTab === 'search' && (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl text-center space-y-3 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[36px]">search_off</span>
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-md text-headline-md text-on-surface">No Workers or Records Found</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                No matching profiles found for the query. Verify the spelling or clear existing filter selections.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => navigate('workers')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm"
              >
                Reset Search Filters
              </button>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl text-center space-y-3 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-md text-headline-md text-on-surface">Verification Queue Empty</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                All uploaded trade qualifications and regulatory credentials have been reviewed and validated.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => navigate('certs')}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md"
              >
                View Valid Certifications
              </button>
            </div>
          </div>
        )}

        {activeTab === 'expiring' && (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl text-center space-y-3 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-md text-headline-md text-on-surface">Zero Credentials Expiring Soon</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                No worker certifications have expiration dates within the upcoming 30 calendar days. Compliance is optimal.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => navigate('reports')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm"
              >
                Generate 90-Day Forecast
              </button>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl text-center space-y-3 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[36px]">psychology_alt</span>
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-md text-headline-md text-on-surface">No Competencies in Domain</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                This skill category currently contains zero registered rubrics. Establish standard qualifications to begin worker mapping.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => navigate('add-skill')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add First Skill</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl text-center space-y-3 border border-surface-container-high shadow-sm animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[36px]">groups</span>
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-md text-headline-md text-on-surface">All Workers Assigned to Societies</h2>
              <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                100% of registered workforce personnel are mapped to an active cooperative federation charter.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => navigate('worker-onboarding')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Onboard New Worker</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
