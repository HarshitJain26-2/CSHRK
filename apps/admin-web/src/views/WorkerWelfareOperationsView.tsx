import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SupportRequestCategory, SupportRequestStatus } from '@cshrk/types';

interface SupportRequestItem {
  id: string;
  workerId: string;
  cooperativeId: string;
  category: SupportRequestCategory;
  status: SupportRequestStatus;
  subject: string;
  description: string;
  actionTaken?: string;
  createdAt: string;
  worker?: { fullName: string; memberId?: string };
  cooperative?: { name: string; district?: string };
  reviewedBy?: { fullName?: string; email: string };
}

interface WelfareRecordItem {
  id: string;
  workerId: string;
  cooperativeId: string;
  schemeName: string;
  amount: number;
  status: string;
  createdAt: string;
  worker?: { fullName: string };
  cooperative?: { name: string };
}

export const WorkerWelfareOperationsView: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'records'>('requests');
  const [requests, setRequests] = useState<SupportRequestItem[]>([]);
  const [welfareRecords, setWelfareRecords] = useState<WelfareRecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status update modal
  const [selectedRequest, setSelectedRequest] = useState<SupportRequestItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<SupportRequestStatus>(SupportRequestStatus.REVIEW);
  const [actionNotes, setActionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const apiBase = 'http://localhost:3000/api/v1/welfare-operations';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (activeTab === 'requests') {
        const res = await axios.get(`${apiBase}/requests`, { headers });
        setRequests(res.data.data || res.data || []);
      } else {
        const res = await axios.get(`${apiBase}/records`, { headers });
        setWelfareRecords(res.data.data || res.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load welfare records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    setIsUpdating(true);
    try {
      await axios.patch(
        `${apiBase}/requests/${selectedRequest.id}/status`,
        {
          status: targetStatus,
          actionTaken: actionNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedRequest(null);
      setActionNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update request status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Worker Welfare & Safety Operations
          </h1>
          <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>
            Primary cooperative welfare assistance, workplace incident tracking, and support requests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: '24px', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '12px 20px',
            fontWeight: activeTab === 'requests' ? '600' : '500',
            color: activeTab === 'requests' ? '#2563EB' : '#4B5563',
            borderBottom: activeTab === 'requests' ? '2px solid #2563EB' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          Support Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          style={{
            padding: '12px 20px',
            fontWeight: activeTab === 'records' ? '600' : '500',
            color: activeTab === 'records' ? '#2563EB' : '#4B5563',
            borderBottom: activeTab === 'records' ? '2px solid #2563EB' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          Welfare Fund Allocations
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>Loading records...</div>
      ) : activeTab === 'requests' ? (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Worker</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Subject</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Action Taken</th>
                <th style={{ padding: '12px 16px' }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                    No worker support requests submitted
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                      {r.worker?.fullName || r.workerId.slice(0, 8)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: r.category === SupportRequestCategory.SAFETY_ISSUE || r.category === SupportRequestCategory.WORKPLACE_INCIDENT ? '#FEE2E2' : '#E0E7FF',
                          color: r.category === SupportRequestCategory.SAFETY_ISSUE || r.category === SupportRequestCategory.WORKPLACE_INCIDENT ? '#991B1B' : '#3730A3',
                        }}
                      >
                        {r.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                      {r.subject}
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '280px', color: '#4B5563' }}>
                      {r.description}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor:
                            r.status === SupportRequestStatus.RESOLVED ? '#DEF7EC' :
                            r.status === SupportRequestStatus.SUBMITTED ? '#FEF08A' : '#DBEAFE',
                          color:
                            r.status === SupportRequestStatus.RESOLVED ? '#03543F' :
                            r.status === SupportRequestStatus.SUBMITTED ? '#713F12' : '#1E40AF',
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4B5563', fontSize: '13px' }}>
                      {r.actionTaken || 'Pending review'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => {
                          setSelectedRequest(r);
                          setTargetStatus(r.status);
                          setActionNotes(r.actionTaken || '');
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
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Worker</th>
                <th style={{ padding: '12px 16px' }}>Cooperative Society</th>
                <th style={{ padding: '12px 16px' }}>Scheme Name</th>
                <th style={{ padding: '12px 16px' }}>Fund Allocation (₹)</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {welfareRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                    No welfare scheme records available
                  </td>
                </tr>
              ) : (
                welfareRecords.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>
                      {rec.worker?.fullName || rec.workerId.slice(0, 8)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {rec.cooperative?.name || 'Primary Cooperative'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>
                      {rec.schemeName}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#059669' }}>
                      ₹{Number(rec.amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: '#DEF7EC', color: '#03543F' }}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REVIEW & ADVANCE STATUS MODAL */}
      {selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
              Manage Worker Support Request
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '14px' }}>
              <strong>Subject:</strong> {selectedRequest.subject}
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Update Status</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as SupportRequestStatus)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              >
                {Object.values(SupportRequestStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Action Taken / Cooperative Notes</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Log cooperative assistance, training schedule, safety measures, or resolution details..."
                style={{ width: '100%', height: '80px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ padding: '8px 16px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                }}
              >
                {isUpdating ? 'Saving...' : 'Save & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
