import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  clientName: string;
  cooperativeName: string;
  scope: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PROPOSED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
}

const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: 'cnt-01',
    contractNumber: 'CNT-2026-001',
    title: 'Municipal Facility Maintenance Framework',
    clientName: 'Municipal Corporation of Delhi',
    cooperativeName: 'New Delhi Artisan & Skilled Labour Society',
    scope: 'Comprehensive electrical, plumbing, and facility maintenance across Delhi public buildings.',
    startDate: '01 Oct 2026',
    endDate: '31 Dec 2026',
    status: 'ACTIVE',
  },
  {
    id: 'cnt-02',
    contractNumber: 'CNT-2026-002',
    title: 'South Delhi Schools Plumbing Restorations',
    clientName: 'Department of School Education',
    cooperativeName: 'South Delhi Trades & Services Society',
    scope: 'Water supply lines overhaul and rainwater harvesting pipe restoration.',
    startDate: '15 Nov 2026',
    endDate: '15 Feb 2027',
    status: 'PROPOSED',
  },
];

export const ContractsView: React.FC = () => {
  const { addToast } = useWorkforce();
  const [contracts] = useState<ContractItem[]>(INITIAL_CONTRACTS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = contracts.filter((c) =>
    statusFilter === 'ALL' ? true : c.status === statusFilter,
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
            Workforce Contracts (WaaS)
          </h1>
          <p className="text-secondary text-sm">
            Institutional and enterprise contracts governing cooperative workforce allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-secondary uppercase">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-surface-container-high rounded-xl text-xs text-on-surface"
          >
            <option value="ALL">All Contracts</option>
            <option value="ACTIVE">Active</option>
            <option value="PROPOSED">Proposed</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-surface rounded-2xl border border-surface-container-high overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-low/50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <th className="py-3.5 px-4">Contract #</th>
                <th className="py-3.5 px-4">Title & Scope</th>
                <th className="py-3.5 px-4">Client Organization</th>
                <th className="py-3.5 px-4">Executing Cooperative</th>
                <th className="py-3.5 px-4">Timeline</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-xs">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-tertiary">{c.contractNumber}</td>
                  <td className="py-4 px-4 max-w-xs">
                    <p className="font-semibold text-on-surface text-sm">{c.title}</p>
                    <p className="text-secondary text-[11px] truncate mt-0.5">{c.scope}</p>
                  </td>
                  <td className="py-4 px-4 font-medium text-on-surface">{c.clientName}</td>
                  <td className="py-4 px-4 text-secondary">{c.cooperativeName}</td>
                  <td className="py-4 px-4 text-secondary whitespace-nowrap">
                    {c.startDate} – {c.endDate}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        c.status === 'ACTIVE'
                          ? 'bg-success/10 text-success'
                          : c.status === 'PROPOSED'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      {c.status}
                    </span>
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
