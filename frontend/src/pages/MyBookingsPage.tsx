import React, { useEffect, useState } from 'react';
import { BookingDto, RefundPreview } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDuration } from '../lib/filters';
import {
  Ticket,
  Download,
  XCircle,
  ArrowRight,
  Clock,
  Leaf,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel Modal with Refund Preview
  const [cancellingBooking, setCancellingBooking] = useState<BookingDto | null>(null);
  const [refundPreview, setRefundPreview] = useState<RefundPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cancelInProgress, setCancelInProgress] = useState(false);

  const loadBookings = () => {
    setLoading(true);
    api.bookings
      .getMyBookings()
      .then(setBookings)
      .catch(err => setError(err.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const openCancelModal = async (b: BookingDto) => {
    setCancellingBooking(b);
    setPreviewLoading(true);
    try {
      const preview = await api.bookings.getRefundPreview(b.id);
      setRefundPreview(preview);
    } catch (err: any) {
      setRefundPreview({
        percent: 0,
        amount: 0,
        message: err.message || 'Could not compute refund.',
        eligible: false,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancelInProgress(true);
    try {
      await api.bookings.cancel(cancellingBooking.id);
      setCancellingBooking(null);
      setRefundPreview(null);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setCancelInProgress(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <Ticket className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-bold text-lg text-slate-800">Login Required</h3>
        <p className="text-xs text-slate-500">Please sign in to view and download your travel tickets.</p>
        <Link to="/login" className="inline-block bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow transition">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Travel Bookings</h2>
          <p className="text-xs text-slate-500 mt-1">Manage booked trips, live telemetry, and cancellations</p>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition border border-brand-200"
        >
          + Plan New Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-2xl border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs">Loading your bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 space-y-3 shadow-sm">
          <Ticket className="w-12 h-12 mx-auto text-slate-300" />
          <div className="font-bold text-base text-slate-700">No active bookings found</div>
          <p className="text-xs text-slate-500">You haven't booked any journeys yet.</p>
          <Link
            to="/"
            className="inline-block bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow transition mt-2"
          >
            Search Routes Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div
              key={b.id}
              className={`bg-white rounded-3xl border p-5 sm:p-6 transition shadow-sm ${
                b.status === 'CANCELLED'
                  ? 'border-slate-200 bg-slate-50/50 opacity-75'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                    {b.bookingRef}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'CHANGED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Primary Passenger: <strong className="text-slate-800 font-semibold">{b.passengerName}</strong>
                  {b.passengers && b.passengers > 1 ? ` (${b.passengers} travellers)` : ''}
                </div>
              </div>

              {/* Route & Timings */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-1 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold block text-xs">Route & Modes</span>
                  <div className="font-bold text-base text-slate-800 flex items-center gap-1.5 mt-0.5">
                    {b.origin} <ArrowRight className="w-3.5 h-3.5 text-slate-400" /> {b.destination}
                  </div>
                  <span className="text-slate-500 block mt-0.5">
                    {b.modeSummary} • {b.transfers === 0 ? 'Direct' : `${b.transfers} transfers`}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold block text-xs">Departure</span>
                  <span className="font-bold text-slate-800 text-sm block mt-0.5">{b.departureTime}</span>
                  <span className="text-slate-500">{b.travelDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold block text-xs">Arrival & Total Time</span>
                  <span className="font-bold text-slate-800 text-sm block mt-0.5">{b.arrivalTime}</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {formatDuration(b.durationMin)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold block text-xs">Fare Paid</span>
                  <span className="text-lg font-extrabold text-brand-700 block mt-0.5 tabular-nums">
                    ₹ {b.totalFare.toLocaleString('en-IN')}
                  </span>
                  {b.refundAmount && b.refundAmount > 0 ? (
                    <span className="text-xs text-emerald-700 font-bold block">
                      Refunded: ₹ {b.refundAmount.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" /> {b.co2Kg} kg CO₂
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Booked on {b.bookedAt?.split('T')[0] || 'Recently'}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/trip/${b.id}`}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Trip</span>
                  </Link>

                  <a
                    href={api.bookings.getTicketUrl(b.id)}
                    download
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Ticket</span>
                  </a>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => openCancelModal(b)}
                      className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Trip</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CANCEL MODAL WITH REFUND PREVIEW */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Cancel Booking</h3>
              <button
                onClick={() => setCancellingBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel booking <strong>{cancellingBooking.bookingRef}</strong> ({cancellingBooking.origin} to {cancellingBooking.destination})?
            </p>

            {previewLoading ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>Calculating refund eligibility...</span>
              </div>
            ) : refundPreview ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Refund Percentage:</span>
                  <span className="font-bold text-slate-900 text-sm">{refundPreview.percent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Refund Amount:</span>
                  <span className="font-extrabold text-emerald-700 text-base">₹ {refundPreview.amount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-slate-500 pt-1 border-t border-slate-200">
                  {refundPreview.message}
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelInProgress}
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                {cancelInProgress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
