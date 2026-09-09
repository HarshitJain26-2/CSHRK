import React, { useState } from 'react';
import { useWorkforce, ViewType } from '../context/WorkforceContext';

export const Sidebar: React.FC = () => {
  const { currentView, navigate, verificationQueue } = useWorkforce();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard' as ViewType, label: 'Dashboard', icon: 'grid_view' },
        { id: 'workers' as ViewType, label: 'Workers Directory', icon: 'group' },
        { id: 'worker-onboarding' as ViewType, label: 'Worker Onboarding', icon: 'person_add' },
        { id: 'worker-profile' as ViewType, label: 'Worker Profile', icon: 'badge' },
      ],
    },
    {
      title: 'Competencies & Licensing',
      items: [
        { id: 'skills' as ViewType, label: 'Skills Management', icon: 'psychology' },
        { id: 'add-skill' as ViewType, label: 'Add Skill', icon: 'add_circle' },
        { id: 'certs' as ViewType, label: 'Certifications', icon: 'workspace_premium' },
        {
          id: 'cert-verify' as ViewType,
          label: 'Verification Queue',
          icon: 'verified_user',
          badge: verificationQueue.length > 0 ? verificationQueue.length : undefined,
        },
        { id: 'add-cert' as ViewType, label: 'Add Certification', icon: 'note_add' },
      ],
    },
    {
      title: 'Federation & Societies',
      items: [
        { id: 'cooperatives' as ViewType, label: 'Cooperatives', icon: 'account_balance' },
        { id: 'coop-details' as ViewType, label: 'Cooperative Details', icon: 'corporate_fare' },
        { id: 'coop-members' as ViewType, label: 'Cooperative Members', icon: 'groups' },
        { id: 'add-coop' as ViewType, label: 'Add Cooperative', icon: 'domain_add' },
      ],
    },
    {
      title: 'Intelligence & Search',
      items: [
        { id: 'reports' as ViewType, label: 'Reports & Analytics', icon: 'analytics' },
        { id: 'global-search' as ViewType, label: 'Global Search', icon: 'manage_search' },
      ],
    },
    {
      title: 'System States & Dialogs',
      items: [
        { id: 'empty-states' as ViewType, label: 'Empty States', icon: 'inbox' },
        { id: 'loading-states' as ViewType, label: 'Loading States', icon: 'hourglass_empty' },
        { id: 'error-states' as ViewType, label: 'Error States', icon: 'error_outline' },
        { id: 'confirmation-dialogs' as ViewType, label: 'Confirmation Dialogs', icon: 'rule' },
        { id: 'success-notifications' as ViewType, label: 'Success Notifications', icon: 'campaign' },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-surface border-r border-surface-container-high shrink-0 transition-all duration-200 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ height: 'calc(100vh - 4rem)', position: 'sticky', top: '4rem' }}
    >
      {/* Sidebar Header / Collapse Toggle */}
      <div className="h-12 px-3 border-b border-surface-container-high flex items-center justify-between text-on-surface-variant bg-surface-container-low/40">
        {!isCollapsed && (
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
            Workforce Portal
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-surface-container text-secondary transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="px-2">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-label-sm uppercase tracking-wider text-outline font-semibold">
                {sec.title}
              </div>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left font-label-md text-label-md transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary font-semibold shadow-xs'
                        : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${
                        isActive ? 'text-on-primary fill-1' : 'text-secondary'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-error text-on-error shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Version */}
      {!isCollapsed && (
        <div className="p-3 border-t border-surface-container-high text-[11px] font-label-sm text-outline flex items-center justify-between bg-surface-container-low/30">
          <span>Core System v2.4</span>
          <span className="inline-flex items-center gap-1 text-tertiary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Live
          </span>
        </div>
      )}
    </aside>
  );
};
