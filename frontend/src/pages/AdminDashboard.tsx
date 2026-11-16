import React, { useEffect, useState } from 'react';
import { AdminStats, AdminLeg, BookingDto } from '../types';
import { api } from '../api/client';
import { clearRouteCache } from '../hooks/useRouteSearch';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, Clock, RefreshCw, Users, CreditCard, Ticket, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [legs, setLegs] = useState<AdminLeg[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Disruption Form
  const [selectedLegId, setSelectedLegId] = useState('');
  const [action, setAction] = useState('CANCEL');
  const [delayMin, setDelayMin] = useState(60);
  const [reason, setReason] = useState('Track maintenance / operational delay');
  const [disruptLoading, setDisruptLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.admin.getStats(),
      api.admin.getLegs(),
      api.admin.getAllBookings(),
    ])
      .then(([s, l, b]) => {
        setStats(s);
        setLegs(l);
        if (l.length > 0 && !selectedLegId) setSelectedLegId(l[0].id);
        setBookings(b);
      })
      .catch(err => {
        setMsg('Error loading admin data: ' + err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin]);

  const handleDisrupt = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisruptLoading(true);
    setMsg('');

    try {
      await api.admin.disrupt({
        legId: selectedLegId,
        action,
        delayMinutes: action === 'DELAY' ? delayMin : undefined,
        description: reason,
      });
      clearRouteCache();
      setMsg(`Success: ${action} applied to service.`);
      loadData();
    } catch (err: any) {
      setMsg('Error: ' + err.message);
    } finally {
      setDisruptLoading(false);
    }
  };

  const handleReset = async () => {
    setDisruptLoading(true);
    try {
      await api.admin.disrupt({ action: 'RESTORE' });
      clearRouteCache();
      setMsg('All transit services restored to regular schedule.');
      loadData();
    } catch (err: any) {
      setMsg('Error: ' + err.message);
    } finally {
      setDisruptLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
            Operations & Fleet Control Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time transit disruption simulation and network telemetry</p>
        </div>

        <button
          onClick={loadData}
          className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
          msg.startsWith('Success') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {msg.startsWith('Success') ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          <span>{msg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Ticket className="w-4 h-4 text-brand-600" /> Bookings
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{stats?.totalBookings ?? 0}</div>
          <span className="text-[10px] text-slate-400">Total tickets issued</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Users className="w-4 h-4 text-sky-600" /> Travelers
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-2">{stats?.totalUsers ?? 0}</div>
          <span className="text-[10px] text-slate-400">Registered users</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Revenue
          </div>
          <div className="text-2xl font-extrabold text-brand-700 mt-2">₹ {stats?.totalRevenue.toLocaleString('en-IN') ?? 0}</div>
          <span className="text-[10px] text-slate-400">Gross ticket bookings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Cancelled
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">{stats?.activeCancellations ?? 0}</div>
          <span className="text-[10px] text-slate-400">Active disruptions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-600" /> Delayed
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{stats?.activeDelays ?? 0}</div>
          <span className="text-[10px] text-slate-400">Services delayed</span>
        </div>
      </div>

      {/* Disruption Control Panel & Leg Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disruption Simulator Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800">What-If Disruption Simulator</h3>
              <p className="text-[11px] text-slate-500">Inject dynamic delays or cancellations into the network graph</p>
            </div>
            <button
              onClick={handleReset}
              disabled={disruptLoading}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded transition"
            >
              Restore All
            </button>
          </div>

          <form onSubmit={handleDisrupt} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Transit Leg (Flight / Train / Bus):</label>
              <select
                value={selectedLegId}
                onChange={e => setSelectedLegId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                {legs.map(l => (
                  <option key={l.id} value={l.id}>
                    [{l.mode}] {l.operator} {l.name} ({l.from} → {l.to}) {l.isCancelled ? '❌ CANCELLED' : l.delayMin > 0 ? `⏳ +${l.delayMin}m` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Action Type:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAction('CANCEL')}
                  className={`p-2 rounded-lg font-bold border text-center transition ${
                    action === 'CANCEL' ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Cancel Service
                </button>
                <button
                  type="button"
                  onClick={() => setAction('DELAY')}
                  className={`p-2 rounded-lg font-bold border text-center transition ${
                    action === 'DELAY' ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Inject Delay
                </button>
              </div>
            </div>

            {action === 'DELAY' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delay Duration (Minutes):</label>
                <select
                  value={delayMin}
                  onChange={e => setDelayMin(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value={30}>+30 Minutes</option>
                  <option value={60}>+60 Minutes (1 Hour)</option>
                  <option value={90}>+90 Minutes (1.5 Hours)</option>
                  <option value={120}>+120 Minutes (2 Hours)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Public Announcement:</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={disruptLoading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-2.5 rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {disruptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Network Disruption'}
            </button>
          </form>
        </div>

        {/* System Bookings Overview */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800">Recent Passenger Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase">
                  <th className="py-2">Ref</th>
                  <th className="py-2">Passenger</th>
                  <th className="py-2">Route</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Fare</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 8).map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2 font-mono font-bold text-brand-700">{b.bookingRef}</td>
                    <td className="py-2 text-slate-800 font-medium">{b.passengerName}</td>
                    <td className="py-2 text-slate-600">{b.origin} → {b.destination}</td>
                    <td className="py-2 text-slate-500">{b.travelDate}</td>
                    <td className="py-2 font-bold text-slate-800">₹ {b.totalFare}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
