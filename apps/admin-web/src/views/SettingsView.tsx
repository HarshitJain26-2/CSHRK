import React from 'react';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
        Administrator Profile & Settings
      </h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        Session details and API configuration
      </p>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          maxWidth: '600px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ADMIN USER ID</div>
            <div style={{ fontSize: '14px', color: '#0f172a', marginTop: '4px' }}>{user?.id}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>EMAIL</div>
            <div style={{ fontSize: '14px', color: '#0f172a', marginTop: '4px' }}>{user?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ROLE CLEARANCE</div>
            <div style={{ fontSize: '14px', color: '#0284c7', fontWeight: '600', marginTop: '4px' }}>
              {user?.role}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>STATUS</div>
            <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '600', marginTop: '4px' }}>
              {user?.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
