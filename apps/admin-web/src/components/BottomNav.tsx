import React from 'react';
import { useWorkforce, ViewType } from '../context/WorkforceContext';

export const BottomNav: React.FC = () => {
  const { currentView, navigate } = useWorkforce();

  const navItems: { id: ViewType; label: string; icon: string; matchPrefixes: string[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view', matchPrefixes: ['dashboard'] },
    { id: 'workers', label: 'Workers', icon: 'group', matchPrefixes: ['worker'] },
    { id: 'skills', label: 'Skills', icon: 'verified', matchPrefixes: ['skill'] },
    { id: 'certs', label: 'Certs', icon: 'workspace_premium', matchPrefixes: ['cert'] },
    { id: 'cooperatives', label: 'Coops', icon: 'account_balance', matchPrefixes: ['coop'] },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    return item.matchPrefixes.some((prefix) => currentView.startsWith(prefix));
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container-high shadow-[0_-1px_8px_rgba(0,0,0,0.04)] md:hidden">
      <div className="flex items-center justify-around h-16 px-space-2xs">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
                active
                  ? 'text-primary font-semibold bg-surface-container/60 shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface active:bg-surface-container'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${active ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="font-label-sm text-label-sm mt-0.5 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
