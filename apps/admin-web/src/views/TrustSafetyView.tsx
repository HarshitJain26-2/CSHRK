import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  DisputeStatus,
  DisputeResolution,
  ComplaintStatus,
  AccountRestrictionType,
} from '@cshrk/types';

interface DisputeItem {
  id: string;
  bookingId: string;
  initiatorId: string;
  respondentId?: string;
  cooperativeId?: string;
  status: DisputeStatus;
  reason: string;
  disputedAmount: number;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  createdAt: string;
  booking?: { id: string; totalAmount: number };
  initiator?: { fullName?: string; email: string };
  respondent?: { fullName?: string; email: string };
  evidences?: Array<{
    id: string;
    title: string;
    description?: string;
    attachmentJson: {
      filename: string;
      mimeType: string;
      fileSizeBytes: number;
      url: string;
      sha256Checksum: string;
    };
  }>;
}

interface ComplaintItem {
  id: string;
  bookingId: string;
  raisedById: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  resolutionNotes?: string;
  createdAt: string;
  raisedBy?: { fullName?: string; email: string };
  booking?: { id: string };
}

interface RestrictionItem {
  id: string;
  userId: string;
  restrictionType: AccountRestrictionType;
  reason: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  user?: { fullName?: string; email: string; role: string };
  issuedBy?: { fullName?: string; email: string };
}

