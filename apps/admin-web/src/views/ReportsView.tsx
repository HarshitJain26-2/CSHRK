import React, { useState } from 'react';
import { useWorkforce } from '../context/WorkforceContext';

export const ReportsView: React.FC = () => {
  const { reports, generateReport, cooperatives, metrics, addToast } = useWorkforce();

  const [selectedCategory, setSelectedCategory] = useState('Regulatory & Governance');
  const [dateRange, setDateRange] = useState('Q3 2026 (Current)');
  const [selectedCoop, setSelectedCoop] = useState('All');
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV' | 'Excel'>('PDF');

  const handleGenerate = () => {
    const titles: Record<string, string> = {
      'Regulatory & Governance': 'Workforce Regulatory & Safety Compliance Audit',
      'Skills & Capabilities': 'Workforce Skills Deficit & Gap Analysis',
      Certifications: '30-60-90 Day Credential Expiration Risk Register',
      Operations: 'Federation Member Headcount & Shift Utilization Matrix',
    };
    generateReport(selectedCategory, titles[selectedCategory] || 'Custom Workforce Telemetry Report', exportFormat);
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="px-space-md pt-space-md pb-space-sm">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Workforce Analytics & Reporting Center
        </h1>
        <p className="font-body-sm text-body-sm text-secondary mt-0.5">
          Generate regulatory compliance filings, skill deficit audits, and credential expiration forecasts.
        </p>
      </div>

      {/* Report Generator Controls Card */}
      <div className="px-space-md py-space-xs">
        <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">Report Generation Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-sm">
            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Report Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant outline-none"
              >
                <option value="Regulatory & Governance">Regulatory & Compliance</option>
                <option value="Skills & Capabilities">Skills & Gap Analysis</option>
                <option value="Certifications">Credential Expirations</option>
                <option value="Operations">Operations & Utilization</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Timeframe Scope</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant outline-none"
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Q3 2026 (Current)">Q3 2026 (Current)</option>
                <option value="Year-to-Date 2026">Year-to-Date 2026</option>
                <option value="Fiscal 2025-2026">Annual Federation Run</option>
              </select>
            </div>

            {/* Cooperative Filter */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Cooperative Filter</label>
              <select
                value={selectedCoop}
                onChange={(e) => setSelectedCoop(e.target.value)}
                className="h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-outline-variant outline-none"
              >
                <option value="All">All 18 Cooperatives</option>
                {cooperatives.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Format */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Export File Format</label>
              <div className="flex items-center gap-1.5 h-10">
                {(['PDF', 'CSV', 'Excel'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`flex-1 h-full rounded-lg font-label-sm text-label-sm font-semibold transition-colors ${
                      exportFormat === fmt
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-secondary hover:bg-surface-container border border-surface-container-high'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-container-low">
            <span className="text-[12px] font-body-sm text-secondary">
              Includes {metrics.totalWorkforce.toLocaleString()} active member records across {metrics.totalCooperatives} societies.
            </span>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Generate & Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Preview Strip */}
      <div className="px-space-md py-space-xs grid grid-cols-1 md:grid-cols-3 gap-space-sm">
        {/* Compliance Gauge */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase text-secondary">Federation Compliance</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-tertiary font-bold">
            {metrics.avgComplianceRate}%
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-tertiary rounded-full" style={{ width: `${metrics.avgComplianceRate}%` }}></div>
          </div>
          <span className="text-[11px] font-body-sm text-secondary block pt-1">
            Zero labor infractions recorded in Q3 2026.
          </span>
        </div>

        {/* Expiration Risk Gauge */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase text-error font-semibold">30-Day Expiration Horizon</span>
            <span className="material-symbols-outlined text-[18px] text-error">warning</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-error font-bold">
            {metrics.expiringCertifications} Records
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-error rounded-full" style={{ width: '15%' }}></div>
          </div>
          <span className="text-[11px] font-body-sm text-secondary block pt-1">
            20 already assigned to supervisor renewal practicals.
          </span>
        </div>

        {/* Skills Saturation */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase text-secondary">Workforce Skills Coverage</span>
            <span className="material-symbols-outlined text-[18px] text-primary">psychology</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-primary font-bold">
            95.3%
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '95.3%' }}></div>
          </div>
          <span className="text-[11px] font-body-sm text-secondary block pt-1">
            2,710 active members mapped to verified rubrics.
          </span>
        </div>
      </div>

      {/* Recent Generated Reports Table */}
      <div className="px-space-md mt-space-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface">Generated Reports Archive</span>
          <span className="text-[11px] font-code-sm text-secondary">Automatic daily synchronization</span>
        </div>

        <div className="space-y-2">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">
                    {rep.format === 'PDF' ? 'picture_as_pdf' : rep.format === 'CSV' ? 'table_view' : 'table_chart'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      {rep.title}
                    </span>
                    <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                      {rep.format}
                    </span>
                  </div>
                  <p className="font-body-sm text-[12px] text-secondary mt-0.5 line-clamp-1">
                    {rep.summary}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-code-sm text-outline mt-1">
                    <span>Generated: {rep.generatedDate}</span>
                    <span>•</span>
                    <span>Size: {rep.fileSize}</span>
                    <span>•</span>
                    <span>{rep.recordCount.toLocaleString()} Records Audited</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-container-low">
                <button
                  onClick={() => {
                    addToast('success', 'Download Started', `Downloading ${rep.title} (${rep.format}).`);
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-label-md text-label-md transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
