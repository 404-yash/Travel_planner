import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LiveTrainStatusDto, IntermediateStationDto } from '../types';
import { api } from '../api/client';
import {
  Train,
  Bus,
  Plane,
  Clock,
  MapPin,
  Gauge,
  Navigation,
  RefreshCw,
  Sliders,
  X,
  Radio,
  CheckCircle2,
  AlertCircle,
  Map as MapIcon,
  ListFilter,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  serviceId?: string;
  bookingId?: number;
  legIndex?: number;
  onClose?: () => void;
  isModal?: boolean;
}

export const LiveTrainTracker: React.FC<Props> = ({
  serviceId,
  bookingId,
  legIndex = 0,
  onClose,
  isModal = false,
}) => {
  const [status, setStatus] = useState<LiveTrainStatusDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useSimulation, setUseSimulation] = useState(false);
  const [simulationPercent, setSimulationPercent] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'map' | 'both'>('both');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const trainMarkerRef = useRef<L.Marker | null>(null);
  const animationTimerRef = useRef<any>(null);

  const fetchLiveStatus = async (progressOverride?: number) => {
    try {
      let data: LiveTrainStatusDto;
      const prog = progressOverride !== undefined ? progressOverride / 100 : undefined;

      if (bookingId) {
        data = await api.tracking.getBookingTracking(bookingId, legIndex, prog);
      } else if (serviceId) {
        data = await api.tracking.getServiceStatus(serviceId, prog);
      } else {
        throw new Error('No service ID or booking ID provided');
      }

      setStatus(data);
      if (!useSimulation && progressOverride === undefined) {
        setSimulationPercent(Math.round(data.progressPercent));
      }
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load live tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus(useSimulation ? simulationPercent : undefined);

    const interval = setInterval(() => {
      if (!useSimulation && !isPlaying) {
        fetchLiveStatus();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [serviceId, bookingId, legIndex]);

  // Handle simulation scrubbing
  const handleProgressChange = (val: number) => {
    setSimulationPercent(val);
    setUseSimulation(true);
    fetchLiveStatus(val);
  };

  // Play simulation loop
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = setInterval(() => {
        setSimulationPercent((prev) => {
          const next = prev >= 100 ? 0 : prev + 2;
          fetchLiveStatus(next);
          return next;
        });
      }, 1000);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    }
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || (viewMode === 'timeline')) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([status?.currentLat || 21.0, status?.currentLng || 79.0], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      layersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layers = layersRef.current;
    if (!layers || !map || !status) return;

    // Invalidate size to ensure tiles properly render after modal/tab switch
    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 100);

    layers.clearLayers();

    // Plot stations
    const stationCoords: [number, number][] = [];
    status.stations.forEach((st) => {
      stationCoords.push([st.latitude, st.longitude]);

      const isPassed = st.status === 'PASSED';
      const isCurrent = st.status === 'CURRENT';

      const circle = L.circleMarker([st.latitude, st.longitude], {
        radius: isCurrent ? 8 : 5,
        fillColor: isPassed ? '#10b981' : isCurrent ? '#f59e0b' : '#64748b',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      circle.bindTooltip(
        `<div class="text-xs p-1"><strong>${st.stationName} (${st.stationCode})</strong><br/>` +
        `Arr: ${st.expectedArrival || st.scheduledArrival} | PF ${st.platformNumber}</div>`,
        { permanent: false, direction: 'top' }
      );
      layers.addLayer(circle);
    });

    // Draw route track polyline
    if (stationCoords.length > 1) {
      const trackLine = L.polyline(stationCoords, {
        color: '#0f766e',
        weight: 4,
        opacity: 0.7,
        dashArray: status.mode === 'FLIGHT' ? '6, 6' : undefined,
      });
      layers.addLayer(trackLine);
    }

    // Add Live Moving Train Marker
    if (status.currentLat && status.currentLng) {
      const vehicleEmoji = status.mode === 'FLIGHT' ? '✈️' : status.mode === 'BUS' ? '🚌' : '🚆';
      const trainIcon = L.divIcon({
        className: 'custom-train-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background-color: #0d9488; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #0f766e; color: white; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); border: 2px solid white; font-size: 17px; z-index: 10;">
              ${vehicleEmoji}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const trainMarker = L.marker([status.currentLat, status.currentLng], { icon: trainIcon });
      trainMarker.bindTooltip(
        `<strong>${status.serviceName}</strong><br/>${status.currentSpeedKmh} km/h • ${status.currentLocationDescription}`,
        { permanent: true, direction: 'top', offset: [0, -18] }
      );
      layers.addLayer(trainMarker);
      trainMarkerRef.current = trainMarker;

      map.panTo([status.currentLat, status.currentLng]);
    }
  }, [status, viewMode]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'TRAIN':
        return <Train className="w-5 h-5 text-teal-600" />;
      case 'BUS':
        return <Bus className="w-5 h-5 text-amber-600" />;
      case 'FLIGHT':
        return <Plane className="w-5 h-5 text-purple-600" />;
      default:
        return <Train className="w-5 h-5 text-teal-600" />;
    }
  };

  const content = (
    <div className="bg-slate-50 text-slate-800 flex flex-col h-full max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border border-slate-200">
      {/* Top Header Bar */}
      <div className="bg-teal-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-800/80 rounded-xl border border-teal-700">
            {status ? getModeIcon(status.mode) : <Train className="w-5 h-5 text-teal-300" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                {status ? `${status.serviceName}` : 'Live Tracker'}
              </span>
              <span className="text-xs bg-teal-700/80 text-teal-100 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {status?.operator || 'Transit'}
              </span>
            </div>
            <div className="text-xs text-teal-200 flex items-center gap-2 mt-0.5">
              <span>{status?.origin}</span>
              <ArrowRight className="w-3 h-3 text-teal-400" />
              <span>{status?.destination}</span>
              <span className="text-teal-400">•</span>
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Live Where Is My Train
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          {status && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                status.overallStatus === 'ON_TIME'
                  ? 'bg-emerald-600 text-white'
                  : status.overallStatus === 'DELAYED'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-red-600 text-white'
              }`}
            >
              {status.overallStatus === 'ON_TIME' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Right Time</span>
                </>
              ) : status.overallStatus === 'DELAYED' ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Delayed {status.delayMinutes} min</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Cancelled</span>
                </>
              )}
            </div>
          )}

          {/* Close button if in modal */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-teal-200 hover:text-white hover:bg-teal-800 rounded-lg transition"
              title="Close tracker"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-sm font-semibold">Contacting GPS Satellite &amp; Railway Signals...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600 space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={() => fetchLiveStatus()}
            className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : status ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Live Hero Banner: Current Speed + Next Station + Location */}
          <div className="bg-white border-b border-slate-200 px-5 py-4 shadow-sm space-y-3">
            {/* Multi-leg sync notice */}
            {bookingId && (
              <div className="text-xs bg-blue-50 border border-blue-200 text-blue-850 rounded-xl px-3.5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">LEG {(legIndex ?? 0) + 1}</span>
                  <span className="font-semibold text-blue-900">Tracking active vehicle for this segment ({status.origin} → {status.destination}).</span>
                </div>
                <span className="text-[11px] text-blue-700 hidden sm:inline">Each leg operates as an independent vehicle.</span>
              </div>
            )}

            {status.currentStatusHeadline && (
              <div className="text-xs font-bold text-slate-800 bg-slate-100/90 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse shrink-0" />
                <span>{status.currentStatusHeadline}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Current Speed & GPS */}
              <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {status.currentSpeedKmh}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">km/h</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-600" /> Live Telemetry
                  </span>
                </div>
              </div>

              {/* Next Station Callout (Where Is My Train Signature Banner) */}
              <div className="md:col-span-2 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-teal-800">
                    Next Halt &bull; {status.nextStation?.distanceKm || 0} km away
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      {status.nextStation?.stationName || status.destination}
                    </span>
                    <span className="text-xs bg-teal-200/80 text-teal-900 font-black px-1.5 py-0.5 rounded">
                      {status.nextStation?.stationCode || 'DEST'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {status.currentLocationDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Platform sign board badge */}
                  <div className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg border-2 border-slate-900 font-black text-center shadow">
                    <span className="text-[10px] block uppercase leading-none">Platform</span>
                    <span className="text-lg leading-tight">
                      {status.nextStation?.platformNumber || 1}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Expected Arrival</span>
                    <span className="text-sm font-black text-emerald-700 tabular-nums">
                      {status.nextStation?.expectedArrival || status.nextStation?.scheduledArrival || '--:--'}
                    </span>
                    {status.nextStation && status.nextStation.delayMinutes > 0 && (
                      <span className="text-[10px] text-amber-700 font-bold block">
                        (+{status.nextStation.delayMinutes}m delay)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Journey Progress Scrubber */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-teal-700" />
                  Journey Progress:
                </span>
                <span className="text-xs font-black text-teal-800 tabular-nums">
                  {Math.round(status.progressPercent)}%
                </span>
              </div>

              {/* Slider Scrubber */}
              <div className="flex-1 w-full flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={simulationPercent}
                  onChange={(e) => handleProgressChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition shrink-0 ${
                    isPlaying
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isPlaying ? 'Pause Auto-scrub' : 'Auto-simulate journey movement'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Simulate'}</span>
                </button>

                {useSimulation && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseSimulation(false);
                      setIsPlaying(false);
                      fetchLiveStatus();
                    }}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline shrink-0"
                  >
                    Reset to Real Clock
                  </button>
                )}
              </div>

              {/* View Switcher: Timeline / Map / Both */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === 'timeline'
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListFilter className="w-3 h-3" />
                  <span>Timeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('both')}
                  className={`hidden sm:flex px-2 py-1 rounded-lg text-xs font-bold transition items-center gap-1 ${
                    viewMode === 'both'
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    viewMode === 'map'
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3 h-3" />
                  <span>Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Split: Station Timeline & Leaflet Map */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-100">
            {/* Left: Where Is My Train Vertical Station Tracker */}
            {(viewMode === 'timeline' || viewMode === 'both') && (
              <div
                className={`${
                  viewMode === 'both' ? 'md:col-span-6 lg:col-span-5' : 'md:col-span-12'
                } overflow-y-auto p-4 space-y-1 bg-white border-r border-slate-200`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <span>Schedule &amp; Delay</span>
                  <span>Station / Platform</span>
                </div>

                {status.stations.map((st: IntermediateStationDto, index: number) => {
                  const isPassed = st.status === 'PASSED';
                  const isCurrent = st.status === 'CURRENT';
                  const isUpcoming = st.status === 'UPCOMING';

                  return (
                    <div key={st.stationCode + index} className="relative flex items-stretch gap-3 py-2.5 group">
                      {/* Left: Timings & Delay */}
                      <div className="w-28 text-right shrink-0 text-xs">
                        <div className="font-bold tabular-nums text-slate-800">
                          {st.expectedArrival || st.scheduledArrival}
                        </div>
                        {st.expectedDeparture && (
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            Dep {st.expectedDeparture}
                          </div>
                        )}
                        {st.delayMinutes > 0 ? (
                          <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded inline-block mt-0.5">
                            +{st.delayMinutes}m delay
                          </div>
                        ) : (
                          <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                            On time
                          </div>
                        )}
                      </div>

                      {/* Middle: Vertical Track Line & Node */}
                      <div className="relative flex flex-col items-center justify-center shrink-0 w-6">
                        {/* Connecting Line up */}
                        {index > 0 && (
                          <div
                            className={`absolute top-0 bottom-1/2 w-1 ${
                              isPassed || isCurrent ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                        )}
                        {/* Connecting Line down */}
                        {index < status.stations.length - 1 && (
                          <div
                            className={`absolute top-1/2 bottom-0 w-1 ${
                              isPassed ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                        )}

                        {/* Station Node Badge */}
                        <div className="relative z-10">
                          {isCurrent ? (
                            <div className="relative flex items-center justify-center">
                              <span className="absolute w-6 h-6 rounded-full bg-teal-500 opacity-40 animate-ping" />
                              <div className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] shadow border-2 border-white">
                                🚆
                              </div>
                            </div>
                          ) : isPassed ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow">
                              ✓
                            </div>
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-400 group-hover:border-teal-600 transition" />
                          )}
                        </div>
                      </div>

                      {/* Right: Station details & Platform board */}
                      <div
                        className={`flex-1 flex items-center justify-between p-2 rounded-xl border transition ${
                          isCurrent
                            ? 'bg-teal-50/90 border-teal-300 shadow-sm'
                            : isPassed
                            ? 'bg-slate-50/50 border-slate-200 text-slate-600'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-900">
                              {st.stationName}
                            </span>
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1 py-0.2 rounded">
                              {st.stationCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{st.distanceKm} km</span>
                            {st.haltMinutes > 0 && (
                              <>
                                <span>&bull;</span>
                                <span>Halt {st.haltMinutes}m</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Yellow Platform Board */}
                        <div className="bg-amber-300 border border-slate-800 text-slate-900 px-2 py-0.5 rounded text-[11px] font-black tracking-wide shrink-0 shadow-xs">
                          PF {st.platformNumber}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Right: Leaflet Interactive Map View */}
            {(viewMode === 'map' || viewMode === 'both') && (
              <div
                className={`${
                  viewMode === 'both' ? 'md:col-span-6 lg:col-span-7' : 'md:col-span-12'
                } relative h-full min-h-[360px]`}
              >
                <div ref={mapContainerRef} className="w-full h-full min-h-[360px] z-0" />
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 shadow text-xs font-semibold text-slate-700 z-10 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                  <span>Live GPS Tracking Corridor</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Where Is My Train Simulator</span>
              <span>&bull;</span>
              <span>Updated: {status.lastUpdated}</span>
            </div>
            <button
              onClick={() => fetchLiveStatus()}
              className="flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh telemetry</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl h-[90vh] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};
