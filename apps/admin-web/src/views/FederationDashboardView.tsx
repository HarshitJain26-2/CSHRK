import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

interface MemberCoop {
  id: string;
  name: string;
  district: string;
  totalWorkers: number;
  availableCapacity: number;
}

interface FulfillmentProposalItem {
  id: string;
  title: string;
  requirementQuantity: number;
  skillName: string;
  status: 'PROPOSED' | 'PENDING_COOPERATIVE_APPROVAL' | 'PARTIALLY_APPROVED' | 'CONFIRMED' | 'REJECTED';
  allocations: Array<{
    id: string;
    cooperativeName: string;
    allocatedWorkers: number;
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  }>;
}

const INITIAL_MEMBER_COOPS: MemberCoop[] = [
  {
    id: 'COOP-ND-001',
    name: 'New Delhi Artisan & Skilled Labour Society',
    district: 'New Delhi',
    totalWorkers: 18,
    availableCapacity: 12,
  },
  {
    id: 'COOP-SD-002',
    name: 'South Delhi Trades & Services Society',
    district: 'South Delhi',
    totalWorkers: 14,
    availableCapacity: 9,
  },
  {
    id: 'COOP-NW-003',
    name: 'North West Craftsmen Cooperative',
    district: 'North West Delhi',
    totalWorkers: 12,
    availableCapacity: 8,
  },
];

const INITIAL_PROPOSALS: FulfillmentProposalItem[] = [
  {
    id: 'PLAN-FED-01',
    title: 'Delhi Metro Facility Electrical Overhaul (30 Workers)',
    requirementQuantity: 30,
    skillName: 'Electrical Wiring',
    status: 'PENDING_COOPERATIVE_APPROVAL',
    allocations: [
      {
        id: 'alloc-1',
        cooperativeName: 'New Delhi Artisan Society',
        allocatedWorkers: 10,
        status: 'APPROVED',
      },
      {
        id: 'alloc-2',
        cooperativeName: 'South Delhi Trades Society',
        allocatedWorkers: 8,
        status: 'PENDING_APPROVAL',
      },
      {
        id: 'alloc-3',
        cooperativeName: 'North West Craftsmen Co-op',
        allocatedWorkers: 12,
        status: 'PENDING_APPROVAL',
      },
    ],
  },
];

