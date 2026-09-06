import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { CooperativesView } from './views/CooperativesView';
import { SettingsView } from './views/SettingsView';

function AdminAppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (!user) {
    return <LoginView />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Topbar />
        <main style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'cooperatives' && <CooperativesView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminAppContent />
    </AuthProvider>
  );
}
