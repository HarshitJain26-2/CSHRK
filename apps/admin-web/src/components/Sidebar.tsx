import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'cooperatives', label: 'Cooperatives (Phase 3)' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <h1 style={styles.logoTitle}>CSHRK</h1>
        <span style={styles.badge}>ADMIN</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                ...styles.navButton,
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.userRoleBadge}>{user?.role}</div>
          <div style={styles.userEmail}>{user?.email}</div>
        </div>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    borderRight: '1px solid #1e293b',
  },
  logoContainer: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #1e293b',
  },
  logoTitle: {
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#38bdf8',
  },
  badge: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navButton: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.15s ease',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #1e293b',
    backgroundColor: '#090d16',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userRoleBadge: {
    fontSize: '11px',
    color: '#38bdf8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: '12px',
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
