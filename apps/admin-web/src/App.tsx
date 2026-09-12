import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkforceProvider, useWorkforce } from './context/WorkforceContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ToastStack } from './components/ToastStack';

// Master Views (Approved Visual Reference)
import { WorkforceDashboardView } from './views/WorkforceDashboardView';
import { WorkersDirectoryView } from './views/WorkersDirectoryView';
import { WorkerOnboardingView } from './views/WorkerOnboardingView';
import { WorkerProfileView } from './views/WorkerProfileView';
import { EditWorkerView } from './views/EditWorkerView';

// Additional Views (21 Screens)
import { SkillsManagementView } from './views/SkillsManagementView';
import { SkillDetailsView } from './views/SkillDetailsView';
import { AddSkillView } from './views/AddSkillView';
import { EditSkillView } from './views/EditSkillView';

import { CertificationManagementView } from './views/CertificationManagementView';
import { CertificationDetailsView } from './views/CertificationDetailsView';
import { AddCertificationView } from './views/AddCertificationView';
import { EditCertificationView } from './views/EditCertificationView';
import { CertificationVerificationView } from './views/CertificationVerificationView';

import { CooperativesManagementView } from './views/CooperativesManagementView';
import { CooperativeDetailsView } from './views/CooperativeDetailsView';
import { CooperativeMembersView } from './views/CooperativeMembersView';
import { AddCooperativeView } from './views/AddCooperativeView';
import { EditCooperativeView } from './views/EditCooperativeView';

import { ReportsView } from './views/ReportsView';
import { GlobalSearchView } from './views/GlobalSearchView';

import { EmptyStatesView } from './views/EmptyStatesView';
import { LoadingStatesView } from './views/LoadingStatesView';
import { ErrorStatesView } from './views/ErrorStatesView';
import { ConfirmationDialogsView } from './views/ConfirmationDialogsView';
import { SuccessNotificationsView } from './views/SuccessNotificationsView';

import { LoginView } from './views/LoginView';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const { currentView } = useWorkforce();

  if (!user) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      // Master 4 Screens
      case 'dashboard':
        return <WorkforceDashboardView />;
      case 'workers':
        return <WorkersDirectoryView />;
      case 'worker-onboarding':
        return <WorkerOnboardingView />;
      case 'worker-profile':
        return <WorkerProfileView />;
      case 'edit-worker':
        return <EditWorkerView />;

      // 1-4: Skills Suite
      case 'skills':
        return <SkillsManagementView />;
      case 'skill-details':
        return <SkillDetailsView />;
      case 'add-skill':
        return <AddSkillView />;
      case 'edit-skill':
        return <EditSkillView />;

      // 5-9: Certifications Suite
      case 'certs':
        return <CertificationManagementView />;
      case 'cert-details':
        return <CertificationDetailsView />;
      case 'add-cert':
        return <AddCertificationView />;
      case 'edit-cert':
        return <EditCertificationView />;
      case 'cert-verify':
        return <CertificationVerificationView />;

      // 10-14: Cooperatives Suite
      case 'cooperatives':
        return <CooperativesManagementView />;
      case 'coop-details':
        return <CooperativeDetailsView />;
      case 'coop-members':
        return <CooperativeMembersView />;
      case 'add-coop':
        return <AddCooperativeView />;
      case 'edit-coop':
        return <EditCooperativeView />;

      // 15-16: Reports & Global Search
      case 'reports':
        return <ReportsView />;
      case 'global-search':
        return <GlobalSearchView />;

      // 17-21: State Views & Interactive Dialogs
      case 'empty-states':
        return <EmptyStatesView />;
      case 'loading-states':
        return <LoadingStatesView />;
      case 'error-states':
        return <ErrorStatesView />;
      case 'confirmation-dialogs':
        return <ConfirmationDialogsView />;
      case 'success-notifications':
        return <SuccessNotificationsView />;

      default:
        return <WorkforceDashboardView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      {/* Master Top Header */}
      <Header />

      {/* Dual Pane Layout (Sticky Sidebar on Desktop + Main Content Workspace) */}
      <div className="flex flex-1 pt-16 w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 bg-surface overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Elements */}
      <ConfirmationModal />
      <ToastStack />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WorkforceProvider>
        <MainAppContent />
      </WorkforceProvider>
    </AuthProvider>
  );
}
