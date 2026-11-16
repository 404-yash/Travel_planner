import React from 'react';
import { RouteDto } from '../types';
import { X, ArrowRight, Clock, Leaf, ShieldAlert, ShieldCheck, Check, Award } from 'lucide-react';

interface Props {
  routes: RouteDto[];
  onClose: () => void;
  onBook: (route: RouteDto) => void;
  onRemove?: (id: string) => void;
}

export const CompareModal: React.FC<Props> = ({ routes, onClose, onBook, onRemove }) => {
  const minFare = routes.length > 0 ? Math.min(...routes.map(r => r.totalFare)) : 0;
  const minDur = routes.length > 0 ? Math.min(...routes.map(r => r.durationMin)) : 0;
  const minCo2 = routes.length > 0 ? Math.min(...routes.map(r => r.co2Kg)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-brand-700 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span>Compare Route Options</span>
              <span className="text-xs bg-brand-800 text-brand-100 px-2 py-0.5 rounded-full font-normal">
                {routes.length} selected
              </span>
            </h3>
            <p className="text-xs text-brand-100/80">Side-by-side trade-off analysis (Price, Speed, Comfort, Eco Score)</p>
          </div>
          <button onClick={onClose} className="text-brand-100 hover:text-white p-1 rounded-lg hover:bg-brand-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {routes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <p className="text-base font-semibold">No routes selected for comparison</p>
            <p className="text-xs text-slate-400">
              Check the <strong className="text-slate-600">Compare</strong> box on 2 to 4 routes on the search page to view a side-by-side breakdown.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-brand-700 text-white rounded-lg text-xs font-semibold shadow"
            >
              Back to Search
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto flex-1">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-3 font-bold text-slate-400 uppercase w-36">Metric</th>
                  {routes.map((r, i) => (
                    <th key={r.id || i} className="py-3 px-3 font-bold text-slate-800 text-sm min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <span>Option {i + 1}</span>
                        {onRemove && (
                          <button
                            onClick={() => onRemove(r.id)}
                            className="text-slate-400 hover:text-red-600 transition text-xs font-normal"
                            title="Remove from comparison"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Route Header */}
                <tr className="bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Route Path</td>
                  {routes.map(r => (
                    <td key={r.id} className="py-2.5 px-3 font-bold text-slate-800">
                      {r.origin} → {r.destination}
                    </td>
                  ))}
                </tr>

                {/* Modes */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Transport Modes</td>
                  {routes.map(r => (
                    <td key={r.id} className="py-2.5 px-3 font-semibold text-slate-700">
                      {r.modeSummary} ({r.transfers === 0 ? 'Direct' : `${r.transfers} transfers`})
                    </td>
                  ))}
                </tr>

                {/* Timings */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Departure & Arrival</td>
                  {routes.map(r => (
                    <td key={r.id} className="py-2.5 px-3 text-slate-700">
                      <div>Dep: <strong className="text-slate-800">{r.departureTime}</strong></div>
                      <div>Arr: <strong className="text-slate-800">{r.arrivalTime}</strong></div>
                    </td>
                  ))}
                </tr>

                {/* Duration */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Total Duration</td>
                  {routes.map(r => {
                    const isFastest = r.durationMin === minDur && routes.length > 1;
                    return (
                      <td key={r.id} className="py-2.5 px-3">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{Math.floor(r.durationMin / 60)}h {r.durationMin % 60}m</span>
                          {isFastest && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              ⚡ Fastest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Waiting time */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Layover Waiting</td>
                  {routes.map(r => (
                    <td key={r.id} className="py-2.5 px-3 text-slate-600">
                      {r.transfers === 0 ? 'No waiting (Direct)' : `${Math.floor(r.waitingMin / 60)}h ${r.waitingMin % 60}m across ${r.transfers} transfers`}
                    </td>
                  ))}
                </tr>

                {/* Connection Risk */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">Connection Risk</td>
                  {routes.map(r => (
                    <td key={r.id} className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.risk === 'High' ? 'bg-red-100 text-red-700' : r.risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {r.risk} risk
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Eco Score */}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">CO₂ Footprint</td>
                  {routes.map(r => {
                    const isGreenest = Math.abs(r.co2Kg - minCo2) < 0.2 && routes.length > 1;
                    return (
                      <td key={r.id} className="py-2.5 px-3">
                        <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                          <span>🌱 {r.co2Kg} kg</span>
                          {isGreenest && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              Best Eco
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Price Row */}
                <tr className="bg-brand-50/50">
                  <td className="py-3 px-3 font-bold text-slate-800 text-sm">Total Fare</td>
                  {routes.map(r => {
                    const isCheapest = r.totalFare === minFare && routes.length > 1;
                    return (
                      <td key={r.id} className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-brand-800">
                            ₹ {r.totalFare.toLocaleString('en-IN')}
                          </span>
                          {isCheapest && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                              🏆 Cheapest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Action button */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-400">Select</td>
                  {routes.map((r, i) => (
                    <td key={r.id} className="py-3 px-3">
                      <button
                        onClick={() => onBook(r)}
                        className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow transition"
                      >
                        Book Option {i + 1}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
