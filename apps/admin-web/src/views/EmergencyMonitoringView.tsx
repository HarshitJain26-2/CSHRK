import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SosStatus, SosCategory, SosPriority } from '@cshrk/types';

interface SosAlertItem {
  id: string;
  requesterId: string;
  bookingId?: string;
  cooperativeId?: string;
  category: SosCategory;
  priority: SosPriority;
  status: SosStatus;
  location: {
    type: string;
    coordinates: [number, number];
  };
  addressText?: string;
  description?: string;
  assignedResponderId?: string;
  resolutionNotes?: string;
  isLocationRedacted: boolean;
  createdAt: string;
  requester?: { fullName?: string; email: string; phone?: string };
  assignedResponder?: { fullName?: string; email: string; phone?: string };
  updates?: Array<{
    id: string;
    note: string;
    previousStatus?: string;
    newStatus?: string;
    createdAt: string;
  }>;
}

export const EmergencyMonitoringView: React.FC = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<SosAlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Responder dispatch modal
  const [selectedAlertForAssign, setSelectedAlertForAssign] = useState<SosAlertItem | null>(null);
  const [responderId, setResponderId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Status update modal
  const [selectedAlertForStatus, setSelectedAlertForStatus] = useState<SosAlertItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<SosStatus>(SosStatus.ACKNOWLEDGED);
  const [statusNote, setStatusNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const apiBase = 'http://localhost:3000/api/v1/emergency/sos';

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(apiBase, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data.data || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load SOS alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 15 seconds for real-time monitoring
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignResponder = async () => {
    if (!selectedAlertForAssign || !responderId) return;
    setIsAssigning(true);
    try {
      await axios.post(
        `${apiBase}/${selectedAlertForAssign.id}/assign`,
        { responderId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedAlertForAssign(null);
      setResponderId('');
      fetchAlerts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign responder');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAlertForStatus) return;
    setIsUpdating(true);
    try {
      await axios.patch(
        `${apiBase}/${selectedAlertForStatus.id}/status`,
        {
          status: targetStatus,
          note: statusNote,
          resolutionNotes:
            targetStatus === SosStatus.RESOLVED || targetStatus === SosStatus.FALSE_ALARM
              ? resolutionNotes
              : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedAlertForStatus(null);
      setStatusNote('');
      setResolutionNotes('');
      fetchAlerts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update emergency status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* STATUTORY DISCLAIMER BANNER */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FEF2F2',
          border: '2px solid #F87171',
          borderRadius: '10px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '24px' }}>🚨</span>
        <div>
          <strong style={{ color: '#991B1B', fontSize: '15px' }}>STATUTORY OPERATIONAL NOTICE:</strong>
          <p style={{ color: '#7F1D1D', margin: '4px 0 0 0', fontSize: '13px', lineHeight: '1.4' }}>
            CSHRK Emergency SOS is an <strong>internal operational escalation mechanism</strong> for cooperative dispatchers and safety officers.
            It is <strong>NOT</strong> an authorized replacement for public emergency response services (112, Police, Fire, or Ambulance).
            In life-threatening situations, dispatchers must immediately notify government emergency services.
          </p>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Emergency & SOS Dispatch Console
          </h1>
          <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>
            Real-time emergency escalation board, GPS coordinates telemetry, and responder deployment
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          style={{
            padding: '10px 18px',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh ({alerts.length})
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading && alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>Connecting to emergency dispatch stream...</div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '40px' }}>🛡️</span>
          <h3 style={{ margin: '12px 0 4px 0', color: '#111827' }}>No Active Emergency Alerts</h3>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>All operational districts reporting normal safety conditions.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: alert.status === SosStatus.TRIGGERED ? '#FFF5F5' : '#FFFFFF',
                borderRadius: '12px',
                border: alert.status === SosStatus.TRIGGERED ? '2px solid #EF4444' : '1px solid #E5E7EB',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {alert.status === SosStatus.TRIGGERED ? '🔴' : alert.status === SosStatus.RESOLVED ? '🟢' : '🟡'}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                      {alert.category.replace('_', ' ')}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
                      Alert #{alert.id.slice(0, 8)} • {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: alert.priority === SosPriority.CRITICAL ? '#DC2626' : '#EA580C',
                      color: '#FFFFFF',
                    }}
                  >
                    {alert.priority}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor:
                        alert.status === SosStatus.RESOLVED ? '#DEF7EC' :
                        alert.status === SosStatus.TRIGGERED ? '#FEE2E2' : '#FEF3C7',
                      color:
                        alert.status === SosStatus.RESOLVED ? '#03543F' :
                        alert.status === SosStatus.TRIGGERED ? '#991B1B' : '#92400E',
                    }}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>

              {/* Location & Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px', backgroundColor: '#F9FAFB', padding: '14px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>GPS TELEMETRY (WGS 84)</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'monospace', marginTop: '2px' }}>
                    {alert.location?.coordinates
                      ? `${alert.location.coordinates[1].toFixed(4)}° N, ${alert.location.coordinates[0].toFixed(4)}° E`
                      : 'Unavailable'}
                    {alert.isLocationRedacted && ' (Redacted Precision)'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '2px' }}>
                    {alert.addressText || 'No physical address provided'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>REQUESTER</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>
                    {alert.requester?.fullName || alert.requester?.email || 'Authenticated User'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4B5563' }}>
                    {alert.requester?.phone ? `📞 ${alert.requester.phone}` : `User ID: ${alert.requesterId.slice(0, 10)}`}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>ASSIGNED RESPONDER</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>
                    {alert.assignedResponder?.fullName || (alert.assignedResponderId ? `Responder: ${alert.assignedResponderId.slice(0, 8)}` : 'Unassigned')}
                  </div>
                  {alert.assignedResponder?.phone && (
                    <div style={{ fontSize: '12px', color: '#4B5563' }}>📞 {alert.assignedResponder.phone}</div>
                  )}
                </div>
              </div>

              {alert.description && (
                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#374151' }}>
                  <strong>Description:</strong> {alert.description}
                </div>
              )}

              {/* Timeline notes */}
              {alert.updates && alert.updates.length > 0 && (
                <div style={{ marginBottom: '16px', borderLeft: '2px solid #E5E7EB', paddingLeft: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '4px' }}>TIMELINE UPDATES:</div>
                  {alert.updates.map((u) => (
                    <div key={u.id} style={{ fontSize: '12px', color: '#4B5563', marginBottom: '2px' }}>
                      • {u.note} <span style={{ color: '#9CA3AF' }}>({new Date(u.createdAt).toLocaleTimeString()})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Operational Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedAlertForAssign(alert)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#1E40AF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  👮 Dispatch Responder
                </button>

                <button
                  onClick={() => {
                    setSelectedAlertForStatus(alert);
                    setTargetStatus(
                      alert.status === SosStatus.TRIGGERED ? SosStatus.ACKNOWLEDGED : SosStatus.RESOLVED,
                    );
                  }}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Update / Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISPATCH RESPONDER MODAL */}
      {selectedAlertForAssign && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '450px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
              Dispatch Operational Responder
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '16px' }}>
              Assign an active cooperative responder or safety officer to Emergency #{selectedAlertForAssign.id.slice(0, 8)}.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Responder User ID</label>
              <input
                type="text"
                value={responderId}
                onChange={(e) => setResponderId(e.target.value)}
                placeholder="User UUID of responder..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedAlertForAssign(null)}
                style={{ padding: '8px 16px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignResponder}
                disabled={isAssigning || !responderId}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#1E40AF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: isAssigning || !responderId ? 'not-allowed' : 'pointer',
                }}
              >
                {isAssigning ? 'Dispatching...' : 'Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {selectedAlertForStatus && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', width: '480px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
              Update Emergency Status
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Target Status</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as SosStatus)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              >
                {Object.values(SosStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Timeline Note</label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Log operational update note..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
            </div>

            {(targetStatus === SosStatus.RESOLVED || targetStatus === SosStatus.FALSE_ALARM) && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Resolution Findings</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Document resolution outcome, safety verification, and closure notes..."
                  style={{ width: '100%', height: '70px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedAlertForStatus(null)}
                style={{ padding: '8px 16px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                }}
              >
                {isUpdating ? 'Saving...' : 'Confirm Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
