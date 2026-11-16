import React, { useState, useEffect } from 'react';
import { RouteDto, BookingDto, Passenger } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { buildIcs, whatsappLink } from '../lib/trip';
import { formatDuration } from '../lib/filters';
import {
  X,
  CheckCircle,
  Download,
  Ticket,
  ArrowRight,
  Loader2,
  Calendar,
  Share2,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  Smartphone,
  Building,
  User as UserIcon,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  route: RouteDto;
  passengers?: number;
  onClose: () => void;
  onSuccess: (booking: BookingDto) => void;
}

export const BookingModal: React.FC<Props> = ({
  route,
  passengers: initialPax = 1,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [paxCount, setPaxCount] = useState(Math.max(1, Math.min(9, initialPax)));
  const [travellers, setTravellers] = useState<Passenger[]>([
    {
      name: user?.name || '',
      age: 26,
      gender: 'MALE',
      seatPreference: 'Window',
    },
  ]);
  const [contactPhone, setContactPhone] = useState('9876543210');
  const [contactEmail, setContactEmail] = useState(user?.email || 'traveler@journey.com');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [upiId, setUpiId] = useState('traveler@oksbi');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDto | null>(null);

  // Sync passengers count
  useEffect(() => {
    setTravellers(prev => {
      const next = [...prev];
      while (next.length < paxCount) {
        next.push({
          name: `Passenger ${next.length + 1}`,
          age: 25,
          gender: 'FEMALE',
          seatPreference: 'Aisle',
        });
      }
      return next.slice(0, paxCount);
    });
  }, [paxCount]);

  // Load saved traveller
  const loadSavedTraveller = () => {
    try {
      const saved = localStorage.getItem('journey_saved_traveller');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTravellers(prev => [{ ...prev[0], ...parsed }, ...prev.slice(1)]);
        if (parsed.phone) setContactPhone(parsed.phone);
        if (parsed.email) setContactEmail(parsed.email);
      }
    } catch (_) {}
  };

  const saveTravellerProfile = () => {
    try {
      localStorage.setItem(
        'journey_saved_traveller',
        JSON.stringify({
          name: travellers[0]?.name,
          age: travellers[0]?.age,
          gender: travellers[0]?.gender,
          phone: contactPhone,
          email: contactEmail,
        })
      );
    } catch (_) {}
  };

  const unitFare = route.totalFare;
  const totalFare = unitFare * paxCount;

  // Process Booking with Server Validation
  const handlePaymentAndConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      saveTravellerProfile();

      const paymentDetails =
        paymentMethod === 'CARD' ? cardNumber.replace(/\s+/g, '') : upiId;

      const booking = await api.bookings.create({
        origin: route.origin,
        destination: route.destination,
        travelDate: route.departureTime.split(' ')[0],
        passengers: paxCount,
        legIds: route.legs.map(l => l.id),
        travellers,
        passengerName: travellers[0]?.name || user?.name || 'Traveler',
        passengerEmail: contactEmail,
        contactPhone,
        paymentMethod: paymentMethod === 'CARD' ? 'CARD' : 'UPI',
        paymentDetails,
      });

      setConfirmedBooking(booking);
      onSuccess(booking);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Payment or reservation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Add to calendar ICS download
  const handleDownloadCalendar = () => {
    if (!confirmedBooking) return;
    const tripInfo = {
      bookingRef: confirmedBooking.bookingRef,
      origin: confirmedBooking.origin,
      destination: confirmedBooking.destination,
      legs: route.legs.map(l => ({
        mode: l.mode,
        operator: l.operator,
        name: l.name,
        from: l.from,
        to: l.to,
        departureTime: l.departureTime,
        arrivalTime: l.arrivalTime,
      })),
    };

    const icsContent = buildIcs(tripInfo);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey-${confirmedBooking.bookingRef}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getWhatsAppShareUrl = () => {
    if (!confirmedBooking) return '#';
    return whatsappLink({
      bookingRef: confirmedBooking.bookingRef,
      origin: confirmedBooking.origin,
      destination: confirmedBooking.destination,
      legs: route.legs.map(l => ({
        mode: l.mode,
        operator: l.operator,
        name: l.name,
        from: l.from,
        to: l.to,
        departureTime: l.departureTime,
        arrivalTime: l.arrivalTime,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-8 border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header with Steps */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              {step === 4 ? 'Trip Confirmed' : `Step ${step} of 3 • Booking Flow`}
            </span>
            <h3 className="text-xl font-bold text-slate-800">
              {step === 1 && 'Passenger Details'}
              {step === 2 && 'Review Trip & Policies'}
              {step === 3 && 'Demo Payment Authorization'}
              {step === 4 && 'Your Journey is Booked!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: TRAVELLERS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Number of Passengers</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{paxCount}</span>
                  <button
                    type="button"
                    onClick={() => setPaxCount(Math.min(9, paxCount + 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={loadSavedTraveller}
                  className="text-xs text-brand-700 hover:underline font-semibold"
                >
                  Use saved traveller info
                </button>
              </div>

              {travellers.map((traveller, idx) => (
                <div key={idx} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      Passenger {idx + 1} {idx === 0 && '(Primary Contact)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={traveller.name}
                        onChange={e => {
                          const next = [...travellers];
                          next[idx].name = e.target.value;
                          setTravellers(next);
                        }}
                        placeholder="e.g. Yash Sharma"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={traveller.age}
                        onChange={e => {
                          const next = [...travellers];
                          next[idx].age = parseInt(e.target.value, 10) || 18;
                          setTravellers(next);
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Gender</label>
                      <select
                        value={traveller.gender}
                        onChange={e => {
                          const next = [...travellers];
                          next[idx].gender = e.target.value as any;
                          setTravellers(next);
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1">Seat Preference</label>
                      <select
                        value={traveller.seatPreference}
                        onChange={e => {
                          const next = [...travellers];
                          next[idx].seatPreference = e.target.value;
                          setTravellers(next);
                        }}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Window">Window</option>
                        <option value="Aisle">Aisle</option>
                        <option value="Lower Berth">Lower Berth</option>
                        <option value="Upper Berth">Upper Berth</option>
                        <option value="No Preference">No Preference</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold">DEMO MODE: No real card or bank is charged.</span>
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-xs font-semibold">Demo</span>
              </div>

              {/* Legs summary */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">Itinerary Verification</span>
                {route.legs.map((l, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{l.mode} • {l.operator} {l.name}</span>
                      <div className="text-slate-500 text-xs">
                        {l.from} ({l.departureTime.split(' ')[1]}) › {l.to} ({l.arrivalTime.split(' ')[1]})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-brand-700 block">
                        Arrive by -{l.boardingBufferMin || 45}m
                      </span>
                      <span className="text-slate-600">₹ {l.fare.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Refund policy transparency */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Cancellation & Refund Policy</span>
                <ul className="text-slate-500 space-y-0.5 list-disc pl-4">
                  <li>48+ hours before departure: 90% refund</li>
                  <li>24 - 48 hours before departure: 75% refund</li>
                  <li>6 - 24 hours before departure: 50% refund</li>
                  <li>Under 6 hours before departure: No refund</li>
                </ul>
              </div>

              {/* Total Calculation */}
              <div className="p-4 bg-brand-50/40 rounded-2xl border border-brand-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Total Journey Fare</span>
                  <span className="text-slate-500">
                    ₹ {unitFare.toLocaleString('en-IN')} × {paxCount} passenger{paxCount > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-2xl font-extrabold text-brand-800 tabular-nums">
                  ₹ {totalFare.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: DEMO PAYMENT */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <span className="font-bold text-slate-700 block">Select Demo Payment Method</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'UPI' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'CARD' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'NETBANKING' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span>Net Banking</span>
                </button>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="font-semibold text-slate-700 block">Virtual Payment Address (VPA / UPI ID)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                  <p className="text-slate-400 text-xs">Instant mock approval via UPI 2.0</p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Demo Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
                    💡 <strong>Test note:</strong> Any card ending in <strong>0000</strong> simulates a payment decline. All other numbers will succeed.
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="font-semibold text-slate-700 block">Select Demo Bank</label>
                  <select className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}

              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Amount to Authorize:</span>
                <span className="text-base font-bold text-brand-800">₹ {totalFare.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & ACTIONS */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">Booking Reference</span>
                <span className="text-2xl font-black text-brand-800 font-mono tracking-wider">
                  {confirmedBooking.bookingRef}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Confirmed for {confirmedBooking.passengerName} • {paxCount} traveller{paxCount > 1 ? 's' : ''}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex justify-around">
                <div>
                  <span className="text-slate-400 block">Origin</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.origin}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Destination</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.destination}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Paid</span>
                  <span className="font-bold text-emerald-700">₹ {confirmedBooking.totalFare.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons: PDF, Calendar, WhatsApp, My Trip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <a
                  href={api.bookings.getTicketUrl(confirmedBooking.id)}
                  download
                  className="p-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download E-Ticket (PDF)</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownloadCalendar}
                  className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-300 transition"
                >
                  <Calendar className="w-4 h-4 text-brand-700" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/trip/${confirmedBooking.id}`);
                  }}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Live Trip Monitor</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Navigation */}
        {step < 4 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !travellers[0]?.name.trim()) {
                    setError('Please provide primary passenger name.');
                    return;
                  }
                  setError('');
                  setStep((step + 1) as any);
                }}
                className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Continue to Review
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handlePaymentAndConfirm}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Authorize & Confirm (Demo)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
