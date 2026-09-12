import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const CertificationManagementView: React.FC = () => {
  const {
    certifications,
    metrics,
    navigate,
    setSelectedCertId,
    verifyCertification,
    renewCertification,
    openConfirmDialog,
  } = useWorkforce();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expiring' | 'expired' | 'pending'>('all');
  const [issuerFilter, setIssuerFilter] = useState('all');

  const issuers = [
    'all',
    'American Welding Society',
    'US Dept of Labor / OSHA',
    'NCCCO',
    'NABCEP',
    'FMCSA',
    'ASNT',
  ];

  const filteredCerts = useMemo(() => {
    return certifications.filter((cert) => {
      if (statusFilter !== 'all' && cert.status !== statusFilter) return false;
      if (issuerFilter !== 'all' && !cert.issuingOrganization.includes(issuerFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cert.certificationName.toLowerCase().includes(q);
        const matchesWorker = cert.workerName.toLowerCase().includes(q);
        const matchesId = cert.id.toLowerCase().includes(q);
        const matchesWorkerId = cert.workerId.toLowerCase().includes(q);
        const matchesIssuer = cert.issuingOrganization.toLowerCase().includes(q);
        const matchesCred = cert.credentialNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesWorker && !matchesId && !matchesWorkerId && !matchesIssuer && !matchesCred) {
          return false;
        }
      }
      return true;
    });
  }, [certifications, statusFilter, issuerFilter, searchQuery]);

  const handleRenewPrompt = (certId: string, certName: string) => {
    openConfirmDialog({
      title: `Renew Credential ${certName}?`,
      description: `This will log a 3-year extension for credential ${certId} and mark its status as Valid.`,
      confirmLabel: 'Confirm 3-Year Renewal',
      onConfirm: () => {
        renewCertification(certId, '2029-09-09');
      },
    });
  };

  const handleVerifyDirect = (certId: string, certName: string) => {
    verifyCertification(certId, 'Direct approval from Certification Management console.');
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Action Header */}
      <div className="px-space-md pt-space-md pb-space-xs flex flex-col gap-space-sm">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">
              Certification Management
            </h1>
            <p className="font-body-sm text-body-sm text-secondary">
              Track regulatory licenses, verify uploaded credentials, and mitigate expiration risks.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('cert-verify')}
              className="h-[38px] px-space-sm bg-surface-container text-primary rounded-xl font-label-md text-label-md flex items-center gap-space-2xs shadow-xs hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>Verify Queue ({metrics.urgentVerificationQueue})</span>
            </button>
            <button
              onClick={() => navigate('add-cert')}
              className="h-[38px] px-space-sm bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center gap-space-2xs shadow-sm hover:bg-primary-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Certification</span>
            </button>
          </div>
        </div>

        {/* 5-Tile KPI Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-xs mt-space-2xs">
          {/* Total */}
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col justify-between cursor-pointer transition-colors ${
              statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:border-primary/40'
            }`}
          >
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Cert Records</span>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface tabular-nums">
                {metrics.totalCertifications.toLocaleString()}
              </div>
              <span className="text-[11px] font-body-sm text-secondary">Total Records</span>
            </div>
          </div>

          {/* Valid */}
          <div
            onClick={() => setStatusFilter('valid')}
            className={`p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col justify-between cursor-pointer transition-colors ${
              statusFilter === 'valid' ? 'ring-2 ring-tertiary' : 'hover:border-tertiary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Valid</span>
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-tertiary font-bold tabular-nums">
                {metrics.validCertifications.toLocaleString()}
              </div>
              <span className="text-[11px] font-body-sm text-secondary">89.8% Active</span>
            </div>
          </div>

          {/* Expiring Soon */}
          <div
            onClick={() => setStatusFilter('expiring')}
            className={`p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col justify-between cursor-pointer transition-colors ${
              statusFilter === 'expiring' ? 'ring-2 ring-error' : 'hover:border-error/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-semibold">Expiring Soon</span>
              <span className="material-symbols-outlined text-[16px] text-error">warning</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-error font-bold tabular-nums">
                {metrics.expiringCertifications}
              </div>
              <span className="text-[11px] font-body-sm text-error font-medium">&lt; 30 Calendar Days</span>
            </div>
          </div>

          {/* Expired */}
          <div
            onClick={() => setStatusFilter('expired')}
            className={`p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col justify-between cursor-pointer transition-colors ${
              statusFilter === 'expired' ? 'ring-2 ring-outline' : 'hover:border-outline'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Expired</span>
              <span className="w-2 h-2 rounded-full bg-error"></span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-on-surface font-bold tabular-nums">
                {metrics.expiredCertifications}
              </div>
              <span className="text-[11px] font-body-sm text-secondary">Stand-down</span>
            </div>
          </div>

          {/* Pending Verification */}
          <div
            onClick={() => setStatusFilter('pending')}
            className={`p-space-sm rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col justify-between cursor-pointer transition-colors ${
              statusFilter === 'pending' ? 'ring-2 ring-primary' : 'hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">Pending Review</span>
              <span className="material-symbols-outlined text-[16px] text-primary">pending_actions</span>
            </div>
            <div className="mt-space-xs">
              <div className="font-headline-lg text-headline-lg text-primary font-bold tabular-nums">
                {metrics.pendingCertifications}
              </div>
              <span className="text-[11px] font-body-sm text-primary">In Audit Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-space-md flex flex-col gap-space-xs mt-space-xs">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certification title, worker name, license number, or issuing body..."
            className="w-full h-11 pl-10 pr-10 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl outline-none border border-surface-container-high focus:border-primary transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm border-none outline-none"
            >
              <option value="all">Status: All Records</option>
              <option value="valid">Status: Valid</option>
              <option value="expiring">Status: Expiring Soon</option>
              <option value="expired">Status: Expired</option>
              <option value="pending">Status: Pending Verification</option>
            </select>

            <select
              value={issuerFilter}
              onChange={(e) => setIssuerFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm border-none outline-none"
            >
              <option value="all">Issuing Organization: All</option>
              {issuers.filter((i) => i !== 'all').map((iss) => (
                <option key={iss} value={iss}>
                  {iss}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all' || issuerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setIssuerFilter('all');
              }}
              className="text-primary font-label-sm text-label-sm hover:underline shrink-0"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Certifications Table / Grid */}
      <div className="px-space-md mt-space-sm space-y-3">
        {filteredCerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl text-center space-y-2 border border-surface-container-high shadow-sm">
            <span className="material-symbols-outlined text-[32px] text-outline">workspace_premium</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">No Certifications Match Criteria</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              Try adjusting your search terms, status selector, or issuing authority filter.
            </p>
          </div>
        ) : (
          filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={cert.workerAvatar}
                    alt={cert.workerName}
                    className="w-10 h-10 rounded-xl object-cover bg-surface-container shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                        {cert.certificationName}
                      </span>
                      <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                        {cert.credentialNumber}
                      </span>
                    </div>
                    <span className="font-body-sm text-[12px] text-primary font-medium mt-0.5">
                      Worker: {cert.workerName} ({cert.workerId}) • {cert.cooperativeName}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-label-sm font-semibold shrink-0 ${
                    cert.status === 'valid'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : cert.status === 'expiring'
                      ? 'bg-error text-on-error font-bold animate-pulse'
                      : cert.status === 'pending'
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {cert.status === 'expiring'
                    ? 'Expiring in 8 Days'
                    : cert.status === 'pending'
                    ? 'Pending Verification'
                    : cert.status.toUpperCase()}
                </span>
              </div>

              {/* Credential Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-container-low text-[12px] font-body-sm text-on-surface">
                <div>
                  <span className="text-secondary">Issuing Body:</span> {cert.issuingOrganization}
                </div>
                <div>
                  <span className="text-secondary">Issue Date:</span> {cert.issueDate}
                </div>
                <div>
                  <span className="text-secondary">Expiry Date:</span>{' '}
                  <strong className={cert.status === 'expiring' ? 'text-error' : 'text-on-surface'}>
                    {cert.expiryDate}
                  </strong>
                </div>
              </div>

              {/* Row Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-surface-container-low">
                <button
                  onClick={() => {
                    setSelectedCertId(cert.id);
                    navigate('cert-details', cert.id);
                  }}
                  className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline"
                >
                  <span>Dossier & Document</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>

                <div className="flex items-center gap-2">
                  {cert.status === 'pending' && (
                    <button
                      onClick={() => handleVerifyDirect(cert.id, cert.certificationName)}
                      className="px-3 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>Verify Now</span>
                    </button>
                  )}

                  {(cert.status === 'expiring' || cert.status === 'expired') && (
                    <button
                      onClick={() => handleRenewPrompt(cert.id, cert.certificationName)}
                      className="px-3 py-1 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Renew License
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedCertId(cert.id);
                      navigate('edit-cert', cert.id);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-surface-container text-secondary font-label-sm text-label-sm hover:text-on-surface transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
