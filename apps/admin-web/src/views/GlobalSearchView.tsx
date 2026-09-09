import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const GlobalSearchView: React.FC = () => {
  const {
    workers,
    skills,
    certifications,
    cooperatives,
    reports,
    searchQuery,
    setSearchQuery,
    navigate,
    setSelectedWorkerId,
    setSelectedSkillId,
    setSelectedCertId,
    setSelectedCoopId,
  } = useWorkforce();

  const [entityFilter, setEntityFilter] = useState<'all' | 'workers' | 'skills' | 'certs' | 'cooperatives' | 'reports'>('all');

  const query = (searchQuery || '').toLowerCase().trim();

  const matchingWorkers = useMemo(() => {
    if (!query) return workers.slice(0, 4);
    return workers.filter((w) =>
      w.fullName.toLowerCase().includes(query) ||
      w.id.toLowerCase().includes(query) ||
      w.role.toLowerCase().includes(query) ||
      w.cooperativeName.toLowerCase().includes(query)
    );
  }, [workers, query]);

  const matchingSkills = useMemo(() => {
    if (!query) return skills.slice(0, 4);
    return skills.filter((s) =>
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
  }, [skills, query]);

  const matchingCerts = useMemo(() => {
    if (!query) return certifications.slice(0, 4);
    return certifications.filter((c) =>
      c.certificationName.toLowerCase().includes(query) ||
      c.credentialNumber.toLowerCase().includes(query) ||
      c.workerName.toLowerCase().includes(query) ||
      c.issuingOrganization.toLowerCase().includes(query)
    );
  }, [certifications, query]);

  const matchingCoops = useMemo(() => {
    if (!query) return cooperatives.slice(0, 4);
    return cooperatives.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      c.registrationNumber.toLowerCase().includes(query) ||
      c.region.toLowerCase().includes(query) ||
      c.delegateName.toLowerCase().includes(query)
    );
  }, [cooperatives, query]);

  const matchingReports = useMemo(() => {
    if (!query) return reports.slice(0, 3);
    return reports.filter((r) =>
      r.title.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query)
    );
  }, [reports, query]);

  const totalResults =
    matchingWorkers.length +
    matchingSkills.length +
    matchingCerts.length +
    matchingCoops.length +
    matchingReports.length;

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="px-space-md pt-space-md pb-space-xs space-y-3">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Global Enterprise Search
        </h1>

        {/* Omnibox Search Input */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[24px] text-primary">
            search
          </span>
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workers, IDs, competencies, certifications, cooperatives, and audit reports..."
            className="w-full h-12 pl-12 pr-10 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-2xl outline-none border border-surface-container-high focus:border-primary shadow-sm transition-colors text-[15px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Entity Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Results', count: totalResults },
            { id: 'workers', label: 'Workers', count: matchingWorkers.length },
            { id: 'skills', label: 'Skills', count: matchingSkills.length },
            { id: 'certs', label: 'Certifications', count: matchingCerts.length },
            { id: 'cooperatives', label: 'Cooperatives', count: matchingCoops.length },
            { id: 'reports', label: 'Reports', count: matchingReports.length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setEntityFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                entityFilter === item.id
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low border border-surface-container-high'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  entityFilter === item.id ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-secondary'
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Suggested Queries */}
        <div className="flex items-center gap-2 text-[12px] font-label-sm text-secondary overflow-x-auto no-scrollbar">
          <span className="text-outline uppercase tracking-wider shrink-0">Popular:</span>
          {['Carlos Mendez', 'WKR-9120', 'Robotic Welding', 'AWS D1.1', 'Apex Agro', 'OSHA Compliance'].map((suggest) => (
            <button
              key={suggest}
              onClick={() => setSearchQuery(suggest)}
              className="px-2 py-0.5 rounded-lg bg-surface-container-low text-secondary hover:text-on-surface shrink-0"
            >
              {suggest}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      <div className="p-space-md space-y-space-md">
        {totalResults === 0 ? (
          <div className="p-12 bg-surface-container-lowest rounded-2xl text-center space-y-3 border border-surface-container-high shadow-sm">
            <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">No Results Found</span>
            <p className="font-body-sm text-body-sm text-secondary max-w-sm mx-auto">
              We couldn't find any workers, skills, credentials, or cooperatives matching "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {/* Workers Results */}
            {(entityFilter === 'all' || entityFilter === 'workers') && matchingWorkers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                  <span>Workers ({matchingWorkers.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingWorkers.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => {
                        setSelectedWorkerId(w.id);
                        navigate('worker-profile', w.id);
                      }}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={w.avatar} alt={w.fullName} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                              {w.fullName}
                            </span>
                            <span className="font-code-sm text-[10px] text-secondary bg-surface-container px-1 py-0.2 rounded">
                              {w.id}
                            </span>
                          </div>
                          <span className="text-[11px] font-body-sm text-secondary truncate">
                            {w.role} • {w.cooperativeName}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Results */}
            {(entityFilter === 'all' || entityFilter === 'skills') && matchingSkills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                  <span>Skills & Competencies ({matchingSkills.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingSkills.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedSkillId(s.id);
                        navigate('skill-details', s.id);
                      }}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">psychology</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                              {s.name}
                            </span>
                            <span className="font-code-sm text-[10px] text-secondary bg-surface-container px-1 py-0.2 rounded">
                              {s.code}
                            </span>
                          </div>
                          <span className="text-[11px] font-body-sm text-secondary truncate">
                            {s.category} • {s.totalWorkers} workers mapped
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Results */}
            {(entityFilter === 'all' || entityFilter === 'certs') && matchingCerts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-primary">workspace_premium</span>
                  <span>Certifications ({matchingCerts.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingCerts.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCertId(c.id);
                        navigate('cert-details', c.id);
                      }}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            {c.certificationName}
                          </span>
                          <span className="text-[11px] font-body-sm text-secondary truncate">
                            Holder: {c.workerName} • Serial: {c.credentialNumber}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-sm font-semibold bg-tertiary-fixed text-on-tertiary-fixed shrink-0">
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cooperatives Results */}
            {(entityFilter === 'all' || entityFilter === 'cooperatives') && matchingCoops.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
                  <span>Cooperatives ({matchingCoops.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingCoops.map((coop) => (
                    <div
                      key={coop.id}
                      onClick={() => {
                        setSelectedCoopId(coop.id);
                        navigate('coop-details', coop.id);
                      }}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            {coop.name}
                          </span>
                          <span className="text-[11px] font-body-sm text-secondary truncate">
                            {coop.region} • {coop.memberCount} Members • {coop.complianceRate}% Compliance
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Results */}
            {(entityFilter === 'all' || entityFilter === 'reports') && matchingReports.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                  <span>Analytics Reports ({matchingReports.length})</span>
                </div>
                <div className="space-y-2">
                  {matchingReports.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => navigate('reports')}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">analytics</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            {r.title}
                          </span>
                          <span className="text-[11px] font-body-sm text-secondary truncate">
                            {r.category} • {r.format} • {r.fileSize}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
