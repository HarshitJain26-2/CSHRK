import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const CooperativeMembersView: React.FC = () => {
  const { selectedCoopId, cooperatives, workers, navigate, setSelectedWorkerId, addToast, openConfirmDialog } = useWorkforce();

  const [activeCoopId, setActiveCoopId] = useState(selectedCoopId || 'COOP-01');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatus, setMemberStatus] = useState('all');

  const coop = cooperatives.find((c) => c.id === activeCoopId) || cooperatives[0];

  const coopMembers = useMemo(() => {
    return workers.filter((w) => {
      const matchCoop = w.cooperativeId === coop.id || w.cooperativeName === coop.name;
      if (!matchCoop) return false;
      if (memberStatus !== 'all' && w.status !== memberStatus) return false;
      if (memberSearch.trim()) {
        const q = memberSearch.toLowerCase();
        const mName = w.fullName.toLowerCase().includes(q);
        const mId = w.id.toLowerCase().includes(q);
        const mRole = w.role.toLowerCase().includes(q);
        if (!mName && !mId && !mRole) return false;
      }
      return true;
    });
  }, [workers, coop, memberStatus, memberSearch]);

  const handleTransfer = (workerName: string) => {
    openConfirmDialog({
      title: `Transfer ${workerName}?`,
      description: `Select target cooperative society to transfer membership and dispatch credentials for ${workerName}.`,
      confirmLabel: 'Initiate Transfer',
      onConfirm: () => {
        addToast('success', 'Transfer Initiated', `Membership transfer paperwork generated for ${workerName}.`);
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Bar */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('coop-details', coop.id)}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to {coop.name}</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">Member Roster View</span>
      </div>

      {/* Hero Header with Cooperative Selector */}
      <div className="px-space-md pt-space-md pb-space-sm bg-surface-container-low border-b border-surface-container-high space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {coop.name} Member Roster
            </h1>
            <p className="font-body-sm text-body-sm text-secondary">
              Managing {coop.memberCount} affiliated union and cooperative workers in {coop.region}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-label-sm text-label-sm text-secondary">Switch Society:</label>
            <select
              value={activeCoopId}
              onChange={(e) => setActiveCoopId(e.target.value)}
              className="h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant outline-none"
            >
              {cooperatives.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.memberCount} members)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-space-md space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search member name, worker ID, or trade role..."
              className="w-full h-10 pl-10 pr-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl outline-none border border-surface-container-high focus:border-primary shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={memberStatus}
              onChange={(e) => setMemberStatus(e.target.value)}
              className="h-10 px-3 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant outline-none"
            >
              <option value="all">All Member Statuses</option>
              <option value="active">Active Members</option>
              <option value="onboarding">In Onboarding</option>
              <option value="inactive">Stand-down</option>
            </select>
          </div>
        </div>

        {/* Member Cards Table */}
        <div className="space-y-3">
          {coopMembers.length === 0 ? (
            <div className="p-8 bg-surface-container-lowest rounded-xl text-center border border-surface-container-high space-y-2">
              <span className="font-headline-sm text-headline-sm text-on-surface">No Members Found</span>
              <p className="font-body-sm text-body-sm text-secondary">
                No workers currently match the specified filter in this cooperative society.
              </p>
            </div>
          ) : (
            coopMembers.map((worker) => (
              <div
                key={worker.id}
                className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={worker.avatar}
                    alt={worker.fullName}
                    className="w-12 h-12 rounded-xl object-cover bg-surface-container shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                        {worker.fullName}
                      </span>
                      <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                        {worker.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-label-sm font-semibold ${
                          worker.status === 'active'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        {worker.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-body-sm text-[12px] text-secondary mt-0.5">
                      {worker.role} • {worker.employmentType} • Joined {worker.joinedDate}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {worker.skills.slice(0, 3).map((sk) => (
                        <span
                          key={sk.name}
                          className="px-1.5 py-0.5 rounded text-[10px] font-label-sm bg-surface-container-low text-on-surface"
                        >
                          {sk.name} ({sk.level})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-container-low">
                  <button
                    onClick={() => {
                      addToast('success', 'Shift Scheduled', `Assigned shift schedule to ${worker.fullName}.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors"
                  >
                    Assign Shift
                  </button>
                  <button
                    onClick={() => handleTransfer(worker.fullName)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-sm text-label-sm transition-colors"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWorkerId(worker.id);
                      navigate('worker-profile', worker.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm shadow-xs transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
