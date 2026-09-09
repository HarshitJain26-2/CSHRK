import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const AddSkillView: React.FC = () => {
  const { navigate, addSkill } = useWorkforce();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Agronomy');
  const [description, setDescription] = useState('');
  const [scopeOfPractice, setScopeOfPractice] = useState('');
  const [reqCertInput, setReqCertInput] = useState('OSHA-30 Construction & Field Safety');
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  const [rubricBeg, setRubricBeg] = useState('Performs baseline operations under supervisor direction with zero infractions.');
  const [rubricInt, setRubricInt] = useState('Executes standard workflows independently and identifies minor technical anomalies.');
  const [rubricAdv, setRubricAdv] = useState('Resolves non-standard technical disruptions, operates all equipment variations.');
  const [rubricExp, setRubricExp] = useState('Audits field operations, trains apprentice cohorts, and certifies compliance standards.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSkill({
      name,
      code: code || `SKL-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      description,
      scopeOfPractice,
      status: status as any,
      requiredCertifications: [reqCertInput],
      proficiencyRubric: {
        beginner: rubricBeg,
        intermediate: rubricInt,
        advanced: rubricAdv,
        expert: rubricExp,
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
          <span>Cancel & Return to Skills</span>
        </button>

        <span className="font-label-sm text-label-sm text-outline">New Competency Registration</span>
      </div>

      <form onSubmit={handleSubmit} className="p-space-md space-y-space-md max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Add New Skill</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Define enterprise competencies, qualification rubrics, and regulatory prerequisites.
          </p>
        </div>

        {/* Basic Information */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">info</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">General Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Competency Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Automated Robotic MIG Welding"
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Competency Code / ID (Auto or Custom)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. WELD-MIG-04 (Leave blank to auto-generate)"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Domain / Category <span className="text-error">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              >
                <option value="Agronomy">Agronomy & Soil Sciences</option>
                <option value="Heavy Machinery">Heavy Machinery Operations</option>
                <option value="Welding & Metallurgy">Welding & Metallurgy</option>
                <option value="Civil Operations">Civil Operations & Earthmoving</option>
                <option value="Energy">Renewable Energy & Photovoltaics</option>
                <option value="Logistics">Fleet & Cargo Logistics</option>
                <option value="Safety">Occupational Health & Safety</option>
                <option value="Quality Assurance">Quality Assurance & Inspection</option>
                <option value="Technical & Systems">Technical & Automation Systems</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              >
                <option value="active">Active (Available for worker assignment)</option>
                <option value="draft">Draft (Under supervisory review)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              Competency Description & Summary <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe technical procedures, equipment involved, and standards."
              required
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              Scope of Practice & Operational Boundaries
            </label>
            <textarea
              rows={2}
              value={scopeOfPractice}
              onChange={(e) => setScopeOfPractice(e.target.value)}
              placeholder="Explicit boundaries, jurisdictional clearances, and supervision rules."
              className="w-full p-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none resize-none"
            />
          </div>
        </div>

        {/* 4-Tier Rubric Criteria */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">grading</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">4-Tier Proficiency Rubric</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                Level 1: Beginner Criteria
              </label>
              <input
                type="text"
                value={rubricBeg}
                onChange={(e) => setRubricBeg(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface font-semibold">
                Level 2: Intermediate Criteria
              </label>
              <input
                type="text"
                value={rubricInt}
                onChange={(e) => setRubricInt(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-primary font-semibold">
                Level 3: Advanced Criteria
              </label>
              <input
                type="text"
                value={rubricAdv}
                onChange={(e) => setRubricAdv(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-primary font-bold">
                Level 4: Expert / Master Criteria
              </label>
              <input
                type="text"
                value={rubricExp}
                onChange={(e) => setRubricExp(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Required Certification Mapping */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">workspace_premium</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">Required Certifications</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Prerequisite Certification</label>
            <input
              type="text"
              value={reqCertInput}
              onChange={(e) => setReqCertInput(e.target.value)}
              placeholder="e.g. AWS D1.1 or OSHA-30"
              className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('skills')}
            className="h-11 px-5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
          >
            <span>Save & Publish Skill</span>
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>
      </form>
    </div>
  );
};
