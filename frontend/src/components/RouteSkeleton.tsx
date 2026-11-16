import React from 'react';

/** Placeholder cards with the same footprint as RouteCard, so the page does not jump when results arrive. */
export const RouteSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading routes">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-5 w-20 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[0, 1, 2, 3].map(n => <div key={n} className="h-10 bg-slate-100 rounded" />)}
        </div>
        <div className="flex justify-between">
          <div className="h-7 w-32 bg-slate-100 rounded" />
          <div className="h-9 w-24 bg-slate-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);
