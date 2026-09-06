import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header style={styles.topbar}>
      <div style={styles.left}>
        <span style={styles.breadcrumb}>Cooperative Administration</span>
        <span style={styles.separator}>/</span>
        <span style={styles.current}>{user?.role}</span>
      </div>

      <div style={styles.right}>
        <div style={styles.statusIndicator}>
          <span style={styles.statusDot}></span>
          <span style={styles.statusText}>API Connected</span>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  breadcrumb: {
    color: '#64748b',
  },
  separator: {
    color: '#cbd5e1',
  },
  current: {
    color: '#0f172a',
    fontWeight: '600',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  statusText: {
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#334155',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
