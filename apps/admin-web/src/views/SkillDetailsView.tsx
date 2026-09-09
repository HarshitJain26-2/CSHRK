import React from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const SkillDetailsView: React.FC = () => {
  const { selectedSkillId, skills, workers, navigate, setSelectedWorkerId, openConfirmDialog, deactivateSkill, addToast } = useWorkforce();

  const skill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  // Find workers mapped to this skill
  const mappedWorkers = workers.filter((w) =>
    w.skills.some((s) => s.name.toLowerCase().includes(skill.name.toLowerCase().substring(0, 10)))
  );

  const handleDeactivate = () => {
    openConfirmDialog({
      title: `Deactivate ${skill.name}?`,
      description: `Warning: ${skill.totalWorkers} workers are mapped to this competency. It will be marked deprecated and removed from new onboarding assignment.`,
      confirmLabel: 'Confirm Deactivate',
      isDestructive: true,
      onConfirm: () => {
        deactivateSkill(skill.id);
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <button
          onClick={() => navigate('skills')}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Skills Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('edit-skill', skill.id)}
            className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>Edit Skill</span>
          </button>
          {skill.status === 'active' && (
            <button
              onClick={handleDeactivate}
              className="px-3 py-1.5 rounded-xl bg-surface-container text-error hover:bg-error-container/40 font-label-sm text-label-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">block</span>
              <span>Deactivate</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Skill Header */}
      <div className="px-space-md pt-space-md pb-space-lg bg-surface-container-low border-b border-surface-container-high space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">psychology</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface truncate">
                  {skill.name}
                </h1>
                <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                  {skill.code}
                </span>
              </div>
              <span className="font-body-md text-body-md text-primary font-medium mt-0.5">
                {skill.category}
              </span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[12px] font-label-sm font-semibold shrink-0 ${
              skill.status === 'active'
                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {skill.status === 'active' ? 'Active Competency' : 'Deprecated'}
          </span>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-3xl">
          {skill.description}
        </p>

        <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high text-[13px] font-body-sm text-on-surface">
          <strong className="text-secondary font-semibold">Scope of Practice:</strong> {skill.scopeOfPractice}
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-space-md space-y-space-md">
        {/* Competency Level Rubric Matrix */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">grading</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Proficiency Rubric & Criteria</span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary">Enterprise Standard CR-402</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Beginner */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Level 1: Beginner</span>
                <span className="font-code-sm text-[11px] text-secondary">
                  {skill.workerLevelBreakdown.beginner} Workers
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                {skill.proficiencyRubric.beginner}
              </p>
            </div>

            {/* Intermediate */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Level 2: Intermediate</span>
                <span className="font-code-sm text-[11px] text-secondary">
                  {skill.workerLevelBreakdown.intermediate} Workers
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                {skill.proficiencyRubric.intermediate}
              </p>
            </div>

            {/* Advanced */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-primary font-semibold">Level 3: Advanced</span>
                <span className="font-code-sm text-[11px] text-primary font-bold">
                  {skill.workerLevelBreakdown.advanced} Workers
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                {skill.proficiencyRubric.advanced}
              </p>
            </div>

            {/* Expert */}
            <div className="p-3 rounded-xl bg-primary-fixed/30 border border-primary-container/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-primary font-bold">Level 4: Expert</span>
                <span className="font-code-sm text-[11px] text-primary font-bold">
                  {skill.workerLevelBreakdown.expert} Workers
                </span>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                {skill.proficiencyRubric.expert}
              </p>
            </div>
          </div>
        </div>

        {/* Required Certifications */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">workspace_premium</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Required / Linked Certifications</span>
            </div>
            <button
              onClick={() => navigate('certs')}
              className="text-primary font-label-sm text-label-sm hover:underline"
            >
              Inspect Regulatory Standard
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {skill.requiredCertifications.map((req) => (
              <div
                key={req}
                className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">verified</span>
                  <span className="font-label-md text-label-md text-on-surface">{req}</span>
                </div>
                <span className="text-[11px] font-label-sm px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                  Required
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Workers Roster */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">Mapped Workers Roster</span>
              <span className="font-body-sm text-[12px] text-on-surface-variant">
                {skill.totalWorkers} workers qualified across federation cooperatives
              </span>
            </div>
            <button
              onClick={() => {
                addToast('info', 'Roster Export Initiated', `Exporting active ${skill.name} roster in CSV format.`);
              }}
              className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
            >
              Export Roster
            </button>
          </div>

          <div className="space-y-2">
            {mappedWorkers.map((worker) => {
              const workerSkill = worker.skills.find((s) =>
                s.name.toLowerCase().includes(skill.name.toLowerCase().substring(0, 10))
              );
              return (
                <div
                  key={worker.id}
                  onClick={() => {
                    setSelectedWorkerId(worker.id);
                    navigate('worker-profile', worker.id);
                  }}
                  className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between hover:bg-surface-container cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={worker.avatar}
                      alt={worker.fullName}
                      className="w-10 h-10 rounded-xl object-cover bg-surface-container shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {worker.fullName}
                        </span>
                        <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1 py-0.2 rounded">
                          {worker.id}
                        </span>
                      </div>
                      <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                        {worker.cooperativeName} • {worker.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-label-sm font-bold bg-primary text-on-primary">
                      {workerSkill?.level || 'Expert'}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
