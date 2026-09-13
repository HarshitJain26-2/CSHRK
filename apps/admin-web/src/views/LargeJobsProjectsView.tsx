import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

interface LargeJobItem {
  id: string;
  title: string;
  organizationName: string;
  skillName: string;
  requiredWorkers: number;
  assignedWorkers: number;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  address?: string;
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  contractNumber?: string;
  address?: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
}

const INITIAL_JOBS: LargeJobItem[] = [
  {
    id: 'JOB-DEL-2026-01',
    title: 'Civic Center Distribution Rewiring',
    organizationName: 'Municipal Corporation of Delhi',
    skillName: 'Electrical Wiring',
    requiredWorkers: 6,
    assignedWorkers: 4,
    startDate: '15 Oct 2026',
    endDate: '25 Oct 2026',
    status: 'IN_PROGRESS',
    address: 'Block B, MCD Civic Centre, Minto Road, New Delhi',
  },
  {
    id: 'JOB-DEL-2026-02',
    title: 'Commercial Complex HVAC Duct Sanitization',
    organizationName: 'Delhi Trade Center Association',
    skillName: 'Appliance & Duct Cleaning',
    requiredWorkers: 8,
    assignedWorkers: 8,
    startDate: '01 Nov 2026',
    endDate: '05 Nov 2026',
    status: 'OPEN',
    address: 'Barakhamba Road, Connaught Place',
  },
  {
    id: 'JOB-DEL-2026-03',
    title: 'Public Health Center Water Supply Pipe Replacement',
    organizationName: 'Directorate of Health Services',
    skillName: 'Plumbing & Pipefitting',
    requiredWorkers: 4,
    assignedWorkers: 1,
    startDate: '10 Nov 2026',
    endDate: '20 Nov 2026',
    status: 'OPEN',
    address: 'Saket Community Health Center, South Delhi',
  },
];

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'PROJ-DEL-01',
    title: 'Civic Center Facility Overhaul',
    description: 'Emergency rewiring, circuit breaker replacement, and energy efficiency upgrades across Blocks A-C.',
    contractNumber: 'CNT-2026-001',
    address: 'Minto Road, New Delhi',
    startDate: '01 Oct 2026',
    endDate: '15 Dec 2026',
    status: 'IN_PROGRESS',
  },
  {
    id: 'PROJ-DEL-02',
    title: 'South Delhi Schools Plumbing & Sanitation Audit',
    description: 'Comprehensive plumbing audit, pipe descaling, and rainwater harvesting pipe restoration.',
    contractNumber: 'CNT-2026-002',
    address: '14 Municipal Schools, South Delhi',
    startDate: '15 Nov 2026',
    endDate: '30 Jan 2027',
    status: 'PLANNING',
  },
];

export const LargeJobsProjectsView: React.FC = () => {
  const { addToast } = useWorkforce();
  const [activeTab, setActiveTab] = useState<'jobs' | 'projects'>('jobs');
  const [jobs, setJobs] = useState<LargeJobItem[]>(INITIAL_JOBS);
  const [projects] = useState<ProjectItem[]>(INITIAL_PROJECTS);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');
  const [skillName, setSkillName] = useState<string>('Electrical Wiring');
  const [reqWorkers, setReqWorkers] = useState<number>(4);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !orgName.trim()) return;

    const newJob: LargeJobItem = {
      id: `JOB-DEL-${Math.floor(100 + Math.random() * 900)}`,
      title: jobTitle,
      organizationName: orgName,
      skillName,
      requiredWorkers: Number(reqWorkers),
      assignedWorkers: 0,
      startDate: '15 Nov 2026',
      endDate: '25 Nov 2026',
      status: 'OPEN',
      address: 'Central Delhi Deployment Center',
    };

    setJobs([newJob, ...jobs]);
    setShowCreateModal(false);
    setJobTitle('');
    setOrgName('');
    addToast('success', 'Job Created', `Organizational Job "${newJob.title}" created without financial pricing.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">corporate_fare</span>
            Large Jobs & Structured Projects
          </h1>
          <p className="text-secondary text-sm">
            Manage multi-worker organizational jobs and structured facility maintenance engagements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-container rounded-xl">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'jobs'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Large Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Projects ({projects.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 text-xs"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Create Organizational Job
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'jobs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 bg-surface rounded-2xl border border-surface-container-high space-y-4 hover:border-primary/40 transition-all shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono font-bold text-tertiary">{job.id}</span>
                  <h3 className="text-base font-bold text-on-surface mt-0.5">{job.title}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    job.status === 'OPEN'
                      ? 'bg-primary/10 text-primary'
                      : job.status === 'IN_PROGRESS'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success'
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-secondary">Client Organization:</span>
                  <span className="font-semibold text-on-surface">{job.organizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Required Trade:</span>
                  <span className="font-semibold text-primary">{job.skillName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Workforce Assigned:</span>
                  <span className="font-semibold text-on-surface">
                    {job.assignedWorkers} / {job.requiredWorkers} workers
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Deployment Schedule:</span>
                  <span className="font-semibold text-on-surface">
                    {job.startDate} – {job.endDate}
                  </span>
                </div>
              </div>

              {job.address && (
                <div className="text-[11px] text-secondary flex items-center gap-1 truncate">
                  <span className="material-symbols-outlined text-sm shrink-0">pin_drop</span>
                  <span className="truncate">{job.address}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 bg-surface rounded-2xl border border-surface-container-high space-y-4 hover:border-primary/40 transition-all shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono font-bold text-tertiary">{proj.id}</span>
                  <h3 className="text-lg font-bold text-on-surface mt-0.5">{proj.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {proj.status}
                </span>
              </div>

              <p className="text-secondary text-xs">{proj.description}</p>

              <div className="p-3 bg-surface-container-low rounded-xl space-y-2 text-xs">
                {proj.contractNumber && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Contract Reference:</span>
                    <span className="font-mono font-semibold text-tertiary">{proj.contractNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-secondary">Location:</span>
                  <span className="font-semibold text-on-surface">{proj.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Timeline:</span>
                  <span className="font-semibold text-on-surface">
                    {proj.startDate} – {proj.endDate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-surface-container-high rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-surface">Create Organizational Job</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block text-secondary font-semibold mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Complex Breaker Maintenance"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
              </div>

              <div>
                <label className="block text-secondary font-semibold mb-1">Client Organization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ministry of Public Works"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-secondary font-semibold mb-1">Required Trade</label>
                  <select
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                  >
                    <option value="Electrical Wiring">Electrical Wiring</option>
                    <option value="Plumbing & Pipefitting">Plumbing</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Appliance">Appliance Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-secondary font-semibold mb-1">Workers Needed</label>
                  <input
                    type="number"
                    min={1}
                    value={reqWorkers}
                    onChange={(e) => setReqWorkers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-surface-container rounded-xl text-secondary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
