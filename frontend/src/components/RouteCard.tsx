import React, { useState } from 'react';
import { RouteDto } from '../types';
import { formatDuration } from '../lib/filters';
import { Bus, Train, Plane, Clock, ShieldCheck, ShieldAlert, Leaf, ArrowRight, ChevronDown, ChevronUp, MapPin, Info, Coffee, Bed, Radio } from 'lucide-react';
import { LiveTrainTracker } from './LiveTrainTracker';

interface Props {
  route: RouteDto;
  isSelected: boolean;
  onSelect: () => void;
  onBook: () => void;
  isCompared: boolean;
  onToggleCompare: () => void;
  passengers?: number;
}

export const RouteCard: React.FC<Props> = React.memo(({
  route,
  isSelected,
  onSelect,
  onBook,
  isCompared,
  onToggleCompare,
  passengers = 1,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [trackingLegId, setTrackingLegId] = useState<string | null>(null);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'BUS': return <Bus className="w-4 h-4 text-amber-500" />;
      case 'TRAIN': return <Train className="w-4 h-4 text-blue-600" />;
      case 'FLIGHT': return <Plane className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
        return (
          <span className="bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Tight connection
          </span>
        );
      case 'Medium':
        return (
          <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded border border-amber-200">
            Moderate wait
          </span>
        );
      default:
        return null; // Brief: Only show risk badge when Medium or High
    }
  };

  // Check arrival day offset (+1 day, +2 days)
  const depDate = route.departureTime.split(' ')[0];
  const arrDate = route.arrivalTime.split(' ')[0];
  let dayOffset = 0;
  if (depDate && arrDate && depDate !== arrDate) {
    const d1 = new Date(depDate).getTime();
    const d2 = new Date(arrDate).getTime();
    dayOffset = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  // Why this route explanation
  const generateWhyThisRoute = () => {
    const reasons: string[] = [];
    if (route.highlights.includes('Cheapest')) reasons.push('Lowest fare');
    if (route.highlights.includes('Fastest')) reasons.push('Fastest arrival');
    if (route.transfers === 0) reasons.push('Direct connection (no vehicle changes)');
    else reasons.push(`${route.transfers} transfer${route.transfers > 1 ? 's' : ''} (${formatDuration(route.waitingMin)} total wait)`);
    if (route.highlights.some(h => h.includes('Greenest'))) reasons.push('Eco-friendly choice');
    return reasons.join(' • ');
  };

  const depTime = route.departureTime.split(' ')[1] || route.departureTime;
  const arrTime = route.arrivalTime.split(' ')[1] || route.arrivalTime;
  const unitFare = route.totalFare;
  const totalFare = unitFare * passengers;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`bg-white rounded-2xl p-4 sm:p-5 transition-all border outline-none select-none text-left ${
        isSelected
          ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md bg-brand-50/15'
          : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
      }`}
    >
      {/* Top Bar: Highlights & Risk */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {route.highlights.slice(0, 2).map((h, i) => (
            <span
              key={i}
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                h === 'Cheapest'
                  ? 'bg-emerald-100 text-emerald-800'
                  : h === 'Fastest'
                  ? 'bg-blue-100 text-blue-800'
                  : h.includes('Greenest')
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {h}
            </span>
          ))}
          {getRiskBadge(route.risk)}
        </div>

        {/* Why this route summary */}
        <span className="text-xs text-slate-500 hidden sm:inline-block truncate max-w-xs">
          {generateWhyThisRoute()}
        </span>
      </div>

      {/* Main Core Row: Times | Flow | Price */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2 border-y border-slate-100">
        {/* Left: Departure -> Arrival & Duration (col 4) */}
        <div className="md:col-span-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{depTime}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">{arrTime}</span>
            {dayOffset > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                +{dayOffset}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDuration(route.durationMin)}
            </span>
            <span>•</span>
            <span>{route.transfers === 0 ? 'Direct' : `${route.transfers} change`}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              {route.co2Kg} kg
            </span>
          </div>
        </div>

        {/* Middle: Leg sequence chips (col 5) */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-1.5 py-1">
          {route.legs.map((leg, idx) => (
            <React.Fragment key={leg.id || idx}>
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs font-medium text-slate-700">
                {getModeIcon(leg.mode)}
                <span>{leg.from}</span>
                <span className="text-slate-400 font-normal">({formatDuration(leg.durationMin)})</span>
              </span>
              {idx < route.legs.length - 1 && (
                <span className="text-xs text-slate-400 font-medium">
                  › {route.legs[idx + 1].layoverBeforeMin > 0 && `${formatDuration(route.legs[idx + 1].layoverBeforeMin)} wait ›`}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right: Fare & Booking (col 3) */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4">
          <div className="text-right">
            <div className="text-lg sm:text-2xl font-extrabold text-brand-700 tabular-nums">
              ₹ {unitFare.toLocaleString('en-IN')}
            </div>
            {passengers > 1 ? (
              <span className="text-xs text-slate-500 block">
                ₹ {totalFare.toLocaleString('en-IN')} for {passengers}
              </span>
            ) : (
              <span className="text-xs text-slate-400 block">per person</span>
            )}
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onBook();
            }}
            className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95"
          >
            Select
          </button>
        </div>
      </div>

      {/* Card Footer: Compare & Accordion Toggle */}
      <div className="flex items-center justify-between mt-3 pt-1 text-xs text-slate-600">
        <div
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
        >
          <input
            type="checkbox"
            id={`cmp-${route.id}`}
            checked={isCompared}
            onChange={() => onToggleCompare()}
            className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer"
          />
          <label htmlFor={`cmp-${route.id}`} className="cursor-pointer font-medium select-none text-xs">
            Compare
          </label>
        </div>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 transition py-1 px-2 rounded-lg hover:bg-brand-50"
        >
          <span>{expanded ? 'Hide itinerary' : 'View itinerary & tips'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Accordion: Leg-by-leg breakdown & station guides */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3" onClick={e => e.stopPropagation()}>
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Itinerary Details & Tips</h4>
          {route.legs.map((leg, idx) => {
            const buffer = leg.boardingBufferMin || (leg.mode === 'FLIGHT' ? 120 : leg.mode === 'TRAIN' ? 45 : 30);
            return (
              <div key={idx} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getModeIcon(leg.mode)}
                    <span className="font-bold text-slate-800">{leg.operator} — {leg.name}</span>
                    <span className="text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{leg.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrackingLegId(leg.id);
                      }}
                      className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      title="Spot this vehicle live on Where Is My Train tracker"
                    >
                      <Radio className="w-3 h-3 text-teal-600 animate-pulse" />
                      <span>Live Track</span>
                    </button>
                    <span className="font-bold text-slate-700">₹ {leg.fare.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-xs">From</span>
                    <span className="font-semibold text-slate-800">{leg.from}</span>
                    <span className="block text-slate-500">{leg.departureTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">To</span>
                    <span className="font-semibold text-slate-800">{leg.to}</span>
                    <span className="block text-slate-500">{leg.arrivalTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Station Arrival</span>
                    <span className="font-semibold text-brand-700">Be there {buffer}m prior</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Distance & Eco</span>
                    <span className="text-slate-700">{leg.distanceKm} km • {leg.co2Kg} kg CO₂</span>
                  </div>
                </div>

                {leg.travelTip && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{leg.travelTip}</span>
                  </div>
                )}

                {/* Layover helper for long connections (> 180 min) */}
                {idx < route.legs.length - 1 && route.legs[idx + 1].layoverBeforeMin >= 180 && (
                  <div className="bg-blue-50/70 border border-blue-200/70 rounded-lg p-2.5 text-xs text-blue-900 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-blue-800">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Long Connection at {leg.to}: {formatDuration(route.legs[idx + 1].layoverBeforeMin)} layover</span>
                    </div>
                    <p className="text-blue-700">
                      Station amenities available: Cloakroom / Luggage facility, IRCTC Executive Lounge, and refreshment stalls.
                    </p>
                    {route.legs[idx + 1].layoverBeforeMin >= 360 && (
                      <p className="flex items-center gap-1 font-medium text-blue-800">
                        <Bed className="w-3.5 h-3.5" /> Stay nearby: Retiring rooms available at Station Entrance.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Where Is My Train Live Tracker Modal */}
      {trackingLegId && (
        <LiveTrainTracker
          serviceId={trackingLegId}
          isModal
          onClose={() => setTrackingLegId(null)}
        />
      )}
    </div>
  );
});

RouteCard.displayName = 'RouteCard';
