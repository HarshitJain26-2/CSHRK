import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const EditSkillView: React.FC = () => {
  const { selectedSkillId, skills, updateSkill, deactivateSkill, openConfirmDialog, navigate } = useWorkforce();

  const skill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const [name, setName] = useState(skill.name);
  const [category, setCategory] = useState(skill.category);
  const [description, setDescription] = useState(skill.description);
  const [scopeOfPractice, setScopeOfPractice] = useState(skill.scopeOfPractice);
  const [rubricBeg, setRubricBeg] = useState(skill.proficiencyRubric.beginner);
  const [rubricInt, setRubricInt] = useState(skill.proficiencyRubric.intermediate);
  const [rubricAdv, setRubricAdv] = useState(skill.proficiencyRubric.advanced);
  const [rubricExp, setRubricExp] = useState(skill.proficiencyRubric.expert);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSkill(skill.id, {
      name,
      category,
      description,
      scopeOfPractice,
      proficiencyRubric: {
        beginner: rubricBeg,
        intermediate: rubricInt,
        advanced: rubricAdv,
        expert: rubricExp,
      },
    });
  };

  const handleDeactivate = () => {
    openConfirmDialog({
      title: `Deactivate ${skill.name}?`,
      description: `Warning: ${skill.totalWorkers} workers are currently mapped to this competency. Deactivation will flag all existing records and block new assignments.`,
      confirmLabel: 'Confirm Deactivation',
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
          onClick={() => navigate('skill-details', skill.id)}
          className="flex items-center gap-1.5 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Skill Details</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">Editing {skill.code}</span>
      </div>

      <form onSubmit={handleSubmit} className="p-space-md space-y-space-md max-w-4xl mx-auto w-full">
        {/* Header & Audit Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Edit Competency: {skill.name}
            </h1>
            <span className="font-code-sm text-code-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
              {skill.id}
            </span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-tertiary">history</span>
            <span>Version 2.4 • Last updated by Supervisor Sarah Jenkins on Aug 18, 2026</span>
          </p>
        </div>

        {/* General Parameters */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Core Attributes</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Competency Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Category / Domain</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Scope of Practice</label>
            <textarea
              rows={2}
              value={scopeOfPractice}
              onChange={(e) => setScopeOfPractice(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none resize-none"
            />
          </div>
        </div>

        {/* 4-Tier Rubric Updates */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <span className="font-headline-sm text-headline-sm text-on-surface">Proficiency Rubric</span>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface font-semibold">Level 1: Beginner</label>
              <input
                type="text"
                value={rubricBeg}
                onChange={(e) => setRubricBeg(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface font-semibold">Level 2: Intermediate</label>
              <input
                type="text"
                value={rubricInt}
                onChange={(e) => setRubricInt(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-primary font-semibold">Level 3: Advanced</label>
              <input
                type="text"
                value={rubricAdv}
                onChange={(e) => setRubricAdv(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-primary font-bold">Level 4: Expert</label>
              <input
                type="text"
                value={rubricExp}
                onChange={(e) => setRubricExp(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-space-md rounded-xl bg-error-container/20 border border-error/30 space-y-3">
          <div className="flex items-center gap-2 text-error font-headline-sm text-headline-sm">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span>Danger Zone</span>
          </div>
          <p className="font-body-sm text-[12px] text-on-surface-variant">
            Deactivating this skill will mark it as deprecated across all {skill.totalWorkers} assigned workers and prevent future cooperative rosters from mapping this skill.
          </p>
          <button
            type="button"
            onClick={handleDeactivate}
            className="px-4 py-2 rounded-xl bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-opacity"
          >
            Deactivate Skill
          </button>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('skill-details', skill.id)}
            className="h-11 px-5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
          >
            <span>Save Changes</span>
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
