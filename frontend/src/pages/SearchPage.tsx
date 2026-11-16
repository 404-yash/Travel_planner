import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RouteDto } from '../types';
import { api } from '../api/client';
import {
  Filters,
  fromQuery,
  toQuery,
  toSearchParams,
  nextSaturday,
  toISO,
  Mode,
  SortKey,
} from '../lib/filters';
import { useRouteSearch } from '../hooks/useRouteSearch';
import { RouteCard } from '../components/RouteCard';
import { RouteSkeleton } from '../components/RouteSkeleton';
import { BookingModal } from '../components/BookingModal';
import { CompareModal } from '../components/CompareModal';
import {
  Search,
  ArrowLeftRight,
  AlertCircle,
  SlidersHorizontal,
  Bus,
  Train,
  Plane,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  Map as MapIcon,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const RouteMap = lazy(() =>
  import('../components/RouteMap').then(m => ({ default: m.RouteMap }))
);

export const SearchPage: React.FC = () => {
  const [sp, setSp] = useSearchParams();
  const filters = useMemo(() => fromQuery(sp), [sp]);

  const setFilters = useCallback(
    (patch: Partial<Filters>) => {
      setSp(toQuery({ ...filters, ...patch }), { replace: true });
    },
    [filters, setSp]
  );

  const [cities, setCities] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<Record<string, [number, number]>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Fare Calendar State
  const [fareCalendar, setFareCalendar] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Selection & Booking
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [bookingRoute, setBookingRoute] = useState<RouteDto | null>(null);

  // Search execution via hook
  const sameCity = filters.origin.toLowerCase() === filters.destination.toLowerCase();
  const searchParams = useMemo(
    () => (sameCity ? null : toSearchParams(filters)),
    [sameCity, filters]
  );

  const { routes, status, error, isStale } = useRouteSearch(searchParams, 200);

  // Fetch Cities and Coordinates once
  useEffect(() => {
    Promise.all([api.routes.getCities(), api.routes.getCoordinates()])
      .then(([c, coords]) => {
        setCities(c);
        setCoordinates(coords);
      })
      .catch(() => {});
  }, []);

  // Fetch Fare Calendar whenever origin/destination/date changes
  useEffect(() => {
    if (sameCity || !filters.origin || !filters.destination) {
      setFareCalendar([]);
      return;
    }
    setCalendarLoading(true);
    api.routes
      .getFareCalendar(filters.origin, filters.destination, filters.date, 7)
      .then(cal => setFareCalendar(cal))
      .catch(() => setFareCalendar([]))
      .finally(() => setCalendarLoading(false));
  }, [filters.origin, filters.destination, filters.date, sameCity]);

  // Keep first route selected by default when routes update
  useEffect(() => {
    if (routes.length > 0) {
      if (!selectedRouteId || !routes.some(r => r.id === selectedRouteId)) {
        setSelectedRouteId(routes[0].id);
      }
    } else {
      setSelectedRouteId(null);
    }
  }, [routes, selectedRouteId]);

  const selectedRoute = useMemo(
    () => routes.find(r => r.id === selectedRouteId) || routes[0] || null,
    [routes, selectedRouteId]
  );

  const swapCities = () => {
    setFilters({ origin: filters.destination, destination: filters.origin });
  };

  const toggleMode = (m: Mode) => {
    const active = filters.modes.includes(m);
    if (active && filters.modes.length === 1) return; // Keep at least one mode
    const nextModes = active
      ? filters.modes.filter(x => x !== m)
      : [...filters.modes, m];
    setFilters({ modes: nextModes });
  };

  // Quick Date Helpers
  const quickDates = useMemo(() => {
    const today = new Date();
    const d0 = toISO(today);
    const d1Date = new Date(today);
    d1Date.setDate(d1Date.getDate() + 1);
    const d1 = toISO(d1Date);
    const thisSat = nextSaturday(today);
    const thisSatDate = new Date(thisSat);
    thisSatDate.setDate(thisSatDate.getDate() + 1);
    const thisSun = toISO(thisSatDate);
    return [
      { label: 'Today', date: d0 },
      { label: 'Tomorrow', date: d1 },
      { label: 'This Sat', date: thisSat },
      { label: 'This Sun', date: thisSun },
    ];
  }, []);

  const popularTrips = [
    { from: 'Nanded', to: 'Prayagraj' },
    { from: 'Pune', to: 'Delhi' },
    { from: 'Mumbai', to: 'Kolkata' },
    { from: 'Bengaluru', to: 'Pune' },
    { from: 'Nagpur', to: 'Delhi' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* HERO SEARCH CARD */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Origin */}
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              From (Origin)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="Origin City"
                value={filters.origin}
                onChange={e => setFilters({ origin: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              aria-label="Swap Origin and Destination"
              onClick={swapCities}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              To (Destination)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="Destination City"
                value={filters.destination}
                onChange={e => setFilters({ destination: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Date of Travel
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                aria-label="Travel Date"
                value={filters.date}
                onChange={e => setFilters({ date: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Passengers Stepper */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Travellers
            </label>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl">
              <button
                type="button"
                onClick={() => setFilters({ passengers: Math.max(1, filters.passengers - 1) })}
                className="w-7 h-7 bg-white rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-100"
              >
                -
              </button>
              <span className="text-xs font-bold text-slate-800">
                {filters.passengers} pax
              </span>
              <button
                type="button"
                onClick={() => setFilters({ passengers: Math.min(9, filters.passengers + 1) })}
                className="w-7 h-7 bg-white rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Quick Date Chips & Filter Toggle Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Quick date:</span>
            {quickDates.map(qd => (
              <button
                key={qd.date}
                type="button"
                onClick={() => setFilters({ date: qd.date })}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  filters.date === qd.date
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {qd.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 py-1 px-3 rounded-lg hover:bg-brand-50 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide transit filters' : 'Transit modes & preferences'}</span>
          </button>
        </div>

        {/* COLLAPSIBLE ADVANCED FILTERS */}
        {showFilters && (
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Modes */}
            <div>
              <span className="font-bold text-slate-700 block mb-2">Transit Modes</span>
              <div className="flex items-center gap-2">
                {(['BUS', 'TRAIN', 'FLIGHT'] as Mode[]).map(m => {
                  const active = filters.modes.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMode(m)}
                      className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition border ${
                        active
                          ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'BUS' && <Bus className="w-3.5 h-3.5" />}
                      {m === 'TRAIN' && <Train className="w-3.5 h-3.5" />}
                      {m === 'FLIGHT' && <Plane className="w-3.5 h-3.5" />}
                      <span>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Departure Window */}
            <div>
              <span className="font-bold text-slate-700 block mb-2">Departure Window</span>
              <select
                aria-label="Departure Window"
                value={filters.window}
                onChange={e => setFilters({ window: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="ANY">Any time</option>
                <option value="MORNING">Morning (06:00 - 12:00)</option>
                <option value="AFTERNOON">Afternoon (12:00 - 17:00)</option>
                <option value="EVENING">Evening (17:00 - 21:00)</option>
                <option value="NIGHT">Night (21:00 - 06:00)</option>
              </select>
            </div>

            {/* Journey Depth / Max Legs */}
            <div>
              <span className="font-bold text-slate-700 block mb-2">Journey Scope</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilters({ maxLegs: 2 })}
                  className={`px-3 py-2 rounded-xl font-semibold border text-xs flex-1 ${
                    filters.maxLegs === 2
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Direct & 1 Change (Fastest)
                </button>
                <button
                  type="button"
                  onClick={() => setFilters({ maxLegs: 3 })}
                  className={`px-3 py-2 rounded-xl font-semibold border text-xs flex-1 ${
                    filters.maxLegs >= 3
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Include Longer Trips
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popular Trips Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold">Popular trips:</span>
          {popularTrips.map(p => (
            <button
              key={`${p.from}-${p.to}`}
              type="button"
              onClick={() => setFilters({ origin: p.from, destination: p.to })}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                filters.origin === p.from && filters.destination === p.to
                  ? 'bg-brand-50 text-brand-700 border-brand-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {p.from} › {p.to}
            </button>
          ))}
        </div>
      </section>

      {/* FARE CALENDAR HORIZONTAL RIBBON */}
      {fareCalendar.length > 0 && (
        <section className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
              <span>Fare Calendar (7-Day Sample Fares)</span>
            </span>
            <span className="text-xs text-slate-400">Click a day to view routes</span>
          </div>

          <div className="grid grid-cols-7 gap-2 overflow-x-auto">
            {fareCalendar.map(day => {
              const isSelected = filters.date === day.date;
              const dateObj = new Date(day.date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setFilters({ date: day.date })}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-500">{dayName}</span>
                  <span className="text-xs font-bold text-slate-800">{dayNum}</span>
                  {day.cheapestFare ? (
                    <span className="text-xs font-extrabold text-emerald-700 mt-1 tabular-nums">
                      ₹ {day.cheapestFare.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 mt-1">No trips</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* RANKING TABS BAR */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
          {[
            { key: 'BALANCED', label: 'Best' },
            { key: 'CHEAPEST', label: 'Cheapest' },
            { key: 'FASTEST', label: 'Fastest' },
            { key: 'GREENEST', label: 'Greenest' },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilters({ sort: tab.key as SortKey })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filters.sort === tab.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* More sorting dropdown */}
          <select
            aria-label="Additional ranking strategies"
            value={filters.sort}
            onChange={e => setFilters({ sort: e.target.value as SortKey })}
            className={`px-2 py-2 rounded-xl text-xs font-bold bg-transparent border-0 cursor-pointer text-slate-600 focus:ring-0 ${
              !['BALANCED', 'CHEAPEST', 'FASTEST', 'GREENEST'].includes(filters.sort)
                ? 'bg-white text-slate-900 shadow-xs'
                : ''
            }`}
          >
            <option value="FEWEST_TRANSFERS">Fewest transfers</option>
            <option value="WAITING_TIME">Least waiting</option>
            <option value="LOWEST_RISK">Lowest connection risk</option>
          </select>
        </div>

        {/* Mobile Map Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {routes.length} route options found
          </span>
          <button
            type="button"
            onClick={() => setShowMobileMap(!showMobileMap)}
            className="lg:hidden p-2 rounded-xl border border-slate-300 text-slate-700 bg-white font-semibold text-xs flex items-center gap-1 shadow-xs"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{showMobileMap ? 'Hide Map' : 'View Map'}</span>
          </button>
        </div>
      </section>

      {/* RESULTS GRID (CARDS + MAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Cards (col 7) */}
        <div className="lg:col-span-7 space-y-3">
          {sameCity ? (
            <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center text-amber-800 text-xs">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold">Same Origin & Destination Selected</h4>
              <p className="mt-1">Please select different origin and destination cities to search routes.</p>
            </div>
          ) : status === 'loading' && routes.length === 0 ? (
            <RouteSkeleton count={4} />
          ) : status === 'error' && routes.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-slate-600 text-xs shadow-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No matching routes found</h4>
              <p className="text-slate-500">
                Try Saturday or Sunday for direct intercity express links, or enable "Include longer journeys".
              </p>
            </div>
          ) : (
            <div
              className={`space-y-3 ${isStale ? 'opacity-60 transition-opacity duration-150' : ''}`}
              aria-live="polite"
            >
              {routes.map(r => (
                <RouteCard
                  key={r.id}
                  route={r}
                  passengers={filters.passengers}
                  isSelected={selectedRoute?.id === r.id}
                  onSelect={() => setSelectedRouteId(r.id)}
                  onBook={() => setBookingRoute(r)}
                  isCompared={comparedIds.includes(r.id)}
                  onToggleCompare={() => {
                    setComparedIds(prev =>
                      prev.includes(r.id) ? prev.filter(x => x !== r.id) : [...prev, r.id]
                    );
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map (col 5) */}
        <div className={`lg:col-span-5 ${showMobileMap ? 'block' : 'hidden lg:block'} sticky top-6`}>
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Transit Path & Network Map</h3>
                <span className="text-xs text-slate-400">
                  {selectedRoute ? `${selectedRoute.origin} to ${selectedRoute.destination}` : 'Select a route to view'}
                </span>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="h-[380px] rounded-2xl bg-slate-100 flex items-center justify-center animate-pulse text-xs text-slate-400">
                  Loading transit map...
                </div>
              }
            >
              <div className="h-[380px] rounded-2xl overflow-hidden border border-slate-200">
                <RouteMap route={selectedRoute} coordinates={coordinates} />
              </div>
            </Suspense>
          </div>
        </div>
      </div>

      {/* Floating Compare Bar */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-xs">
          <span>{comparedIds.length} routes selected for comparison</span>
          <button
            type="button"
            onClick={() => setShowCompare(true)}
            className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 rounded-xl font-bold transition"
          >
            Compare Now
          </button>
          <button
            type="button"
            onClick={() => setComparedIds([])}
            className="text-slate-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && (
        <CompareModal
          routes={routes.filter(r => comparedIds.includes(r.id))}
          onClose={() => setShowCompare(false)}
          onBook={r => {
            setShowCompare(false);
            setBookingRoute(r);
          }}
        />
      )}

      {/* Booking Modal with Stepper & Telemetry */}
      {bookingRoute && (
        <BookingModal
          route={bookingRoute}
          passengers={filters.passengers}
          onClose={() => setBookingRoute(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
