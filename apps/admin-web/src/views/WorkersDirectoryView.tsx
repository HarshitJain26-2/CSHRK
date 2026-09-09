import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const WorkersDirectoryView: React.FC = () => {
  const { workers, navigate, setSelectedWorkerId, metrics } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'onboarding' | 'expiring' | 'inactive'>('all');
  const [coopFilter, setCoopFilter] = useState<string>('all');

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'expiring') {
          const hasExpiring = worker.certifications.some((c) => c.status === 'expiring') || worker.status === 'expiring';
          if (!hasExpiring) return false;
        } else if (worker.status !== statusFilter) {
          return false;
        }
      }

      // Coop filter
      if (coopFilter !== 'all' && worker.cooperativeName !== coopFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = worker.fullName.toLowerCase().includes(q);
        const matchesId = worker.id.toLowerCase().includes(q);
        const matchesRole = worker.role.toLowerCase().includes(q);
        const matchesCoop = worker.cooperativeName.toLowerCase().includes(q);
        const matchesSkill = worker.skills.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesRole && !matchesCoop && !matchesSkill) {
          return false;
        }
      }

      return true;
    });
  }, [workers, searchQuery, statusFilter, coopFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCoopFilter('all');
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24">
      {/* Header & Primary Action */}
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-col">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Workers
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
            Manage worker profiles, skills, certifications, and cooperative affiliations.
          </p>
        </div>
        <button
          onClick={() => navigate('worker-onboarding')}
          className="shrink-0 flex items-center gap-space-2xs bg-primary text-on-primary font-label-md text-label-md px-space-sm py-2 rounded-xl shadow-sm hover:bg-primary-container active:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Add Worker</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col space-y-space-xs">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search worker name, ID, phone, or email..."
            className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/70 font-body-md text-body-md rounded-xl shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1 hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Quick filter triggers & Clear state toggle */}
        <div className="flex items-center justify-between gap-space-xs pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button className="flex items-center gap-1 bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-1.5 rounded-lg shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span>Filters</span>
            </button>

            {/* Cooperative Filter Dropdown */}
            <select
              value={coopFilter}
              onChange={(e) => setCoopFilter(e.target.value)}
              className="bg-surface-container-low text-on-surface font-label-sm text-label-sm px-2.5 py-1.5 rounded-lg shrink-0 border-none outline-none cursor-pointer"
            >
              <option value="all">All Cooperatives</option>
              <option value="Apex Agro Cooperative">Apex Agro</option>
              <option value="Midland Fabrication Cooperative">Midland Fabrication</option>
              <option value="Cascadia Forestry Cooperative">Cascadia Forestry</option>
              <option value="SunGrid Energy Cooperative">SunGrid Energy</option>
              <option value="Great Lakes Logistics Cooperative">Great Lakes Logistics</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all' || coopFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="shrink-0 text-primary font-label-sm text-label-sm px-1.5 py-1 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Status Segmented Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm shadow-sm shrink-0 transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>All</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'all' ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {metrics.totalWorkforce.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm shadow-sm shrink-0 transition-colors ${
            statusFilter === 'active'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Active</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'active' ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {metrics.activeWorkers.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('onboarding')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm shadow-sm shrink-0 transition-colors ${
            statusFilter === 'onboarding'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Onboarding</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'onboarding' ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {metrics.onboardingWorkers}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('expiring')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm shadow-sm shrink-0 transition-colors ${
            statusFilter === 'expiring'
              ? 'bg-error text-on-error'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Expiring Certs</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              statusFilter === 'expiring' ? 'bg-on-error/20 text-on-error' : 'bg-error-container text-on-error-container'
            }`}
          >
            {metrics.expiringCertifications}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('inactive')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-sm text-label-sm shadow-sm shrink-0 transition-colors ${
            statusFilter === 'inactive'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Inactive</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'inactive' ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {metrics.inactiveWorkers}
          </span>
        </button>
      </div>

      {/* Worker Cards List */}
      {filteredWorkers.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-surface-container-lowest rounded-xl p-8 text-center space-y-3 shadow-sm my-4">
          <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[30px]">group_off</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="font-headline-sm text-headline-sm text-on-surface">No Workers Found</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
              No active worker profiles match your current search and filter parameters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-xl active:opacity-90 shadow-sm mt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-3.5">
          {filteredWorkers.map((worker) => {
            const hasExpiringCert = worker.certifications.some((c) => c.status === 'expiring');
            const hasPendingCert = worker.certifications.some((c) => c.status === 'pending');

            let statusBadgeColor = 'bg-tertiary-fixed text-on-tertiary-fixed';
            let statusLabel = `${worker.status === 'active' ? 'Active' : worker.status} · ${worker.employmentType === 'Full-Time' ? 'FT' : worker.employmentType === 'Contract' ? 'Contract' : worker.employmentType}`;

            if (worker.status === 'onboarding') {
              statusBadgeColor = 'bg-primary-fixed text-on-primary-fixed-variant';
              statusLabel = 'In Onboarding · FT';
            } else if (worker.status === 'inactive') {
              statusBadgeColor = 'bg-surface-container text-on-surface-variant';
              statusLabel = 'Inactive · Stand-down';
            } else if (hasExpiringCert) {
              statusBadgeColor = 'bg-error-container text-on-error-container';
              statusLabel = 'Action Needed';
            }

            return (
              <div
                key={worker.id}
                className="worker-card flex flex-col bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-3 transition-transform active:scale-[0.99]"
              >
                {/* Top Profile Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0"
                      src={worker.avatar}
                      alt={worker.fullName}
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                          {worker.fullName}
                        </span>
                        <span className="font-code-sm text-[11px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                          {worker.id}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-primary font-medium truncate mt-0.5">
                        {worker.role}
                      </span>
                      <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-label-sm mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-secondary">domain</span>
                        <span className="truncate">{worker.cooperativeName} · Since {worker.joinedDate.split(' ')[2]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold ${statusBadgeColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Skills Matrix Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {worker.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-1 font-label-sm text-[11px] bg-surface-container-low text-on-surface px-2 py-0.5 rounded"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {skill.name} <strong className="text-primary font-semibold">{skill.level}</strong>
                    </span>
                  ))}
                  {worker.skills.length > 2 && (
                    <span className="font-label-sm text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                      +{worker.skills.length - 2} more
                    </span>
                  )}
                </div>

                {/* Certification Status Strip */}
                {hasExpiringCert ? (
                  <div className="flex items-center justify-between bg-error-container/40 px-2.5 py-1.5 rounded-lg text-on-error-container">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-error shrink-0">warning</span>
                      <span className="font-label-sm text-label-sm truncate font-medium">Heavy Machinery Operations Cert</span>
                    </div>
                    <span className="shrink-0 font-label-sm text-[10px] px-2 py-0.5 rounded bg-error text-on-error font-semibold">
                      Expiring in 8 days
                    </span>
                  </div>
                ) : hasPendingCert ? (
                  <div className="flex items-center justify-between bg-surface-container px-2.5 py-1.5 rounded-lg text-on-surface">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0">pending_actions</span>
                      <span className="font-label-sm text-label-sm truncate">NABCEP Associate Credential</span>
                    </div>
                    <span className="shrink-0 font-label-sm text-[10px] px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold">
                      Pending Verification
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg text-on-surface">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] text-tertiary-container shrink-0">verified</span>
                      <span className="font-label-sm text-label-sm truncate">
                        {worker.certifications[0]?.name || 'Standard Compliant'}
                      </span>
                    </div>
                    <span className="shrink-0 font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                      Valid
                    </span>
                  </div>
                )}

                {/* Quick Contact Info */}
                <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-[12px] pt-1">
                  <div className="flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    <span className="truncate">{worker.email}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>{worker.phone}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedWorkerId(worker.id);
                      navigate('worker-profile', worker.id);
                    }}
                    className="flex-1 bg-surface-container-high text-primary font-label-md text-label-md py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary hover:text-on-primary active:opacity-90 transition-colors"
                  >
                    <span>View Profile</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWorkerId(worker.id);
                      navigate('worker-profile', worker.id);
                    }}
                    className="w-10 h-9 flex items-center justify-center bg-surface-container-low text-on-surface-variant rounded-xl hover:bg-surface-container transition-colors"
                    title="Profile Details"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination & Directory Footer */}
      <div className="flex items-center justify-between pt-2 pb-6 text-on-surface-variant font-label-sm text-label-sm">
        <span className="text-[12px]">
          Showing <strong className="text-on-surface font-semibold">1–{filteredWorkers.length}</strong> of{' '}
          <strong className="text-on-surface font-semibold">{metrics.totalWorkforce.toLocaleString()}</strong> workers
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled
            className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface-variant flex items-center justify-center shadow-sm disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button className="w-8 h-8 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm hover:bg-surface-container">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
