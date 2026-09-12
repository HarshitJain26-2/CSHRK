import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';
import { MASTER_AVATARS } from '../data/workforceData';

export const WorkerProfileView: React.FC = () => {
  const { selectedWorkerId, workers, navigate, openConfirmDialog, deactivateWorker } = useWorkforce();

  const worker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  const handleDeactivate = () => {
    openConfirmDialog({
      title: `Stand-down Worker ${worker.fullName}?`,
      description: `Worker ${worker.id} will be placed into Stand-down / Inactive status. Their shift assignments will be temporarily paused.`,
      confirmLabel: 'Confirm Stand-down',
      isDestructive: true,
      onConfirm: () => {
        deactivateWorker(worker.id);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Active
          </span>
        );
      case 'onboarding':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            Onboarding
          </span>
        );
      case 'inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-outline"></span>
            Inactive / Stand-down
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('workers')}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Workers</span>
        </button>
      </div>

      {/* Top Profile Hero Card */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={worker.id === 'WKR-8042' ? MASTER_AVATARS.CARLOS_PROFILE : worker.avatar}
            alt={worker.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-surface-container-high shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface truncate">
                {worker.fullName}
              </h1>
              <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-mono">
                {worker.id}
              </span>
            </div>
            <p className="text-sm sm:text-base text-on-surface-variant mt-0.5 font-medium">
              {worker.role}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              {getStatusBadge(worker.status)}
              <span className="text-xs text-on-surface-variant">
                Member of {worker.cooperativeName}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('edit-worker', worker.id)}
            className="flex items-center gap-2 bg-primary text-on-primary font-label-md text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary-container active:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit Worker</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid of Clear Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Basic Information
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Full Legal Name</span>
              <span className="font-medium text-on-surface">{worker.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Worker ID</span>
              <span className="font-mono text-on-surface font-medium">{worker.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Joined Date</span>
              <span className="font-medium text-on-surface">{worker.joinedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Years of Service</span>
              <span className="font-medium text-on-surface">{worker.yearsOfService}</span>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">contact_phone</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Contact Information
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Phone Number</span>
              <a
                href={`tel:${worker.phone}`}
                className="font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>{worker.phone}</span>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Email Address</span>
              <a
                href={`mailto:${worker.email}`}
                className="font-medium text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>{worker.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Work Information Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">work</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Work Information
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Trade / Role</span>
              <span className="font-medium text-on-surface">{worker.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Employment Type</span>
              <span className="font-medium text-on-surface">{worker.employmentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Worker Status</span>
              <span>{getStatusBadge(worker.status)}</span>
            </div>
          </div>
        </div>

        {/* Cooperative Card */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-container pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Cooperative Society
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Society Name</span>
              <span className="font-medium text-on-surface">{worker.cooperativeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Society ID</span>
              <span className="font-mono text-on-surface">{worker.cooperativeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Membership Status</span>
              <span className="text-emerald-800 font-semibold">Active Registered Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section Card */}
      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Skills ({worker.skills.length})
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">Validated competencies</span>
        </div>

        {worker.skills.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-2">No skills registered for this worker.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {worker.skills.map((skill, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-on-surface text-sm">{skill.name}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Level: <span className="font-medium text-on-surface">{skill.level}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Section Card */}
      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">workspace_premium</span>
            <h2 className="font-headline-sm text-base font-bold text-on-surface">
              Certifications ({worker.certifications.length})
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">Safety & trade qualifications</span>
        </div>

        {worker.certifications.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-2">No certifications currently registered.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {worker.certifications.map((cert, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-on-surface text-sm">{cert.name}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Expires: <span className="font-medium text-on-surface">{cert.expiryDate}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${
                    cert.status === 'valid'
                      ? 'text-emerald-800 bg-emerald-100'
                      : cert.status === 'expiring'
                      ? 'text-amber-800 bg-amber-100'
                      : 'text-error bg-error/10'
                  }`}
                >
                  {cert.status === 'valid' ? 'Valid' : cert.status === 'expiring' ? 'Expiring Soon' : cert.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stand-down Worker Action */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleDeactivate}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error/10 border border-error/20 transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">block</span>
          <span>Stand-down Worker</span>
        </button>
      </div>
    </div>
  );
};
