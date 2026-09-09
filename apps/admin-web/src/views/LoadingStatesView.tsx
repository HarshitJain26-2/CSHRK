import React from 'react';

export const LoadingStatesView: React.FC = () => {
  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <div className="px-space-md pt-space-md pb-space-sm border-b border-surface-container-high bg-surface-container-low">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Loading & Skeleton States</h1>
        <p className="font-body-sm text-body-sm text-secondary">
          Design system patterns for asynchronous data fetching, shimmers, and telemetry loaders.
        </p>
      </div>

      <div className="p-space-md space-y-space-md max-w-4xl mx-auto w-full">
        {/* Section 1: KPI Skeleton Grid */}
        <div className="space-y-2">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
            1. KPI Tile Skeletons (Shimmer Loading)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-surface-container-high rounded"></div>
                  <div className="w-5 h-5 bg-surface-container-high rounded-full"></div>
                </div>
                <div className="h-7 w-16 bg-surface-container-high rounded"></div>
                <div className="h-2 w-24 bg-surface-container rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Table Rows Skeleton */}
        <div className="space-y-2">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
            2. Workforce Grid Table Row Skeletons
          </span>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-sm flex items-center justify-between gap-3 animate-pulse"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high shrink-0"></div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="h-4 w-40 bg-surface-container-high rounded"></div>
                    <div className="h-3 w-56 bg-surface-container rounded"></div>
                    <div className="h-2 w-32 bg-surface-container-low rounded"></div>
                  </div>
                </div>
                <div className="h-8 w-24 bg-surface-container-high rounded-xl shrink-0"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Profile Hero Skeleton */}
        <div className="space-y-2">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
            3. Worker Profile Hero Skeleton
          </span>
          <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high space-y-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-surface-container-high rounded"></div>
                <div className="h-3 w-64 bg-surface-container rounded"></div>
                <div className="h-3 w-32 bg-surface-container rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-xl bg-surface-container-lowest"></div>
              <div className="h-10 rounded-xl bg-surface-container-lowest"></div>
            </div>
          </div>
        </div>

        {/* Section 4: Interactive Button Loaders */}
        <div className="space-y-2">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">
            4. Async Action Button Loading States
          </span>
          <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-wrap items-center gap-3">
            <button
              disabled
              className="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 opacity-80 cursor-wait"
            >
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
              <span>Verifying Credential Hash...</span>
            </button>

            <button
              disabled
              className="h-11 px-6 rounded-xl bg-surface-container text-secondary font-label-md text-label-md flex items-center gap-2 opacity-80 cursor-wait"
            >
              <span className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></span>
              <span>Exporting Audit Data...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
