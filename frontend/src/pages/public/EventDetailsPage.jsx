import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Ticket, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Shield, 
  Loader2,
  Tag,
  QrCode
} from 'lucide-react';
import { getEventDetailsApi } from '@/services/eventService';
import { bookPassApi, getMyPassesApi } from '@/services/passService';
import { useAuth } from '@/context/AuthContext';
import PassQRModal from '@/components/pass/PassQRModal';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [existingPass, setExistingPass] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getEventDetailsApi(id);
      if (data.success) {
        setEvent(data.event);
      }

      // Check if logged-in attendee already has an active pass for this event
      if (isAuthenticated) {
        try {
          const myPassesRes = await getMyPassesApi();
          if (myPassesRes.success && Array.isArray(myPassesRes.passes)) {
            const found = myPassesRes.passes.find(
              (p) => p.event_id === parseInt(id, 10) && p.status !== 'CANCELLED'
            );
            if (found) {
              setExistingPass(found);
            }
          }
        } catch (passErr) {
          console.warn('Could not load user passes check:', passErr);
        }
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, isAuthenticated]);

  const handleBookPass = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingResult(null);
      setErrorMessage('');

      const res = await bookPassApi(event.id);
      if (res.success) {
        setBookingResult(res.pass);
        setExistingPass(res.pass);
        // Refresh event seats count
        fetchDetails();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to book pass. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading event details from database...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {errorMessage || 'Event not found.'}
        </p>
        <Link to="/events" className="text-xs text-teal-600 hover:underline">
          ← Back to all events
        </Link>
      </div>
    );
  }

  const fillPercent = event.total_capacity > 0 
    ? Math.round((event.registered_count / event.total_capacity) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      
      {/* Back Link */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all events</span>
      </Link>

      {/* Main Event Card */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100/70 dark:bg-teal-950/60 px-3 py-1 rounded-full">
              <Tag className="h-3.5 w-3.5" />
              <span>{event.category}</span>
            </span>

            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {event.status}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {event.title}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hosted by <strong className="text-slate-800 dark:text-slate-200">{event.organizer_name}</strong>
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 p-4 text-xs">
          
          <div className="flex items-center gap-3 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Date & Schedule</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Location & Venue</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {event.venue}
              </p>
              <p className="text-[10px] text-slate-500">{event.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Pass Price</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {event.ticket_price > 0 ? `₹${event.ticket_price}` : 'Free Access'}
              </p>
            </div>
          </div>

        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              About this Event
            </h2>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Seat Capacity Bar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Seat Allocation
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {event.registered_count} registered of {event.total_capacity} total seats ({event.available_seats} remaining)
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-300"
                style={{ width: `${Math.min(fillPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Registration / Booking Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            
            {/* Booking Result or Existing Registration Banner */}
            {existingPass || bookingResult ? (
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>You are officially registered for this event!</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                    {(existingPass || bookingResult).status} PASS
                  </span>
                </div>

                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Unique Pass Code: <strong className="font-mono font-bold text-slate-900 dark:text-white">{(existingPass || bookingResult).pass_code}</strong>. Present your QR code at the venue gate for instant check-in.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>View Pass QR Code</span>
                  </button>

                  <Link
                    to="/my-passes"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <span>Go to My Passes →</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Ready to attend?
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Reserve your verified digital pass with instant entry validation.
                    </p>
                  </div>

                  {event.is_sold_out ? (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  ) : isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleBookPass}
                      disabled={bookingLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-colors disabled:opacity-50"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating Pass...</span>
                        </>
                      ) : (
                        <>
                          <Ticket className="h-4 w-4" />
                          <span>Get Digital Pass</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm transition-colors"
                    >
                      <span>Sign In to Book Pass</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Pop-up Modal to View & Download Pass QR Code */}
      {showQRModal && (existingPass || bookingResult) && (
        <PassQRModal
          pass={existingPass || bookingResult}
          attendeeName={user?.name || 'Attendee'}
          onClose={() => setShowQRModal(false)}
        />
      )}

    </div>
  );
}
