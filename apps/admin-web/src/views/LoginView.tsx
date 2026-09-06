import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('dev_coop@cshrk.local');
  const [password, setPassword] = useState('DevPass123!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>CSHRK</h1>
          <p style={styles.subtitle}>Administrative Management Console</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={isLoading} style={styles.submitBtn}>
            {isLoading ? 'Authenticating...' : 'Sign In to Console'}
          </button>
        </form>

        <div style={styles.devNotice}>
          <strong>Phase 0 Demo Accounts:</strong>
          <div>Cooperative Admin: <code>dev_coop@cshrk.local</code></div>
          <div>Federation Admin: <code>dev_fed@cshrk.local</code></div>
          <div>Platform Admin: <code>dev_admin@cshrk.local</code></div>
          <div>Password: <code>DevPass123!</code></div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '36px 32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logo: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
    border: '1px solid #ef4444',
  },
  devNotice: {
    marginTop: '24px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#475569',
    lineHeight: '1.6',
    border: '1px dashed #cbd5e1',
  },
};
