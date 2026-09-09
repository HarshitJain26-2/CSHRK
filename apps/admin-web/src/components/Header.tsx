import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';
import { MASTER_AVATARS } from '../data/workforceData';

export const Header: React.FC = () => {
  const { navigate, searchQuery, setSearchQuery, verificationQueue } = useWorkforce();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('Apex Global Cooperative Alliance');

  const orgs = [
    'Apex Global Cooperative Alliance',
    'Northwest Agricultural Federation',
    'Midwest Industrial & Trades Union Council',
    'Pacific Renewable Energy Cooperative Group',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('global-search');
      setShowSearchModal(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container-high shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-space-md flex items-center justify-between">
          {/* Logo & Cooperative Context Dropdown */}
          <div className="flex items-center gap-space-xs min-w-0">
            <button
              onClick={() => navigate('dashboard')}
              className="flex items-center gap-space-xs text-left focus:outline-none"
              title="Workforce Core Home"
            >
              <img
                alt="Workforce Core Emblem"
                className="h-8 w-auto object-contain shrink-0"
                src={MASTER_AVATARS.EMBLEM}
              />
            </button>

            <div className="flex flex-col min-w-0 relative">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider truncate">
                Workforce Core
              </span>
              <button
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-space-2xs text-left max-w-[200px] sm:max-w-[320px] group focus:outline-none"
              >
                <span className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors">
                  {selectedOrg}
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">
                  expand_more
                </span>
              </button>

              {/* Organization Switcher Dropdown */}
              {showOrgDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-label-sm uppercase tracking-wider text-on-surface-variant">
                    Active Federation Scope
                  </div>
                  {orgs.map((org) => (
                    <button
                      key={org}
                      onClick={() => {
                        setSelectedOrg(org);
                        setShowOrgDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-body-sm font-body-sm flex items-center justify-between hover:bg-surface-container-low transition-colors ${
                        selectedOrg === org ? 'text-primary font-semibold bg-surface-container/50' : 'text-on-surface'
                      }`}
                    >
                      <span className="truncate">{org}</span>
                      {selectedOrg === org && (
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-space-xs shrink-0">
            {/* Quick Global Search Trigger */}
            <button
              onClick={() => {
                navigate('global-search');
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              title="Global Search"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Verification Queue Alert Notification */}
            <button
              onClick={() => navigate('cert-verify')}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              title={`${verificationQueue.length} Credentials Pending Verification`}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {verificationQueue.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-error font-label-sm text-[10px] text-on-error font-semibold animate-pulse">
                  {verificationQueue.length}
                </span>
              )}
            </button>

            {/* Admin Avatar Profile */}
            <button
              onClick={() => navigate('reports')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary transition-all ml-1"
              title="Workforce Analytics & Profile"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shadow-sm border border-surface-container-high"
                src={MASTER_AVATARS.ADMIN_USER}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Inline Bar Modal for Quick Access */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-3 text-[22px] text-outline">
                search
              </span>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workers (ID/name), skills, certifications, cooperatives..."
                className="w-full h-12 pl-12 pr-12 bg-surface-container-low text-on-surface rounded-xl outline-none text-body-md font-body-md focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
