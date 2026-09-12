import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';
import { MASTER_AVATARS } from '../data/workforceData';

export const WorkersDirectoryView: React.FC = () => {
  const { workers, navigate, setSelectedWorkerId } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'onboarding'>('all');

  const counts = useMemo(() => {
    return {
      all: workers.length,
      active: workers.filter((w) => w.status === 'active').length,
      inactive: workers.filter((w) => w.status === 'inactive').length,
      onboarding: workers.filter((w) => w.status === 'onboarding').length,
    };
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // Filter by simple status
      if (statusFilter !== 'all' && worker.status !== statusFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = worker.fullName.toLowerCase().includes(q);
        const matchesId = worker.id.toLowerCase().includes(q);
        const matchesRole = worker.role.toLowerCase().includes(q);
        const matchesCoop = worker.cooperativeName.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesRole && !matchesCoop) {
          return false;
        }
      }

      return true;
    });
  }, [workers, searchQuery, statusFilter]);

  const handleOpenWorker = (id: string) => {
    setSelectedWorkerId(id);
    navigate('worker-profile', id);
  };

  const handleEditWorker = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedWorkerId(id);
    navigate('edit-worker', id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Active
          </span>
        );
      case 'onboarding':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Onboarding
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Workers
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Search, view, and manage workers across all cooperatives.
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

      {/* Search & Filters Card */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workers by name, ID, or trade..."
            className="w-full h-11 pl-11 pr-10 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* 4 Simple Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>All</span>
            <span className="opacity-80">({counts.all})</span>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>Active</span>
            <span className="opacity-80">({counts.active})</span>
          </button>

          <button
            onClick={() => setStatusFilter('onboarding')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'onboarding'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>Onboarding</span>
            <span className="opacity-80">({counts.onboarding})</span>
          </button>

          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === 'inactive'
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>Inactive</span>
            <span className="opacity-80">({counts.inactive})</span>
          </button>
        </div>
      </div>

      {/* Workers List / Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium px-1">
          <span>Showing {filteredWorkers.length} workers</span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50">
              person_search
            </span>
            <h3 className="font-bold text-on-surface text-base">No workers found</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              No workers matched &ldquo;{searchQuery}&rdquo;. Try another name or clear your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-sm hover:bg-surface-container-highest"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                onClick={() => handleOpenWorker(worker.id)}
                className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Avatar + Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={worker.id === 'WKR-8042' ? MASTER_AVATARS.CARLOS_PROFILE : worker.avatar}
                    alt={worker.fullName}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-surface-container-high"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-on-surface text-base truncate">
                        {worker.fullName}
                      </h3>
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-mono shrink-0">
                        {worker.id}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant truncate mt-0.5">
                      {worker.role}
                    </p>
                  </div>
                </div>

                {/* Center: Cooperative & Trade Status */}
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs text-on-surface-variant">Cooperative</span>
                    <span className="text-sm font-medium text-on-surface truncate max-w-[180px]">
                      {worker.cooperativeName}
                    </span>
                  </div>

                  <div>{getStatusBadge(worker.status)}</div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditWorker(e, worker.id)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                      title="Edit Worker"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleOpenWorker(worker.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors shadow-xs"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
