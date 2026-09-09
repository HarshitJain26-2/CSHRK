import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const SkillsManagementView: React.FC = () => {
  const { skills, navigate, setSelectedSkillId, openConfirmDialog, deactivateSkill, metrics } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = [
    'All',
    'Agronomy',
    'Heavy Machinery',
    'Welding & Metallurgy',
    'Civil Operations',
    'Energy',
    'Logistics',
    'Safety',
    'Quality Assurance',
  ];

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      if (selectedCategory !== 'All' && !skill.category.includes(selectedCategory)) {
        return false;
      }
      if (selectedStatus !== 'all' && skill.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = skill.name.toLowerCase().includes(q);
        const matchesCode = skill.code.toLowerCase().includes(q);
        const matchesDesc = skill.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [skills, selectedCategory, selectedStatus, searchQuery]);

  const handleDeactivate = (id: string, name: string, workerCount: number) => {
    openConfirmDialog({
      title: `Deactivate Skill ${name}?`,
      description: `Warning: ${workerCount} workers are currently mapped to this competency. Deactivating it will prevent future assignment and mark existing records as legacy.`,
      confirmLabel: 'Deactivate Skill',
      isDestructive: true,
      onConfirm: () => {
        deactivateSkill(id);
      },
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Interactive Action Header & Overview */}
      <div className="px-space-md pt-space-md pb-space-xs flex flex-col gap-space-sm">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">
              Skills Management
            </h1>
            <p className="font-body-sm text-body-sm text-secondary">
              Manage workforce competencies, skill categories, and proficiency rubrics.
            </p>
          </div>
          <button
            onClick={() => navigate('add-skill')}
            className="h-[38px] px-space-sm bg-primary-container text-on-primary rounded-xl font-label-md text-label-md flex items-center gap-space-2xs shadow-sm hover:bg-primary active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Skill</span>
          </button>
        </div>

        {/* 2x2 Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs mt-space-2xs">
          <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Skills</span>
              <span className="material-symbols-outlined text-[18px] text-primary">psychology</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-display-lg-mobile text-display-lg-mobile text-on-surface leading-none tabular-nums">
                {metrics.totalSkills}
              </div>
              <div className="font-code-sm text-code-sm text-secondary mt-space-2xs truncate">
                Across {metrics.skillCategories} domains
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Mapped Workers</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary-container">badge</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-display-lg-mobile text-display-lg-mobile text-on-surface leading-none tabular-nums">
                {metrics.mappedWorkersCount.toLocaleString()}
              </div>
              <div className="font-code-sm text-code-sm text-on-tertiary-container font-medium mt-space-2xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> 95.3% coverage
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Verified Skills</span>
              <span className="material-symbols-outlined text-[18px] text-surface-tint">verified</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-display-lg-mobile text-display-lg-mobile text-on-surface leading-none tabular-nums">
                {metrics.verifiedSkillsCount.toLocaleString()}
              </div>
              <div className="font-code-sm text-code-sm text-secondary mt-space-2xs truncate">
                Audited rubric level
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col justify-between border border-surface-container-high">
            <div className="flex items-center justify-between text-secondary">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Categories</span>
              <span className="material-symbols-outlined text-[18px] text-primary-container">category</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-display-lg-mobile text-display-lg-mobile text-on-surface leading-none tabular-nums">
                {metrics.skillCategories}
              </div>
              <div className="font-code-sm text-code-sm text-secondary mt-space-2xs truncate">
                Active domains
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="px-space-md flex flex-col gap-space-sm mt-space-xs">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, competencies, or categories..."
            className="w-full h-[42px] pl-10 pr-10 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl outline-none placeholder:text-outline border border-surface-container-high shadow-sm focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Segments / Tab Strip */}
        <div className="flex items-center gap-space-2xs overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-space-sm py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1 shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low border border-surface-container-high'
              }`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 text-label-sm font-label-sm text-secondary">
          <span className="text-outline uppercase tracking-wider shrink-0 mr-1">Status:</span>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-2.5 py-1 rounded-md shrink-0 shadow-xs transition-colors ${
              selectedStatus === 'all'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container-lowest text-secondary border border-surface-container-high'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-2.5 py-1 rounded-md shrink-0 shadow-xs flex items-center gap-1 transition-colors ${
              selectedStatus === 'active'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container-lowest text-secondary border border-surface-container-high'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Active
          </button>
          <button
            onClick={() => setSelectedStatus('deprecated')}
            className={`px-2.5 py-1 rounded-md shrink-0 shadow-xs transition-colors ${
              selectedStatus === 'deprecated'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container-lowest text-secondary border border-surface-container-high'
            }`}
          >
            Deprecated / Inactive
          </button>
        </div>
      </div>

      {/* Skills Table / Cards List */}
      <div className="px-space-md mt-space-sm space-y-3">
        {filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl text-center space-y-2 border border-surface-container-high shadow-sm">
            <span className="material-symbols-outlined text-[32px] text-outline">psychology_alt</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">No Skills Match Your Filters</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Try modifying your search query or reset the category filter to view all enterprise skills.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('all');
              }}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[22px]">psychology</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                        {skill.name}
                      </span>
                      <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                        {skill.code}
                      </span>
                    </div>
                    <span className="font-body-sm text-[12px] text-primary font-medium mt-0.5">
                      {skill.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-label-sm font-semibold ${
                      skill.status === 'active'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {skill.status === 'active' ? 'Active' : 'Deprecated'}
                  </span>
                </div>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">
                {skill.description}
              </p>

              {/* Workers and Level Breakdown Bar */}
              <div className="p-2.5 rounded-lg bg-surface-container-low space-y-1.5">
                <div className="flex items-center justify-between text-[12px] font-label-sm text-on-surface">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">groups</span>
                    <strong>{skill.totalWorkers}</strong> Workers Assigned
                  </span>
                  <span className="text-secondary text-[11px]">
                    Beg: {skill.workerLevelBreakdown.beginner} • Int: {skill.workerLevelBreakdown.intermediate} • Adv: {skill.workerLevelBreakdown.advanced} • Exp: {skill.workerLevelBreakdown.expert}
                  </span>
                </div>

                {/* Level Distribution Bar */}
                <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
                  <div
                    className="bg-outline"
                    style={{ width: `${(skill.workerLevelBreakdown.beginner / (skill.totalWorkers || 1)) * 100}%` }}
                    title="Beginner"
                  ></div>
                  <div
                    className="bg-secondary"
                    style={{ width: `${(skill.workerLevelBreakdown.intermediate / (skill.totalWorkers || 1)) * 100}%` }}
                    title="Intermediate"
                  ></div>
                  <div
                    className="bg-primary-container"
                    style={{ width: `${(skill.workerLevelBreakdown.advanced / (skill.totalWorkers || 1)) * 100}%` }}
                    title="Advanced"
                  ></div>
                  <div
                    className="bg-primary"
                    style={{ width: `${(skill.workerLevelBreakdown.expert / (skill.totalWorkers || 1)) * 100}%` }}
                    title="Expert"
                  ></div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-surface-container-low">
                <button
                  onClick={() => {
                    setSelectedSkillId(skill.id);
                    navigate('skill-details', skill.id);
                  }}
                  className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline"
                >
                  <span>Skill Details & Rubric</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSkillId(skill.id);
                      navigate('workers');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
                  >
                    View Workers
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSkillId(skill.id);
                      navigate('edit-skill', skill.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-low text-secondary font-label-sm text-label-sm hover:text-on-surface transition-colors"
                  >
                    Edit
                  </button>
                  {skill.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(skill.id, skill.name, skill.totalWorkers)}
                      className="px-2.5 py-1 rounded-lg text-error hover:bg-error-container/40 font-label-sm text-label-sm transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
