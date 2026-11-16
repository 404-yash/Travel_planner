import React from 'react';
import { RouteDto } from '../types';
import { Bus, Train, Plane, Clock } from 'lucide-react';

interface Props {
  route: RouteDto;
}

export const TimelineBar: React.FC<Props> = ({ route }) => {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'BUS': return <Bus className="w-3.5 h-3.5" />;
      case 'TRAIN': return <Train className="w-3.5 h-3.5" />;
      case 'FLIGHT': return <Plane className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'BUS': return 'bg-amber-500 text-white border-amber-600';
      case 'TRAIN': return 'bg-sky-600 text-white border-sky-700';
      case 'FLIGHT': return 'bg-purple-600 text-white border-purple-700';
      default: return 'bg-slate-600 text-white border-slate-700';
    }
  };

  const totalMin = route.durationMin || 1;

  return (
    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-semibold text-slate-700">Journey Flow & Layovers</span>
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5" /> Total {Math.floor(route.durationMin / 60)}h {route.durationMin % 60}m
        </span>
      </div>

      {/* Visual Gantt Bar */}
      <div className="flex h-7 rounded-md overflow-hidden bg-slate-200 p-0.5 gap-0.5 shadow-inner">
        {route.legs.map((leg, idx) => {
          const legWidth = Math.max(15, (leg.durationMin / totalMin) * 100);
          const layoverWidth = leg.layoverBeforeMin > 0 ? Math.max(10, (leg.layoverBeforeMin / totalMin) * 100) : 0;

          return (
            <React.Fragment key={leg.id}>
              {leg.layoverBeforeMin > 0 && (
                <div
                  style={{ width: `${layoverWidth}%` }}
                  className="bg-slate-300 text-slate-600 text-[10px] font-medium flex items-center justify-center truncate px-1 rounded-sm border border-dashed border-slate-400"
                  title={`Wait ${Math.floor(leg.layoverBeforeMin / 60)}h ${leg.layoverBeforeMin % 60}m at ${leg.from}`}
                >
                  ⏳ {leg.layoverBeforeMin}m
                </div>
              )}
              <div
                style={{ width: `${legWidth}%` }}
                className={`${getModeColor(leg.mode)} text-[11px] font-semibold flex items-center justify-center gap-1 px-1.5 truncate rounded-sm shadow-sm transition hover:brightness-110`}
                title={`${leg.operator} ${leg.name} (${leg.from} → ${leg.to}): ${Math.floor(leg.durationMin / 60)}h ${leg.durationMin % 60}m, ₹${leg.fare}`}
              >
                {getModeIcon(leg.mode)}
                <span className="truncate">{leg.from.slice(0, 3)}→{leg.to.slice(0, 3)}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Leg Cards list */}
      <div className="mt-3 space-y-2">
        {route.legs.map((leg, idx) => (
          <div key={leg.id} className="text-xs bg-white p-2.5 rounded border border-slate-200 flex flex-col gap-1">
            {leg.layoverBeforeMin > 0 && (
              <div className="bg-amber-50 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded border border-amber-200 self-start mb-1 flex items-center gap-1">
                ⏳ Transfer layover: {Math.floor(leg.layoverBeforeMin / 60)}h {leg.layoverBeforeMin % 60}m at <strong className="font-semibold">{leg.from}</strong>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${getModeColor(leg.mode)}`}>
                  {leg.mode}
                </span>
                {leg.operator} • {leg.name} ({leg.category})
              </span>
              <span className="font-bold text-slate-800">₹ {leg.fare}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 text-[11px]">
              <span>{leg.from} <span className="font-semibold text-slate-800">{leg.departureTime}</span> → {leg.to} <span className="font-semibold text-slate-800">{leg.arrivalTime}</span></span>
              <span>{Math.floor(leg.durationMin / 60)}h {leg.durationMin % 60}m • {leg.distanceKm} km</span>
            </div>
            <div className="text-[11px] text-slate-500 italic mt-0.5">
              💡 Tip: {leg.travelTip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
