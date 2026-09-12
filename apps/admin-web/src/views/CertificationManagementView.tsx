import React, { useState, useMemo } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const CertificationManagementView: React.FC = () => {
  const { certifications, navigate, setSelectedCertId, metrics } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expiring' | 'expired' | 'pending'>('all');

  const counts = useMemo(() => {
    return {
      valid: certifications.filter((c) => c.status === 'valid').length || metrics.validCertifications,
      expiring: certifications.filter((c) => c.status === 'expiring').length || metrics.expiringCertifications,
      expired: certifications.filter((c) => c.status === 'expired').length || metrics.expiredCertifications,
      pending: certifications.filter((c) => c.status === 'pending').length || metrics.pendingCertifications,
    };
  }, [certifications, metrics]);

  const filteredCerts = useMemo(() => {
    return certifications.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.certificationName.toLowerCase().includes(q) ||
          c.workerName.toLowerCase().includes(q) ||
          c.credentialNumber.toLowerCase().includes(q) ||
          c.issuingOrganization.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [certifications, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Valid
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Expiring Soon
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Expired
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Pending Verification
          </span>
        );
    }
  };

  const handleOpenCert = (id: string) => {
    setSelectedCertId(id);
    navigate('cert-details', id);
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Certifications
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Track worker licenses, safety certificates, and verification audits.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('cert-verify')}
            className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Verify Queue ({counts.pending})</span>
          </button>
          <button
            onClick={() => navigate('add-cert')}
            className="flex items-center gap-1.5 bg-primary text-on-primary font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Certificate</span>
          </button>
        </div>
      </div>

      {/* 4 Simple Summary Cards at Top */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Valid Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'valid' ? 'all' : 'valid')}
          className={`p-4 rounded-2xl bg-surface-container-lowest border transition-all cursor-pointer ${
            statusFilter === 'valid'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20'
              : 'border-surface-container-high hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
            <span className="font-medium">Valid</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-950 tabular-nums">
            {counts.valid.toLocaleString()}
          </div>
          <div className="text-xs text-on-surface-variant mt-1">In compliance</div>
        </div>

        {/* Expiring Soon Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
          className={`p-4 rounded-2xl bg-surface-container-lowest border transition-all cursor-pointer ${
            statusFilter === 'expiring'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-surface-container-high hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
            <span className="font-medium">Expiring Soon</span>
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-950 tabular-nums">
            {counts.expiring.toLocaleString()}
          </div>
          <div className="text-xs text-on-surface-variant mt-1">Within 30 days</div>
        </div>

        {/* Expired Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}
          className={`p-4 rounded-2xl bg-surface-container-lowest border transition-all cursor-pointer ${
            statusFilter === 'expired'
              ? 'border-error ring-2 ring-error/20'
              : 'border-surface-container-high hover:border-error/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
            <span className="font-medium">Expired</span>
            <span className="w-2 h-2 rounded-full bg-error"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-error tabular-nums">
            {counts.expired.toLocaleString()}
          </div>
          <div className="text-xs text-on-surface-variant mt-1">Renewal required</div>
        </div>

        {/* Pending Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`p-4 rounded-2xl bg-surface-container-lowest border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-blue-600 ring-2 ring-blue-500/20'
              : 'border-surface-container-high hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
            <span className="font-medium">Pending Verification</span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-950 tabular-nums">
            {counts.pending.toLocaleString()}
          </div>
          <div className="text-xs text-on-surface-variant mt-1">Waiting for review</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certificates by name, worker, or credential number..."
            className="w-full h-11 pl-11 pr-10 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface placeholder:text-on-surface-variant/70 text-sm focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
          />
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium px-1">
          <span>Showing {filteredCerts.length} certificates</span>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-primary hover:underline"
            >
              Show all certificates
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              onClick={() => handleOpenCert(cert.id)}
              className="p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs hover:border-primary/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-on-surface text-base truncate">
                    {cert.certificationName}
                  </h3>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-mono">
                    {cert.credentialNumber}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Worker: <span className="font-medium text-on-surface">{cert.workerName}</span> ({cert.workerId}) • Issued by {cert.issuingOrganization}
                </p>
                <div className="text-xs text-on-surface-variant mt-1">
                  Expires: <span className="font-medium text-on-surface">{cert.expiryDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(cert.status)}
                <button
                  onClick={() => handleOpenCert(cert.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