export const TrustSafetyView: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'disputes' | 'complaints' | 'restrictions'>('disputes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [restrictions, setRestrictions] = useState<RestrictionItem[]>([]);

  // Dispute resolution modal state
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [resolutionType, setResolutionType] = useState<DisputeResolution>(DisputeResolution.FULL_REFUND_CUSTOMER);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [isResolving, setIsResolving] = useState(false);

  // New restriction modal state
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetRestrictionType, setTargetRestrictionType] = useState<AccountRestrictionType>(AccountRestrictionType.WARNING);
  const [restrictionReason, setRestrictionReason] = useState('');
  const [isRestricting, setIsRestricting] = useState(false);

  // Evidence preview modal
  const [previewEvidence, setPreviewEvidence] = useState<any | null>(null);

  const apiBase = 'http://localhost:3000/api/v1/trust-safety';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (activeTab === 'disputes') {
        const res = await axios.get(`${apiBase}/disputes`, { headers });
        setDisputes(res.data.data || res.data || []);
      } else if (activeTab === 'complaints') {
        const res = await axios.get(`${apiBase}/complaints`, { headers });
        setComplaints(res.data.data || res.data || []);
      } else if (activeTab === 'restrictions') {
        const res = await axios.get(`${apiBase}/moderation/restrictions`, { headers });
        setRestrictions(res.data.data || res.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    setIsResolving(true);
    try {
      await axios.post(
        `${apiBase}/disputes/${selectedDispute.id}/resolve`,
        {
          resolution: resolutionType,
          resolutionNotes,
          refundAmount: resolutionType === DisputeResolution.PARTIAL_SETTLEMENT ? refundAmount : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedDispute(null);
      setResolutionNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setIsResolving(false);
    }
  };

  const handleStatusChange = async (disputeId: string, newStatus: DisputeStatus) => {
    try {
      await axios.patch(
        `${apiBase}/disputes/${disputeId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleComplaintStatusChange = async (complaintId: string, newStatus: ComplaintStatus) => {
    try {
      await axios.patch(
        `${apiBase}/complaints/${complaintId}/status`,
        { status: newStatus, resolutionNotes: `Status changed to ${newStatus}` },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update complaint status');
    }
  };

  const handleCreateRestriction = async () => {
    if (!targetUserId || !restrictionReason) return;
    setIsRestricting(true);
    try {
      await axios.post(
        `${apiBase}/moderation/restrictions`,
        {
          userId: targetUserId,
          restrictionType: targetRestrictionType,
          reason: restrictionReason,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowRestrictModal(false);
      setTargetUserId('');
      setRestrictionReason('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to impose restriction');
    } finally {
      setIsRestricting(false);
    }
  };

  const handleRevokeRestriction = async (restrictionId: string) => {
    const reason = prompt('Enter reason for lifting restriction:');
    if (!reason) return;
    try {
      await axios.patch(
        `${apiBase}/moderation/restrictions/${restrictionId}/revoke`,
        { revocationReason: reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke restriction');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Trust & Safety Operations
          </h1>
          <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>
            Operational arbitration, complaints management, and user account restrictions
          </p>
        </div>

        {activeTab === 'restrictions' && (
          <button
            onClick={() => setShowRestrictModal(true)}
            style={{
              padding: '10px 18px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
            }}
          >
            + Impose Restriction
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: '24px', gap: '8px' }}>
        {(['disputes', 'complaints', 'restrictions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              fontWeight: activeTab === tab ? '600' : '500',
              color: activeTab === tab ? '#2563EB' : '#4B5563',
              borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: '15px',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>Loading operational records...</div>
      ) : (
        <>
          {/* TAB 1: DISPUTES */}
          {activeTab === 'disputes' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Dispute ID</th>
                    <th style={{ padding: '12px 16px' }}>Booking</th>
                    <th style={{ padding: '12px 16px' }}>Reason</th>
                    <th style={{ padding: '12px 16px' }}>Disputed Amount</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Evidence</th>
                    <th style={{ padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                        No disputes found
                      </td>
                    </tr>
                  ) : (
                    disputes.map((d) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600' }}>
                          #{d.id.slice(0, 8)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          #{d.bookingId.slice(0, 8)}
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.reason}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                          ₹{d.disputedAmount}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor:
                                d.status === DisputeStatus.RESOLVED ? '#DEF7EC' :
                                d.status === DisputeStatus.OPEN ? '#FEF08A' :
                                d.status === DisputeStatus.ESCALATED ? '#FEE2E2' : '#E0E7FF',
                              color:
                                d.status === DisputeStatus.RESOLVED ? '#03543F' :
                                d.status === DisputeStatus.OPEN ? '#713F12' :
                                d.status === DisputeStatus.ESCALATED ? '#991B1B' : '#3730A3',
                            }}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {d.evidences && d.evidences.length > 0 ? (
                            <button
                              onClick={() => setPreviewEvidence(d.evidences![0])}
                              style={{ padding: '4px 8px', backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              📎 View ({d.evidences.length})
                            </button>
                          ) : (
                            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {d.status !== DisputeStatus.RESOLVED ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <select
                                value={d.status}
                                onChange={(e) => handleStatusChange(d.id, e.target.value as DisputeStatus)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12px' }}
                              >
                                {Object.values(DisputeStatus).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  setSelectedDispute(d);
                                  setRefundAmount(d.disputedAmount);
                                }}
                                style={{
                                  padding: '4px 10px',
                                  backgroundColor: '#2563EB',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                }}
                              >
                                Arbitrate
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#059669', fontSize: '12px', fontWeight: '500' }}>
                              {d.resolution}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Complaint ID</th>
                    <th style={{ padding: '12px 16px' }}>Booking</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Description</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                        No complaints filed
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600' }}>
                          #{c.id.slice(0, 8)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          #{c.bookingId.slice(0, 8)}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                          {c.category}
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                          {c.description}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor:
                                c.status === ComplaintStatus.RESOLVED ? '#DEF7EC' :
                                c.status === ComplaintStatus.OPEN ? '#FEF08A' : '#E0E7FF',
                              color:
                                c.status === ComplaintStatus.RESOLVED ? '#03543F' :
                                c.status === ComplaintStatus.OPEN ? '#713F12' : '#3730A3',
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <select
                            value={c.status}
                            onChange={(e) => handleComplaintStatusChange(c.id, e.target.value as ComplaintStatus)}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12px' }}
                          >
                            {Object.values(ComplaintStatus).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: RESTRICTIONS */}
          {activeTab === 'restrictions' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>User ID</th>
                    <th style={{ padding: '12px 16px' }}>Restriction Type</th>
                    <th style={{ padding: '12px 16px' }}>Reason</th>
                    <th style={{ padding: '12px 16px' }}>Issued By</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restrictions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                        No active user restrictions
                      </td>
                    </tr>
                  ) : (
                    restrictions.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                          {r.user?.email || r.userId.slice(0, 10)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor:
                                r.restrictionType === AccountRestrictionType.SUSPENDED ? '#FEE2E2' :
                                r.restrictionType === AccountRestrictionType.DEACTIVATED ? '#4B5563' : '#FEF08A',
                              color:
                                r.restrictionType === AccountRestrictionType.SUSPENDED ? '#991B1B' :
                                r.restrictionType === AccountRestrictionType.DEACTIVATED ? '#FFFFFF' : '#713F12',
                            }}
                          >
                            {r.restrictionType}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                          {r.reason}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {r.issuedBy?.email || 'Platform Admin'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: r.isActive ? '#DC2626' : '#059669', fontWeight: '600' }}>
                            {r.isActive ? 'ACTIVE' : 'REVOKED'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {r.isActive && (
                            <button
                              onClick={() => handleRevokeRestriction(r.id)}
                              style={{
                                padding: '4px 10px',
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              Lift
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ARBITRATE DISPUTE MODAL */}
      {selectedDispute && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
              Arbitrate Dispute #{selectedDispute.id.slice(0, 8)}
            </h2>
            <div style={{ marginBottom: '16px', fontSize: '14px' }}>
              <p><strong>Reason:</strong> {selectedDispute.reason}</p>
              <p><strong>Disputed Amount:</strong> ₹{selectedDispute.disputedAmount}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                Resolution Decision
              </label>
              <select
                value={resolutionType}
                onChange={(e) => setResolutionType(e.target.value as DisputeResolution)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              >
                <option value={DisputeResolution.FULL_REFUND_CUSTOMER}>Full Refund to Customer</option>
                <option value={DisputeResolution.PARTIAL_SETTLEMENT}>Partial Settlement Refund</option>
                <option value={DisputeResolution.RELEASE_TO_WORKER}>Release Funds to Worker</option>
                <option value={DisputeResolution.DISMISSED}>Dismiss Dispute</option>
              </select>
            </div>

            {resolutionType === DisputeResolution.PARTIAL_SETTLEMENT && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                Decision Rationale / Operational Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document findings and justification for financial arbitration..."
                style={{ width: '100%', height: '80px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedDispute(null)}
                style={{ padding: '8px 16px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDispute}
                disabled={isResolving || !resolutionNotes}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: isResolving || !resolutionNotes ? 'not-allowed' : 'pointer',
                }}
              >
                {isResolving ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW RESTRICTION MODAL */}
      {showRestrictModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: '#DC2626' }}>
              Impose Account Restriction
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Target User ID</label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="User UUID..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Restriction Type</label>
              <select
                value={targetRestrictionType}
                onChange={(e) => setTargetRestrictionType(e.target.value as AccountRestrictionType)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              >
                {Object.values(AccountRestrictionType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Reason</label>
              <textarea
                value={restrictionReason}
                onChange={(e) => setRestrictionReason(e.target.value)}
                placeholder="State policy violation or reason..."
                style={{ width: '100%', height: '70px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowRestrictModal(false)}
                style={{ padding: '8px 16px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRestriction}
                disabled={isRestricting || !targetUserId || !restrictionReason}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: isRestricting || !targetUserId || !restrictionReason ? 'not-allowed' : 'pointer',
                }}
              >
                {isRestricting ? 'Applying...' : 'Impose'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVIDENCE PREVIEW MODAL */}
      {previewEvidence && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '550px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>{previewEvidence.title}</h3>
            <p style={{ color: '#4B5563', fontSize: '14px', marginBottom: '16px' }}>{previewEvidence.description || 'Supporting documentation attachment'}</p>
            <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>Filename:</strong> {previewEvidence.attachmentJson?.filename}</div>
              <div><strong>MIME Type:</strong> {previewEvidence.attachmentJson?.mimeType}</div>
              <div><strong>File Size:</strong> {(previewEvidence.attachmentJson?.fileSizeBytes / 1024).toFixed(1)} KB</div>
              <div><strong>SHA-256:</strong> <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{previewEvidence.attachmentJson?.sha256Checksum}</span></div>
            </div>
            <button
              onClick={() => setPreviewEvidence(null)}
              style={{ padding: '8px 16px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer', float: 'right' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
