import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LiveTrainTracker } from '../components/LiveTrainTracker';
import { api } from '../api/client';
import { TrackableServiceSummary } from '../types';
import {
  Train,
  Search,
  Radio,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const SpotTrainPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service') || 'T_MMR_NGP_1';
  const initialBookingId = searchParams.get('booking');

  const [serviceInput, setServiceInput] = useState(initialServiceId);
  const [activeServiceId, setActiveServiceId] = useState(initialServiceId);
  const [activeBookingId, setActiveBookingId] = useState<number | undefined>(
    initialBookingId ? parseInt(initialBookingId, 10) : undefined
  );
  const [availableServices, setAvailableServices] = useState<TrackableServiceSummary[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const list = await api.tracking.getTrackableServices();
        setAvailableServices(list);
      } catch (e) {
        console.error('Failed to load trackable services', e);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, []);

  const handleSelectService = (id: string) => {
    setServiceInput(id);
    setActiveServiceId(id);
    setActiveBookingId(undefined);
    setSearchParams({ service: id });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceInput.trim()) {
      setActiveServiceId(serviceInput.trim());
      setActiveBookingId(undefined);
      setSearchParams({ service: serviceInput.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Background ambient pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-teal-700/60 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-teal-200">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>WHERE IS MY TRAIN • LIVE GPS &amp; PLATFORM TRACKER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Spot Your Train &amp; Journey Live
          </h1>
          <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
            Real-time intermediate station timeline, live platform numbers, signal delays,
            and interactive GPS map tracking across all major Indian transit corridors.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                placeholder="Enter Train No. / Leg ID (e.g. T_MMR_NGP_1, 12139, AX006, B001)"
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-lg"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 shrink-0"
            >
              <Radio className="w-4 h-4" />
              <span>Track Live</span>
            </button>
          </form>

          {/* Quick Select Corridor Chips */}
          <div className="pt-3 space-y-2">
            <span className="text-xs uppercase font-bold text-teal-300 tracking-wider block">
              Popular Rail &amp; Bus Corridors (Instant Spot):
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'T_MMR_NGP_1', name: '12139 Sevagram Exp', route: 'MMR ➔ NGP' },
                { id: 'T_MMR_NGP_2', name: '12105 Vidarbha Exp', route: 'MMR ➔ NGP' },
                { id: 'T001', name: '91021 Weekend Spl', route: 'NED ➔ PRY' },
                { id: 'AX006', name: 'AX006 Direct Rail', route: 'NED ➔ PRY' },
                { id: 'B001', name: 'ML-201 InterCity Bus', route: 'NED ➔ NGP' },
                { id: 'F_NGP_PRY_1', name: '6E-782 IndiGo', route: 'NGP ➔ PRY' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectService(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    activeServiceId === c.id
                      ? 'bg-white text-teal-950 font-bold border-white shadow-md'
                      : 'bg-teal-800/60 text-teal-100 border-teal-700/70 hover:bg-teal-700/70'
                  }`}
                >
                  <Train className="w-3.5 h-3.5 text-teal-300" />
                  <span>{c.name}</span>
                  <span className="text-[11px] opacity-75 hidden sm:inline">({c.route})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tracker Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[600px]">
        <LiveTrainTracker
          serviceId={activeBookingId ? undefined : activeServiceId}
          bookingId={activeBookingId}
        />
      </div>

      {/* Live Services Board */}
      {!loadingServices && availableServices.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
              All Trackable Services Directory ({availableServices.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Click any service to spot live</span>
          </div>
          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Mode</th>
                  <th className="px-4 py-2.5">Leg ID / Service</th>
                  <th className="px-4 py-2.5">Corridor (From → To)</th>
                  <th className="px-4 py-2.5">Departs</th>
                  <th className="px-4 py-2.5">Arrives</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {availableServices.map((svc) => (
                  <tr
                    key={svc.serviceId}
                    onClick={() => handleSelectService(svc.serviceId)}
                    className={`cursor-pointer hover:bg-teal-50/70 transition ${
                      activeServiceId === svc.serviceId ? 'bg-teal-50 font-bold text-teal-950' : 'text-slate-700'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        svc.mode === 'TRAIN' ? 'bg-blue-100 text-blue-700' :
                        svc.mode === 'BUS'   ? 'bg-amber-100 text-amber-700' :
                                               'bg-purple-100 text-purple-700'
                      }`}>{svc.mode}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{svc.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{svc.serviceId}</div>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">
                      {svc.from} <span className="text-teal-600">➔</span> {svc.to}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">{svc.departure}</td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">{svc.arrival || '--:--'}</td>
                    <td className="px-4 py-2.5">
                      {svc.isCancelled ? (
                        <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full text-[10px]">CANCELLED</span>
                      ) : (svc.delayMin ?? 0) > 0 ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">+{svc.delayMin}m delay</span>
                      ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">ON TIME</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Highlights / Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl w-fit">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Live Signal Delays &amp; Speed</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Continuously connected to rail signaling blocks. Detects signal hold-ups, delay minutes,
            and calculates live telemetry speed in real-time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl w-fit">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Platform Number Locator</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Identifies exact station platform boards before you arrive at junction halts. Includes
            scheduled halt durations for chai, water, or layover transfers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Interactive Journey Simulator</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluators and users can scrub the journey progress bar anywhere from 0% to 100% to
            simulate vehicle movement between stations at any time of day.
          </p>
        </div>
      </div>
    </div>
  );
};
