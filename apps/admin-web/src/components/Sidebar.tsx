import React, { useState } from 'react';
import { useWorkforce, ViewType } from '../context/WorkforceContext';

export const Sidebar: React.FC = () => {
  const { currentView, navigate, verificationQueue } = useWorkforce();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as ViewType,
      label: 'Dashboard',
      icon: 'grid_view',
      matchViews: ['dashboard'],
    },
    {
      id: 'workers' as ViewType,
      label: 'Workers',
      icon: 'groups',
      matchViews: ['workers', 'worker-profile', 'worker-onboarding', 'edit-worker'],
    },
    {
      id: 'skills' as ViewType,
      label: 'Skills',
      icon: 'psychology',
      matchViews: ['skills', 'skill-details', 'add-skill', 'edit-skill'],
    },
    {
      id: 'certs' as ViewType,
      label: 'Certifications',
      icon: 'workspace_premium',
      matchViews: ['certs', 'cert-details', 'add-cert', 'edit-cert', 'cert-verify'],
      badge: verificationQueue.length > 0 ? verificationQueue.length : undefined,
    },
    {
      id: 'cooperatives' as ViewType,
      label: 'Cooperatives',
      icon: 'account_balance',
      matchViews: ['cooperatives', 'coop-details', 'coop-members', 'add-coop', 'edit-coop'],
    },
    {
      id: 'capacity' as ViewType,
      label: 'Capacity & Utilization',
      icon: 'pie_chart',
      matchViews: ['capacity'],
    },
    {
      id: 'teams' as ViewType,
      label: 'Teams & Crews',
      icon: 'diversity_3',
      matchViews: ['teams'],
    },
    {
      id: 'jobs-projects' as ViewType,
      label: 'Jobs & Projects',
      icon: 'corporate_fare',
      matchViews: ['jobs-projects'],
    },
    {
      id: 'contracts' as ViewType,
      label: 'Contracts',
      icon: 'handshake',
      matchViews: ['contracts'],
    },
    {
      id: 'federation' as ViewType,
      label: 'Federation Network',
      icon: 'hub',
      matchViews: ['federation'],
    },
    {
      id: 'marketplace' as ViewType,
      label: 'Marketplace',
      icon: 'storefront',
      matchViews: ['marketplace'],
    },
    {
      id: 'audit-log' as ViewType,
      label: 'Audit & Governance',
      icon: 'verified_user',
      matchViews: ['audit-log'],
    },
    {
      id: 'reports' as ViewType,
      label: 'Reports',
      icon: 'bar_chart',
      matchViews: ['reports'],
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

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = item.matchViews.includes(currentView);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-label-md text-label-md transition-all ${
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
                <span className="truncate flex-1 font-medium">{item.label}</span>
              )}
              {!isCollapsed && item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-error text-on-error shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
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
