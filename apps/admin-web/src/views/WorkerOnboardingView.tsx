import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const WorkerOnboardingView: React.FC = () => {
  const { navigate, addWorker, cooperatives, setSelectedWorkerId } = useWorkforce();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('General Tradesperson');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Contract'>('Full-Time');
  const [cooperativeId, setCooperativeId] = useState(cooperatives[0]?.id || 'COOP-01');
  const [skillName, setSkillName] = useState('Industrial Electrical');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [certName, setCertName] = useState('Occupational Health & Safety');

  // Success State
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdWorkerId, setCreatedWorkerId] = useState<string>('');

  const selectedCoop = cooperatives.find((c) => c.id === cooperativeId) || cooperatives[0];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'WKR-' + Math.floor(1000 + Math.random() * 9000);
    setCreatedWorkerId(newId);

    addWorker({
      id: newId,
      fullName: fullName.trim() || 'New Worker',
      phone: phone.trim() || '+1 (555) 123-4567',
      email: email.trim() || `${newId.toLowerCase()}@cshrk.local`,
      role,
      employmentType,
      cooperativeId: selectedCoop.id,
      cooperativeName: selectedCoop.name,
      status: 'onboarding',
      joinedDate: 'Today',
      yearsOfService: '< 1 Yr',
      skills: [
        {
          skillId: 'SKL-ONB',
          name: skillName,
          level:
            skillLevel === 'Beginner'
              ? 'Beg'
              : skillLevel === 'Intermediate'
              ? 'Int'
              : skillLevel === 'Advanced'
              ? 'Adv'
              : 'Expert',
          verified: true,
        },
      ],
      certifications: [
        {
          certId: 'CRT-ONB',
          name: certName,
          issuer: 'Cooperative Safety Authority',
          status: 'valid',
          expiryDate: '2028-09-30',
        },
      ],
    });

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto text-center space-y-5 my-12 bg-surface-container-lowest border border-surface-container-high rounded-3xl shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Worker Added Successfully</h2>
          <p className="text-sm text-on-surface-variant mt-1.5">
            {fullName || 'Worker'} ({createdWorkerId}) has been added to {selectedCoop.name}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <button
            onClick={() => {
              setSelectedWorkerId(createdWorkerId);
              navigate('worker-profile', createdWorkerId);
            }}
            className="flex-1 py-3 px-5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-colors shadow-xs"
          >
            View Worker Profile
          </button>
          <button
            onClick={() => {
              setIsSuccess(false);
              setCurrentStep(1);
              setFullName('');
              setPhone('');
              setEmail('');
            }}
            className="flex-1 py-3 px-5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-sm transition-colors"
          >
            Add Another Worker
          </button>
        </div>
      </div>
    );
  }

  const stepTitles = [
    'Basic Information',
    'Work Information',
    'Cooperative',
    'Skills & Certifications',
    'Review',
  ];

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-3xl mx-auto">
      {/* Back Link */}
      <button
        onClick={() => navigate('workers')}
        className="flex items-center gap-1.5 text-secondary hover:text-on-surface text-sm font-medium transition-colors self-start"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        <span>Back to Workers</span>
      </button>

      {/* Header & Step Counter */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs font-medium text-on-surface-variant">
            {stepTitles[currentStep - 1]}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
            {stepTitles[currentStep - 1]}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {currentStep === 1 && 'Enter the worker’s legal name and contact details.'}
            {currentStep === 2 && 'Select the worker’s trade role and employment status.'}
            {currentStep === 3 && 'Assign this worker to a member cooperative society.'}
            {currentStep === 4 && 'Add their primary skill competency and initial certification.'}
            {currentStep === 5 && 'Verify all information before creating the worker profile.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Full Legal Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aarav.sharma@worker.cshrk.org"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Step 2: Work Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Trade / Job Role <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Electrician"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Employment Type <span className="text-error">*</span>
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              >
                <option value="Full-Time">Full-Time Member Worker</option>
                <option value="Contract">Contract Worker</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Cooperative Society */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Select Cooperative Society <span className="text-error">*</span>
              </label>
              <select
                value={cooperativeId}
                onChange={(e) => setCooperativeId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              >
                {cooperatives.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.registrationNumber}) — {c.region}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-1 text-sm">
              <span className="font-semibold text-on-surface">Selected Cooperative:</span>
              <p className="text-on-surface-variant text-xs">
                {selectedCoop.name} • {selectedCoop.memberCount} existing members • Regional delegate: {selectedCoop.delegateName}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Skills & Certifications */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Primary Trade Skill <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Electrical Wiring"
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  Proficiency Level <span className="text-error">*</span>
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">
                Initial Certification / Qualification
              </label>
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="e.g. OSHA 30-Hour Construction Safety"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
              <h3 className="font-bold text-on-surface text-base border-b border-surface-container pb-2">
                Worker Review Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-xs text-on-surface-variant block">Full Name</span>
                  <span className="font-semibold text-on-surface">{fullName || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block">Phone</span>
                  <span className="font-semibold text-on-surface">{phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block">Trade Role</span>
                  <span className="font-semibold text-on-surface">{role}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block">Employment Type</span>
                  <span className="font-semibold text-on-surface">{employmentType}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block">Cooperative Society</span>
                  <span className="font-semibold text-on-surface">{selectedCoop.name}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block">Primary Skill</span>
                  <span className="font-semibold text-on-surface">{skillName} ({skillLevel})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-on-surface-variant'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
          >
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Create Worker</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
