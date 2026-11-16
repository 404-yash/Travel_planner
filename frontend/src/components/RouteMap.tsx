import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteDto } from '../types';

interface Props {
  route?: RouteDto | null;
  coordinates: Record<string, [number, number]>;
}

export const RouteMap: React.FC<Props> = ({ route, coordinates }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map centered on Central India
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([22.5, 78.9], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      layersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layers = layersRef.current;
    if (!layers || !map) return;

    try {
      map.invalidateSize();
    } catch (_) {}

    layers.clearLayers();

    // Collect all cities on the active route
    const activeCities = new Set<string>();
    if (route && route.legs) {
      activeCities.add(route.origin);
      activeCities.add(route.destination);
      route.legs.forEach(l => {
        activeCities.add(l.from);
        activeCities.add(l.to);
      });
    }

    // 1. Draw base city markers
    Object.entries(coordinates).forEach(([city, [lat, lon]]) => {
      const isOrigin = route?.origin === city;
      const isDestination = route?.destination === city;
      const isVia = activeCities.has(city) && !isOrigin && !isDestination;

      let markerColor = '#94a3b8'; // slate-400
      let radius = 4;
      let fillOpacity = 0.6;

      if (isOrigin) {
        markerColor = '#16a34a'; // green
        radius = 9;
        fillOpacity = 1;
      } else if (isDestination) {
        markerColor = '#dc2626'; // red
        radius = 9;
        fillOpacity = 1;
      } else if (isVia) {
        markerColor = '#2563eb'; // blue
        radius = 7;
        fillOpacity = 1;
      }

      const circle = L.circleMarker([lat, lon], {
        radius,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity,
      });

      // City label tooltip
      if (isOrigin || isDestination || isVia) {
        circle.bindTooltip(`<strong>${city}</strong>${isOrigin ? ' (Origin)' : isDestination ? ' (Destination)' : ' (Transfer)'}`, {
          permanent: true,
          direction: 'top',
          offset: [0, -8],
          className: 'city-tooltip',
        });
      } else {
        circle.bindTooltip(city);
      }

      layers.addLayer(circle);
    });

    // 2. Draw route polylines
    if (route && route.legs && route.legs.length > 0) {
      const bounds: [number, number][] = [];

      route.legs.forEach((leg, index) => {
        const fromCoord = coordinates[leg.from];
        const toCoord = coordinates[leg.to];

        if (fromCoord && toCoord) {
          bounds.push(fromCoord);
          bounds.push(toCoord);

          let color = '#2563eb'; // train: indigo
          let dashArray = undefined;

          if (leg.mode === 'BUS') {
            color = '#f59e0b'; // bus: amber
          } else if (leg.mode === 'FLIGHT') {
            color = '#9333ea'; // flight: purple
            dashArray = '8, 8';
          }

          // Main line
          const polyline = L.polyline([fromCoord, toCoord], {
            color,
            weight: 5,
            opacity: 0.9,
            dashArray,
          }).bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
              <strong style="color: #14495e;">Leg ${index + 1}: [${leg.mode}] ${leg.operator} ${leg.name}</strong><br/>
              <span>${leg.from} → ${leg.to}</span><br/>
              <span style="color: #64748b;">Dep: ${leg.departureTime} | Arr: ${leg.arrivalTime}</span><br/>
              <strong>Fare: ₹${leg.fare} | ${Math.floor(leg.durationMin / 60)}h ${leg.durationMin % 60}m</strong>
            </div>
          `);

          layers.addLayer(polyline);

          // Add mid-point transfer badge
          if (index < route.legs.length - 1) {
            const transferCity = leg.to;
            const transferCoord = coordinates[transferCity];
            if (transferCoord) {
              const transferIcon = L.divIcon({
                className: 'transfer-badge',
                html: `<div style="background:#2563eb; color:white; border-radius:50%; width:18px; height:18px; font-size:10px; font-weight:bold; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3);">${index + 1}</div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              });
              layers.addLayer(L.marker(transferCoord, { icon: transferIcon }));
            }
          }
        }
      });

      if (bounds.length > 0) {
        try {
          map.invalidateSize();
          map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 8 });
        } catch (_) {}
      }
    }
  }, [route, coordinates]);

  return (
    <div className="relative w-full h-[360px] rounded-xl overflow-hidden shadow-md border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Legend */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs flex items-center gap-3 border border-slate-200 font-medium text-slate-700">
        <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-amber-500 rounded inline-block"></span> Bus</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-blue-600 rounded inline-block"></span> Train</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1 border-t-2 border-dashed border-purple-600 inline-block"></span> Flight</span>
      </div>

      {/* Active Route Overlay Badge */}
      {route && (
        <div className="absolute bottom-2.5 left-2.5 z-[1000] bg-slate-900/90 text-white backdrop-blur px-3 py-1.5 rounded-lg shadow-md text-xs border border-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            <strong>{route.origin} → {route.destination}</strong> ({route.modeSummary}) • ₹{route.totalFare.toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  );
};
