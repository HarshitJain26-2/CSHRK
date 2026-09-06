import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>System Overview</h2>
        <p style={styles.subtitle}>
          Welcome to CSHRK Cooperative Administration Platform
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Current Session Role</div>
          <div style={styles.statValue}>{user?.role}</div>
          <div style={styles.statHint}>Active RBAC Context</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Platform State</div>
          <div style={styles.statValue}>Phase 0 Foundation</div>
          <div style={styles.statHint}>Core Infrastructure Live</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Backend Architecture</div>
          <div style={styles.statValue}>NestJS + PostGIS</div>
          <div style={styles.statHint}>Geographic Relational Monolith</div>
        </div>
      </div>

      <div style={styles.noticeSection}>
        <h3 style={styles.noticeHeading}>Phase 0 Foundation Active</h3>
        <p style={styles.noticeText}>
          The administrative portal currently provides role-based authentication, navigation, and API integration.
          Cooperative society registration, worker assignment, and federation capacity dashboards are scheduled for <strong>Phase 3 (Cooperative & Federation)</strong>.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px',
  },
  header: {
    marginBottom: '28px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0284c7',
    margin: '8px 0',
  },
  statHint: {
    fontSize: '12px',
    color: '#10b981',
  },
  noticeSection: {
    backgroundColor: '#f0f9ff',
    borderLeft: '4px solid #0284c7',
    padding: '20px',
    borderRadius: '6px',
  },
  noticeHeading: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: '6px',
  },
  noticeText: {
    fontSize: '14px',
    color: '#0c4a6e',
    lineHeight: '1.6',
  },
};
