import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const CooperativesManagementView: React.FC = () => {
  const { cooperatives, navigate, setSelectedCoopId } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCoops = cooperatives.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.registrationNumber.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  });

  const handleOpenCoop = (id: string) => {
    setSelectedCoopId(id);
    navigate('coop-details', id);
  };

  const handleOpenMembers = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedCoopId(id);
    navigate('coop-members', id);
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Cooperatives
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Member labor societies and regional worker cooperatives.
          </p>
        </div>
        <button
          onClick={() => navigate('add-coop')}
          className="self-start sm:self-auto flex items-center gap-2 bg-primary text-on-primary font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary-container active:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">domain_add</span>
          <span>Add Cooperative</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cooperatives by name, code, or location..."
            className="w-full h-11 pl-11 pr-10 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>
      </div>

      {/* Cooperative Cards Grid */}
      <div className="space-y-3">
        <div className="text-xs text-on-surface-variant px-1 font-medium">
          Showing {filteredCoops.length} cooperatives
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCoops.map((coop) => (
            <div
              key={coop.id}
              onClick={() => handleOpenCoop(coop.id)}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-on-surface text-base">
                      {coop.name}
                    </h3>
                    <span className="text-xs text-on-surface-variant font-mono">
                      Code: {coop.registrationNumber}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {coop.status || 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <span className="text-on-surface-variant block">Members</span>
                    <span className="font-bold text-on-surface text-sm mt-0.5 block">
                      {coop.memberCount} workers
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low">
                    <span className="text-on-surface-variant block">Location / Region</span>
                    <span className="font-bold text-on-surface text-sm mt-0.5 block truncate">
                      {coop.region}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handleOpenMembers(e, coop.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  <span>View Members</span>
                </button>

                <button
                  onClick={() => handleOpenCoop(coop.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors shadow-xs"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
