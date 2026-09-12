import React, { useState } from 'react';

interface AuditItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const INITIAL_AUDIT_LOGS: AuditItem[] = [
  {
    id: 'log-del-01',
    action: 'UPDATE_MEMBERSHIP_STATUS',
    entityType: 'COOPERATIVE_MEMBERSHIP',
    entityId: 'mem-2026-001',
    actor: 'dev_coop@cshrk.local (Cooperative Admin)',
    timestamp: 'Today, 11:20 PM',
    metadata: { previousStatus: 'PENDING', newStatus: 'ACTIVE', verifiedBy: 'Committee' },
  },
  {
    id: 'log-del-02',
    action: 'CREATE_FULFILLMENT_PROPOSAL',
    entityType: 'FULFILLMENT_PLAN',
    entityId: 'PLAN-FED-01',
    actor: 'dev_fed@cshrk.local (Federation Admin)',
    timestamp: 'Today, 11:15 PM',
    metadata: { title: 'Delhi Metro Facility Overhaul', allocationsCount: 3 },
  },
  {
    id: 'log-del-03',
    action: 'CREATE_WORKER_TEAM',
    entityType: 'WORKER_TEAM',
    entityId: 'team-delhi-01',
    actor: 'dev_coop@cshrk.local (Cooperative Admin)',
    timestamp: 'Today, 10:45 PM',
    metadata: { name: 'Delhi Alpha Electrical Crew', leaderWorkerId: 'Amit Sharma' },
  },
  {
    id: 'log-del-04',
    action: 'CREATE_CONTRACT',
    entityType: 'CONTRACT',
    entityId: 'CNT-2026-001',
    actor: 'dev_admin@cshrk.local (Platform Admin)',
    timestamp: 'Today, 10:30 PM',
    metadata: { contractNumber: 'CNT-2026-001', client: 'Municipal Corporation of Delhi' },
  },
];

export const AuditLogView: React.FC = () => {
  const [logs] = useState<AuditItem[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(search.toLowerCase()));

    const matchType = typeFilter === 'ALL' ? true : log.entityType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
            Governance & Audit Trail
          </h1>
          <p className="text-secondary text-sm">
            Strictly append-only immutable record of all administrative, affiliation, verification, and contract events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search action, actor, entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-surface-container-high rounded-xl text-xs text-on-surface w-64"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-surface-container-high rounded-xl text-xs text-on-surface"
          >
            <option value="ALL">All Entity Types</option>
            <option value="COOPERATIVE_MEMBERSHIP">Membership</option>
            <option value="FULFILLMENT_PLAN">Fulfillment Plan</option>
            <option value="WORKER_TEAM">Worker Team</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Event Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-4 px-4 text-secondary whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-4 px-4">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-on-surface">{log.entityType}</p>
                    <p className="text-[11px] font-mono text-tertiary">{log.entityId}</p>
                  </td>
                  <td className="py-4 px-4 text-on-surface font-medium">{log.actor}</td>
                  <td className="py-4 px-4 max-w-xs font-mono text-[11px] text-secondary">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
