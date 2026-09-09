import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const WorkerOnboardingView: React.FC = () => {
  const { navigate, addWorker, cooperatives } = useWorkforce();

  // Form State
  const [fullName, setFullName] = useState('Carlos Mendez');
  const [role, setRole] = useState('Senior Agronomist & Machine Specialist');
  const [selectedCoop, setSelectedCoop] = useState('COOP-01');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Contract' | 'In Onboarding'>('In Onboarding');
  const [email, setEmail] = useState('carlos.mendez@apexagro.org');
  const [phone, setPhone] = useState('+1 (555) 382-9104');

  // Selected Skills in Step 5
  const [skillsList, setSkillsList] = useState([
    {
      id: 'SKL-1042',
      name: 'Tractor Operations & Telematics',
      category: 'Agricultural Machinery • Tier A Fleet',
      icon: 'agriculture',
      level: 'expert' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      experience: '5',
      tag: 'Telemetry Logged',
    },
    {
      id: 'SKL-1088',
      name: 'Soil Chemical Composition Analysis',
      category: 'Agronomy & Soil Science • Lab Grade',
      icon: 'science',
      level: 'advanced' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      experience: '3',
      tag: 'Certified Lab Spec',
    },
  ]);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [skillSearch, setSkillSearch] = useState('');

  const handleRemoveSkill = (id: string) => {
    setSkillsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    addWorker({
      fullName,
      role,
      cooperativeId: selectedCoop,
      employmentType,
      email,
      phone,
      skills: skillsList.map((s) => ({
        skillId: s.id,
        name: s.name,
        level: s.level === 'expert' ? 'Expert' : s.level === 'advanced' ? 'Adv' : s.level === 'intermediate' ? 'Int' : 'Beg',
        verified: true,
      })),
      certifications: [
        {
          certId: 'CRT-' + Math.floor(1000 + Math.random() * 9000),
          name: 'OSHA-30 & Agricultural Standard',
          issuer: 'OSHA / Cooperative Board',
          expiryDate: '2028-09-09',
          status: 'valid',
        },
      ],
    });
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Sub-Header Bar with Back Navigation */}
      <div className="px-space-md py-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('workers')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-headline-sm text-headline-sm text-on-surface">Worker Onboarding</h1>
            <span className="font-body-sm text-[12px] text-on-surface-variant">Step 5 of 7: Competency Mapping</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-label-sm font-semibold bg-primary-fixed text-on-primary-fixed-variant">
          In Progress
        </span>
      </div>

      {/* Stepper Navigation Strip */}
      <div className="w-full bg-surface-container-lowest border-b border-surface-container-high overflow-x-auto no-scrollbar py-2.5 px-space-md">
        <div className="flex items-center gap-2 min-w-max">
          {/* Step 1: Completed */}
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span className="font-label-sm text-label-sm font-medium">1. Personal</span>
          </div>
          <div className="w-3 h-0.5 bg-primary"></div>

          {/* Step 2: Completed */}
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span className="font-label-sm text-label-sm font-medium">2. ID</span>
          </div>
          <div className="w-3 h-0.5 bg-primary"></div>

          {/* Step 3: Completed */}
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span className="font-label-sm text-label-sm font-medium">3. Contact</span>
          </div>
          <div className="w-3 h-0.5 bg-primary"></div>

          {/* Step 4: Completed */}
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span className="font-label-sm text-label-sm font-medium">4. Employment</span>
          </div>
          <div className="w-3 h-0.5 bg-primary"></div>

          {/* Step 5: Active */}
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-primary text-on-primary shadow-xs">
            <span className="w-2 h-2 rounded-full bg-on-primary animate-pulse"></span>
            <span className="font-label-sm text-label-sm font-semibold">5. Competencies</span>
          </div>
          <div className="w-3 h-0.5 bg-surface-container-high"></div>

          {/* Step 6: Upcoming */}
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest text-outline border border-surface-container-high">
            <span className="font-label-sm text-label-sm">6. Cooperative</span>
          </div>
          <div className="w-3 h-0.5 bg-surface-container-high"></div>

          {/* Step 7: Upcoming */}
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest text-outline border border-surface-container-high">
            <span className="font-label-sm text-label-sm">7. Review</span>
          </div>
        </div>
      </div>

      {/* Main Active Content Canvas */}
      <form onSubmit={handleCompleteOnboarding} className="flex flex-col gap-space-md px-space-md py-space-sm">
        {/* Worker Context Pill */}
        <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-headline-sm text-headline-sm shrink-0 font-bold">
              CM
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                  {fullName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-label-sm bg-surface-container text-on-surface-variant uppercase">
                  WKR-9402
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {cooperatives.find((c) => c.id === selectedCoop)?.name || 'Apex Agro Cooperative'} • Field Ops Logistics
              </span>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-surface-container-low text-primary font-label-sm text-label-sm shrink-0">
            Draft Active
          </span>
        </div>

        {/* Worker Identity & Cooperative Assignment Section */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">badge</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">Worker Profile Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-1">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none border border-outline-variant focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Job Title / Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none border border-outline-variant focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Primary Affiliated Cooperative</label>
              <select
                value={selectedCoop}
                onChange={(e) => setSelectedCoop(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none border border-outline-variant focus:border-primary"
              >
                {cooperatives.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.region})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Employment Classification</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none border border-outline-variant focus:border-primary"
              >
                <option value="Full-Time">Full-Time Member Worker</option>
                <option value="Contract">Contract Worker</option>
                <option value="In Onboarding">Apprentice in Onboarding</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none border border-outline-variant focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none border border-outline-variant focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Competencies Form Section */}
        <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary fill-1">psychology</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Add Worker Competencies</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {skillsList.length} Selected
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">search</span>
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search skills (e.g. Arc Welding, Soil Testing)..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-surface-container-lowest font-body-md text-body-md text-on-surface outline-none border border-outline-variant focus:border-primary shadow-sm"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="overflow-x-auto no-scrollbar -mx-space-md px-space-md pt-1">
            <div className="flex items-center gap-1.5 min-w-max">
              {['All', 'Heavy Machinery', 'Agronomy', 'Electrical', 'QA & Safety'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                    activeCategoryFilter === cat
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Selected Skills Cards */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Validated Skills Configuration
            </span>
            <span className="font-code-sm text-code-sm text-outline">CR-204 Compliant</span>
          </div>

          {skillsList.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high gap-space-sm relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{skill.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">{skill.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{skill.category}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-surface-container transition-colors shrink-0"
                  title="Remove Skill"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-space-sm pt-space-2xs">
                {/* Proficiency Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Proficiency Level</label>
                  <div className="relative">
                    <select
                      value={skill.level}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setSkillsList((prev) =>
                          prev.map((s) => (s.id === skill.id ? { ...s, level: val } : s))
                        );
                      }}
                      className="w-full h-9 px-2.5 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-outline-variant outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Experience Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Verified Experience</label>
                  <div className="relative">
                    <select
                      value={skill.experience}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSkillsList((prev) =>
                          prev.map((s) => (s.id === skill.id ? { ...s, experience: val } : s))
                        );
                      }}
                      className="w-full h-9 px-2.5 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface border border-outline-variant outline-none"
                    >
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="5">5+ Years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span> {skill.tag}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">ID: {skill.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Form Submission Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-surface-container-high">
          <button
            type="button"
            onClick={() => navigate('workers')}
            className="h-11 px-5 rounded-xl bg-surface-container-low text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel Onboarding
          </button>

          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
          >
            <span>Complete Onboarding</span>
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </button>
        </div>
      </form>
    </div>
  );
};
