import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TripStatusDto, RouteDto } from '../types';
import { api } from '../api/client';
import { buildIcs, whatsappLink } from '../lib/trip';
import { formatDuration } from '../lib/filters';
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Download,
  Calendar,
  Share2,
  RefreshCw,
  Bus,
  Train,
  Plane,
  MapPin,
  Coffee,
  Bed,
  CheckCircle,
  Navigation,
  Car,
  Radio,
} from 'lucide-react';
import { LiveTrainTracker } from '../components/LiveTrainTracker';

export const TripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<TripStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebooking, setRebooking] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [trackingLegId, setTrackingLegId] = useState<string | null>(null);
  const [showLiveTracker, setShowLiveTracker] = useState(true);
  const [selectedLegIndex, setSelectedLegIndex] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  // Auto-detect which leg the passenger is currently on based on IST clock
  const currentLegIndex = React.useMemo(() => {
    if (!status || !status.legs || status.legs.length === 0) return 0;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < status.legs.length; i++) {
      const leg = status.legs[i];
      const [depH, depM] = (leg.departureTime || '00:00').split(':').map(Number);
      const [arrH, arrM] = (leg.arrivalTime || '23:59').split(':').map(Number);
      const depMin = (depH || 0) * 60 + (depM || 0);
      const arrMin = (arrH || 0) * 60 + (arrM || 0);

      if (nowMin >= depMin && nowMin < arrMin) {
        return i;
      }
    }
    return 0;
  }, [status]);

  const activeLegIndex = selectedLegIndex !== null ? selectedLegIndex : currentLegIndex;

  const fetchStatus = async () => {
    if (!id) return;
    try {
      const data = await api.bookings.getStatus(parseInt(id, 10));
      setStatus(data);
      setLastRefreshed(new Date());
      setError('');
    } catch (err: any) {
      setError(err.message || 'Unable to load trip status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Poll every 30s when tab is visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    timerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    }, 30000);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [id]);

  const handleRebook = async (alt: RouteDto) => {
    if (!id || !status) return;
    setRebooking(true);
    try {
      const newBooking = await api.bookings.rebook(parseInt(id, 10), {
        legIds: alt.legs.map(l => l.id),
        origin: alt.origin,
        destination: alt.destination,
      });
      navigate(`/trip/${newBooking.id}`);
    } catch (err: any) {
      setError('Rebooking failed: ' + (err.message || 'Error occurred'));
    } finally {
      setRebooking(false);
    }
  };

  const getModeIcon = (mode?: string) => {
    switch (mode) {
      case 'BUS': return <Bus className="w-5 h-5 text-amber-500" />;
      case 'TRAIN': return <Train className="w-5 h-5 text-blue-600" />;
      case 'FLIGHT': return <Plane className="w-5 h-5 text-purple-600" />;
      default: return <Navigation className="w-5 h-5 text-slate-500" />;
    }
  };

  // Add to Calendar
  const handleDownloadCalendar = () => {
    if (!status || !status.legs.length) return;
    const tripInfo = {
      bookingRef: `REF-${id}`,
      origin: status.legs[0].from,
      destination: status.legs[status.legs.length - 1].to,
      legs: status.legs.map(l => ({
        mode: l.mode || 'TRANSIT',
        operator: l.operator || 'Carrier',
        name: l.name || l.legId,
        from: l.from,
        to: l.to,
        departureTime: l.departureTime || '',
        arrivalTime: l.arrivalTime || '',
      })),
    };
    const icsContent = buildIcs(tripInfo);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey-trip-${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getWhatsAppShareUrl = () => {
    if (!status || !status.legs.length) return '#';
    return whatsappLink({
      bookingRef: `REF-${id}`,
      origin: status.legs[0].from,
      destination: status.legs[status.legs.length - 1].to,
      legs: status.legs.map(l => ({
        mode: l.mode || 'TRANSIT',
        operator: l.operator || 'Carrier',
        name: l.name || l.legId,
        from: l.from,
        to: l.to,
        departureTime: l.departureTime || '',
        arrivalTime: l.arrivalTime || '',
      })),
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        <p className="text-sm font-medium">Connecting to live transit telemetry...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl max-w-md mx-auto text-red-700 text-xs">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-red-800">Trip Not Available</h4>
          <p className="mt-1">{error || 'Could not locate booking record.'}</p>
          <Link
            to="/my-bookings"
            className="inline-block mt-4 px-4 py-2 bg-red-700 text-white rounded-xl font-bold"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const firstLeg = status.legs[0];
  const isCancelled = status.overallState === 'CANCELLED';
  const isDelayed = status.overallState === 'DELAYED';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Bar with Live indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Trip Companion • Auto-refreshing 30s
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Trip #{id} • {firstLeg?.from} to {status.legs[status.legs.length - 1]?.to}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <a
            href={api.bookings.getTicketUrl(parseInt(id!, 10))}
            download
            className="p-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>E-Ticket</span>
          </a>
        </div>
      </div>

      {/* CANCELLATION EMERGENCY BANNER */}
      {isCancelled && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Service Disruption on Your Trip</h3>
              <p className="text-xs text-red-700 mt-1">{status.headline}</p>
            </div>
          </div>

          {/* Alternatives proposed by TripMonitor */}
          {status.alternatives.length > 0 && (
            <div className="mt-4 pt-3 border-t border-red-200/80 space-y-3">
              <span className="text-xs font-bold text-red-950 uppercase tracking-wider block">
                Recommended Live Alternatives (Instant Switch)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {status.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-red-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{alt.modeSummary}</span>
                      <span className="font-extrabold text-brand-700 text-sm">₹ {alt.totalFare.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Departs {alt.departureTime.split(' ')[1]} › Arrives {alt.arrivalTime.split(' ')[1]} ({formatDuration(alt.durationMin)})
                    </div>
                    <button
                      type="button"
                      disabled={rebooking}
                      onClick={() => handleRebook(alt)}
                      className="w-full mt-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow transition"
                    >
                      {rebooking ? 'Switching...' : 'Switch to this route'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Station Buffer & Countdown Card */}
      {firstLeg && !isCancelled && (
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div>
              <span className="text-xs text-brand-200 uppercase tracking-wider font-semibold block">Next Service</span>
              <span className="text-2xl font-black mt-1 block">
                {firstLeg.operator} {firstLeg.name}
              </span>
              <span className="text-xs text-brand-200 mt-0.5 block">
                {firstLeg.mode} • From {firstLeg.from} to {firstLeg.to}
              </span>
            </div>

            <div className="sm:border-x sm:border-brand-600 sm:px-6">
              <span className="text-xs text-brand-200 uppercase tracking-wider font-semibold block">Departure Time</span>
              <span className="text-3xl font-black tabular-nums mt-1 block">
                {firstLeg.departureTime?.split(' ')[1] || '06:00'}
              </span>
              <span className="text-xs text-brand-200 mt-0.5 block">
                {firstLeg.departureTime?.split(' ')[0]}
              </span>
            </div>

            <div>
              <span className="text-xs text-amber-300 uppercase tracking-wider font-bold block">
                Critical Station Buffer
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
                Be at station by -{firstLeg.boardingBufferMin || 45}m
              </span>
              <span className="text-xs text-brand-200 mt-0.5 block">
                Security check-in & boarding gates close early
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-600/80 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-brand-100 flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Telemetry &amp; Platform Status Active
            </span>
            <button
              type="button"
              onClick={() => setShowLiveTracker(!showLiveTracker)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-300" />
              <span>{showLiveTracker ? 'Hide Where Is My Train Tracker' : 'Show Where Is My Train Tracker'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Embedded Live Where Is My Train Tracker */}
      {id && showLiveTracker && !isCancelled && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden min-h-[500px]">
          {/* Multi-Leg Switcher Bar */}
          {status.legs.length > 1 && (
            <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Track Leg:</span>
                <div className="flex items-center gap-1.5">
                  {status.legs.map((leg, idx) => {
                    const isSelected = activeLegIndex === idx;
                    const isCurrent = currentLegIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedLegIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <span>Leg {idx + 1}: {leg.from} → {leg.to}</span>
                        {isCurrent && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            isSelected ? 'bg-emerald-400 text-teal-950' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            ACTIVE NOW
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedLegIndex !== null && selectedLegIndex !== currentLegIndex && (
                <button
                  type="button"
                  onClick={() => setSelectedLegIndex(null)}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline shrink-0"
                >
                  Reset to Current Leg ({currentLegIndex + 1})
                </button>
              )}
            </div>
          )}

          <LiveTrainTracker bookingId={parseInt(id, 10)} legIndex={activeLegIndex} />
        </div>
      )}

      {/* Leg Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Journey Legs & Telemetry</h2>
        <div className="space-y-4">
          {status.legs.map((leg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                leg.state === 'CANCELLED'
                  ? 'bg-red-50/60 border-red-200'
                  : leg.state === 'DELAYED'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getModeIcon(leg.mode)}
                  <span className="font-bold text-slate-900 text-sm">
                    {leg.operator} {leg.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTrackingLegId(leg.legId)}
                    className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-850 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Spot this vehicle live on Where Is My Train tracker"
                  >
                    <Radio className="w-3 h-3 text-teal-600 animate-pulse" />
                    <span>Spot Live</span>
                  </button>

                  {leg.state === 'ON_TIME' && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> On Time
                    </span>
                  )}
                  {leg.state === 'DELAYED' && (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" /> Delayed +{leg.delayMinutes} min
                    </span>
                  )}
                  {leg.state === 'CANCELLED' && (
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Cancelled
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block font-medium">Origin</span>
                  <span className="font-bold text-slate-800">{leg.from}</span>
                  <span className="block text-slate-500">{leg.departureTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Destination</span>
                  <span className="font-bold text-slate-800">{leg.to}</span>
                  <span className="block text-slate-500">{leg.arrivalTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gate Buffer</span>
                  <span className="font-semibold text-brand-700">
                    Arrive {leg.boardingBufferMin || 45} mins prior
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Door to Door / Station Layover Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Car className="w-4 h-4 text-brand-600" />
            <span>First & Last Mile Transport</span>
          </div>
          <p className="text-slate-600">
            Estimated auto-rickshaw or app cab fare to origin station: <strong>₹80 – ₹160</strong> (flat city estimate).
          </p>
          <p className="text-slate-500">
            Allow an extra 25 minutes for peak urban traffic during rush hours.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>Station Amenities & Cloakrooms</span>
          </div>
          <p className="text-slate-600">
            Major transit hubs feature 24/7 cloakrooms, IRCTC executive waiting halls, and mobile charging pods.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleDownloadCalendar}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add to Calendar (.ics)</span>
            </button>
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-800 font-semibold flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Where Is My Train Modal for Leg */}
      {trackingLegId && (
        <LiveTrainTracker
          serviceId={trackingLegId}
          isModal
          onClose={() => setTrackingLegId(null)}
        />
      )}
    </div>
  );
};