export const FederationDashboardView: React.FC = () => {
  const { addToast } = useWorkforce();
  const [memberCoops] = useState<MemberCoop[]>(INITIAL_MEMBER_COOPS);
  const [proposals, setProposals] = useState<FulfillmentProposalItem[]>(INITIAL_PROPOSALS);

  const totalNetworkWorkers = memberCoops.reduce((sum, c) => sum + c.totalWorkers, 0);
  const totalNetworkCapacity = memberCoops.reduce((sum, c) => sum + c.availableCapacity, 0);

  const handleRespondAllocation = (
    proposalId: string,
    allocationId: string,
    action: 'APPROVED' | 'REJECTED',
  ) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const updatedAllocs = p.allocations.map((a) =>
          a.id === allocationId ? { ...a, status: action } : a,
        );

        const allApproved = updatedAllocs.every((a) => a.status === 'APPROVED');
        const anyPending = updatedAllocs.some((a) => a.status === 'PENDING_APPROVAL');

        let newPlanStatus = p.status;
        if (allApproved) newPlanStatus = 'CONFIRMED';
        else if (anyPending) newPlanStatus = 'PENDING_COOPERATIVE_APPROVAL';
        else newPlanStatus = 'PARTIALLY_APPROVED';

        return {
          ...p,
          status: newPlanStatus,
          allocations: updatedAllocs,
        };
      }),
    );

    addToast(
      action === 'APPROVED' ? 'success' : 'warning',
      `Allocation ${action}`,
      `Cooperative allocation was marked ${action}.`,
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          Federation Operations & Network Intelligence
        </h1>
        <p className="text-secondary text-sm">
          Network-level capacity aggregation and multi-cooperative fulfillment pooling across primary societies.
        </p>
      </div>

      {/* Network Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Affiliated Cooperatives</span>
          <p className="text-2xl font-bold text-on-surface mt-1">{memberCoops.length}</p>
          <span className="text-[11px] text-tertiary">Primary societies</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Network Workforce</span>
          <p className="text-2xl font-bold text-on-surface mt-1">{totalNetworkWorkers}</p>
          <span className="text-[11px] text-primary">Enrolled across Delhi state</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Combined Available Capacity</span>
          <p className="text-2xl font-bold text-success mt-1">{totalNetworkCapacity}</p>
          <span className="text-[11px] text-success">Immediately deployable</span>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-surface-container-high">
          <span className="text-xs text-secondary font-medium">Active Pooling Proposals</span>
          <p className="text-2xl font-bold text-warning mt-1">{proposals.length}</p>
          <span className="text-[11px] text-warning">Multi-coop fulfillment</span>
        </div>
      </div>

      {/* Member Cooperatives Table */}
      <div className="bg-surface rounded-2xl border border-surface-container-high p-6 space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance</span>
          Affiliated Primary Labour Cooperatives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memberCoops.map((coop) => (
            <div
              key={coop.id}
              className="p-4 bg-surface-container-low rounded-xl border border-surface-container-high space-y-2"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-on-surface text-sm">{coop.name}</h4>
                <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-secondary font-semibold">
                  {coop.id}
                </span>
              </div>
              <p className="text-xs text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {coop.district}
              </p>
              <div className="pt-2 border-t border-surface-container-high flex justify-between text-xs">
                <span className="text-secondary">Workforce: <strong>{coop.totalWorkers}</strong></span>
                <span className="text-success font-semibold">Available: {coop.availableCapacity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Cooperative Fulfillment Proposals */}
      <div className="bg-surface rounded-2xl border border-surface-container-high p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">call_split</span>
              Multi-Cooperative Fulfillment Proposals
            </h2>
            <p className="text-secondary text-xs">
              Federation proposes pooled quotas across societies. Cooperatives must explicitly approve before capacity is committed.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {proposals.map((plan) => (
            <div
              key={plan.id}
              className="p-5 rounded-2xl border border-surface-container-high bg-surface-container-low/30 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono font-bold text-tertiary">{plan.id}</span>
                  <h3 className="text-base font-bold text-on-surface mt-0.5">{plan.title}</h3>
                  <p className="text-xs text-secondary">
                    Required: {plan.requirementQuantity} workers in <strong>{plan.skillName}</strong>
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    plan.status === 'CONFIRMED'
                      ? 'bg-success/10 text-success'
                      : plan.status === 'PARTIALLY_APPROVED'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {plan.status}
                </span>
              </div>

              {/* Allocation List */}
              <div className="space-y-2 pt-2 border-t border-surface-container-high">
                <span className="text-[11px] text-secondary font-bold uppercase">
                  Cooperative Quota Allocations & Approval States:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {plan.allocations.map((alloc) => (
                    <div
                      key={alloc.id}
                      className="p-3 bg-surface rounded-xl border border-surface-container-high space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-xs text-on-surface">
                          {alloc.cooperativeName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            alloc.status === 'APPROVED'
                              ? 'bg-success/10 text-success'
                              : alloc.status === 'REJECTED'
                              ? 'bg-error/10 text-error'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {alloc.status}
                        </span>
                      </div>
                      <p className="text-xs text-secondary font-medium">
                        Allocated Quota: <strong>{alloc.allocatedWorkers} workers</strong>
                      </p>

                      {alloc.status === 'PENDING_APPROVAL' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleRespondAllocation(plan.id, alloc.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-success text-on-success rounded-lg text-[11px] font-semibold hover:bg-success/90"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRespondAllocation(plan.id, alloc.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-surface-container text-error rounded-lg text-[11px] font-semibold hover:bg-error/10"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
