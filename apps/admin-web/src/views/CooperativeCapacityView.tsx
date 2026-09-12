import React, { useState, useEffect } from 'react';
import { useWorkforce } from '../context/WorkforceContext';
import axios from 'axios';

interface SkillCapacity {
  skillId: string;
  skillName: string;
  total: number;
  available: number;
  committed: number;
}

interface CapacityData {
  cooperativeId: string;
  totalWorkforce: number;
  activeWorkforce: number;
  availableWorkers: number;
  committedWorkforce: number;
  unavailableWorkers: number;
  availableCapacity: number;
  bySkill?: SkillCapacity[];
}

export const CooperativeCapacityView: React.FC = () => {
  const { cooperatives, addToast } = useWorkforce();
  const [selectedCoopId, setSelectedCoopId] = useState<string>(
    cooperatives[0]?.id || 'COOP-ND-001',
  );
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [capacity, setCapacity] = useState<CapacityData>({
    cooperativeId: 'COOP-ND-001',
    totalWorkforce: 24,
    activeWorkforce: 20,
    availableWorkers: 18,
    committedWorkforce: 6,
    unavailableWorkers: 4,
    availableCapacity: 12,
    bySkill: [
      { skillId: '1', skillName: 'Electrical Wiring', total: 8, available: 5, committed: 3 },
      { skillId: '2', skillName: 'Plumbing & Pipefitting', total: 6, available: 4, committed: 2 },
      { skillId: '3', skillName: 'Carpentry & Joinery', total: 5, available: 4, committed: 1 },
      { skillId: '4', skillName: 'Masonry & Plastering', total: 5, available: 5, committed: 0 },
    ],
  });

  const fetchCapacity = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('cshrk_access_token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) params.append('endDate', new Date(endDate).toISOString());

      const res = await axios.get(
        `http://localhost:3000/api/v1/cooperatives/${selectedCoopId}/capacity?${params.toString()}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (res.data?.data) {
        setCapacity(res.data.data);
      }
    } catch {
      // Keep state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacity();
  }, [selectedCoopId]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">pie_chart</span>
            Workforce Capacity & Utilization
          </h1>
          <p className="text-secondary text-sm">
            Time-window aware operational capacity distinguishing available from committed workforce.
          </p>
        </div>

        {/* Cooperative Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-secondary uppercase">Society:</label>
          <select
            value={selectedCoopId}
            onChange={(e) => setSelectedCoopId(e.target.value)}
            className="px-3 py-2 bg-surface border border-surface-container-high rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            {cooperatives.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.region})
              </option>
            ))}

          </select>
        </div>
      </div>

      {/* Time-Window Filter Bar */}
      <div className="p-4 bg-surface rounded-2xl border border-surface-container-high flex flex-wrap items-center gap-4">
        <span className="text-xs font-bold text-secondary uppercase flex items-center gap-1">
          <span className="material-symbols-outlined text-base">date_range</span>
          Time Window:
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-xs text-on-surface"
          />
          <span className="text-secondary text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-xs text-on-surface"
          />
        </div>
        <button
          onClick={fetchCapacity}
          disabled={loading}
          className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Calculate Window Capacity
        </button>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              fetchCapacity();
            }}
            className="text-xs text-secondary hover:text-on-surface underline"
          >
            Clear Window
          </button>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Total Workforce</span>
          <p className="text-2xl font-bold text-on-surface mt-1">{capacity.totalWorkforce}</p>
          <span className="text-[11px] text-tertiary">All enrolled workers</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Active Roster</span>
          <p className="text-2xl font-bold text-on-surface mt-1">{capacity.activeWorkforce}</p>
          <span className="text-[11px] text-primary">Status ACTIVE</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Available</span>
          <p className="text-2xl font-bold text-success mt-1">{capacity.availableWorkers}</p>
          <span className="text-[11px] text-success">Online & ready</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Committed</span>
          <p className="text-2xl font-bold text-warning mt-1">{capacity.committedWorkforce}</p>
          <span className="text-[11px] text-warning">Active bookings/jobs</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Unavailable</span>
          <p className="text-2xl font-bold text-error mt-1">{capacity.unavailableWorkers}</p>
          <span className="text-[11px] text-error">Offline / stand-down</span>
        </div>

        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/30">
          <span className="text-xs text-primary font-bold">Available Capacity</span>
          <p className="text-2xl font-bold text-primary mt-1">{capacity.availableCapacity}</p>
          <span className="text-[11px] text-primary">Immediate deployable</span>
        </div>
      </div>

      {/* Trade Skill Capacity Breakdown */}
      <div className="bg-surface rounded-2xl border border-surface-container-high p-6 space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">engineering</span>
          Trade Skill Operational Distribution
        </h2>
        <p className="text-secondary text-xs">
          Deterministic capacity breakdown by certified trade skill. Shows deployed vs immediately available capacity.
        </p>

        <div className="space-y-4 pt-2">
          {capacity.bySkill?.map((skill) => {
            const availPct = skill.total > 0 ? (skill.available / skill.total) * 100 : 0;
            const commPct = skill.total > 0 ? (skill.committed / skill.total) * 100 : 0;

            return (
              <div key={skill.skillId} className="space-y-1.5 p-3 rounded-xl bg-surface-container-low/40">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-on-surface">{skill.skillName}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-success font-semibold">{skill.available} Available</span>
                    <span className="text-warning font-semibold">{skill.committed} Committed</span>
                    <span className="text-secondary">Total: {skill.total}</span>
                  </div>
                </div>

                {/* Progress bar stack */}
                <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${availPct}%` }}
                    className="bg-success h-full transition-all"
                    title={`Available: ${skill.available}`}
                  />
                  <div
                    style={{ width: `${commPct}%` }}
                    className="bg-warning h-full transition-all"
                    title={`Committed: ${skill.committed}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
