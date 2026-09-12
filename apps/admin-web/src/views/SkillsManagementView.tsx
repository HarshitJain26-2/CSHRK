import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const SkillsManagementView: React.FC = () => {
  const { skills, navigate, setSelectedSkillId } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(skills.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      if (selectedCategory !== 'all' && skill.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          skill.name.toLowerCase().includes(q) ||
          skill.code.toLowerCase().includes(q) ||
          skill.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [skills, searchQuery, selectedCategory]);

  const handleOpenSkill = (id: string) => {
    setSelectedSkillId(id);
    navigate('skill-details', id);
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Skills
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Standard trade skills and competencies across all cooperatives.
          </p>
        </div>
        <button
          onClick={() => navigate('add-skill')}
          className="self-start sm:self-auto flex items-center gap-2 bg-primary text-on-primary font-label-md text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary-container active:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Add Skill</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name or code..."
            className="w-full h-11 pl-11 pr-10 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="space-y-2">
        <div className="text-xs text-on-surface-variant px-1 font-medium">
          Showing {filteredSkills.length} skills
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => handleOpenSkill(skill.id)}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    {skill.category}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {skill.code}
                  </span>
                </div>

                <h3 className="font-bold text-on-surface text-base mt-2.5 line-clamp-1">
                  {skill.name}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                  {skill.description || 'Standard industry qualification rubric.'}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">groups</span>
                  <span>{skill.totalWorkers} workers</span>
                </div>

                <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
