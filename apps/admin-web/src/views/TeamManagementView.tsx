import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

interface TeamItem {
  id: string;
  name: string;
  description: string;
  leaderName: string;
  memberCount: number;
  tradeSkills: string[];
  status: 'ACTIVE' | 'ASSIGNED' | 'DISBANDED';
  projectTitle?: string;
}

const INITIAL_TEAMS: TeamItem[] = [
  {
    id: 'team-delhi-01',
    name: 'Delhi Alpha Electrical Crew',
    description: 'Certified rapid response team for commercial switchboard and commercial wiring.',
    leaderName: 'Amit Sharma',
    memberCount: 4,
    tradeSkills: ['Electrical Wiring', 'Fuse Diagnostics'],
    status: 'ACTIVE',
    projectTitle: 'Civic Center Electrical Overhaul',
  },
  {
    id: 'team-delhi-02',
    name: 'South Delhi Pipefitting & Hydro Crew',
    description: 'Specialist industrial pipe jointing and commercial sanitation team.',
    leaderName: 'Rajesh Kumar',
    memberCount: 3,
    tradeSkills: ['Plumbing', 'Pipe Jointing'],
    status: 'ASSIGNED',
    projectTitle: 'Municipal Facility Maintenance',
  },
  {
    id: 'team-delhi-03',
    name: 'Capital Joinery & Carpentry Team',
    description: 'Specialized modular cabinetry, door frames, and timber maintenance.',
    leaderName: 'Ramesh Lal',
    memberCount: 2,
    tradeSkills: ['Carpentry & Furniture Assembly'],
    status: 'ACTIVE',
  },
];

export const TeamManagementView: React.FC = () => {
  const { addToast } = useWorkforce();
  const [teams, setTeams] = useState<TeamItem[]>(INITIAL_TEAMS);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamDesc, setNewTeamDesc] = useState<string>('');
  const [newTeamLeader, setNewTeamLeader] = useState<string>('Amit Sharma');

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam: TeamItem = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      description: newTeamDesc || 'Cooperative multi-worker trade crew.',
      leaderName: newTeamLeader,
      memberCount: 1,
      tradeSkills: ['General Trade Skills'],
      status: 'ACTIVE',
    };

    setTeams([newTeam, ...teams]);
    setShowCreateModal(false);
    setNewTeamName('');
    setNewTeamDesc('');
    addToast('success', 'Crew Created', `Team "${newTeam.name}" initialized successfully.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">diversity_3</span>
            Worker Teams & Crews
          </h1>
          <p className="text-secondary text-sm">
            Organize member workers into structured crews for multi-worker organizational jobs and structured projects.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Create Worker Crew
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="p-5 bg-surface rounded-2xl border border-surface-container-high space-y-4 hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono font-bold text-tertiary uppercase">
                  {team.id}
                </span>
                <h3 className="text-base font-bold text-on-surface mt-0.5">{team.name}</h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  team.status === 'ACTIVE'
                    ? 'bg-success/10 text-success'
                    : team.status === 'ASSIGNED'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-container text-secondary'
                }`}
              >
                {team.status}
              </span>
            </div>

            <p className="text-secondary text-xs line-clamp-2">{team.description}</p>

            <div className="p-3 bg-surface-container-low rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-secondary">Crew Leader:</span>
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                  {team.leaderName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Total Crew Members:</span>
                <span className="font-semibold text-on-surface">{team.memberCount} workers</span>
              </div>
              {team.projectTitle && (
                <div className="flex justify-between">
                  <span className="text-secondary">Assigned Project:</span>
                  <span className="font-semibold text-primary truncate max-w-[180px]">
                    {team.projectTitle}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-secondary font-semibold uppercase">
                Trade Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {team.tradeSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-surface-container rounded-md text-[11px] text-secondary font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-surface-container-high rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-on-surface">Create New Worker Crew</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
              <div>
                <label className="block text-secondary font-semibold mb-1">Crew Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohini Commercial Electrical Team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
              </div>

              <div>
                <label className="block text-secondary font-semibold mb-1">Crew Description</label>
                <textarea
                  rows={3}
                  placeholder="Scope, specialty trade, and deployment focus"
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
              </div>

              <div>
                <label className="block text-secondary font-semibold mb-1">Crew Leader</label>
                <input
                  type="text"
                  value={newTeamLeader}
                  onChange={(e) => setNewTeamLeader(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
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
                  Create Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
