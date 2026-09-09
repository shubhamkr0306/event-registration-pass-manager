import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Calendar, 
  Ticket, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Lock, 
  Zap, 
  Tag,
  Clock,
  Compass
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPublicEventsApi } from '@/services/eventService';

export default function HomePage() {
  const { isAuthenticated, isOrganizer, isAdmin, user } = useAuth();

  // If Organizer or Admin lands on HomePage, automatically redirect to their primary dashboard
  if (isOrganizer) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch upcoming events from backend for the featured section
  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        setLoading(true);
        const res = await getPublicEventsApi();
        if (res.success && isMounted) {
          // Take top 3 upcoming events
          setFeaturedEvents(res.events.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12 py-2">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 lg:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Subtle Background Accent Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-500/5" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />

        <div className="relative z-10 max-w-3xl space-y-6">
          
          {/* Tag Pill */}
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 text-xs font-semibold text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-400 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Next-Gen Event Ticketing & Pass Platform</span>
          </div> */}

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Seamless Event Discovery &{' '}
            <span className="text-teal-600 dark:text-teal-400">
              Tamper-Proof Digital Passes
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Discover top technology summits, hands-on workshops, and professional conferences. 
            Reserve your seat in seconds and receive an AES-256-GCM encrypted digital pass for 
            instant, paperless check-in at the venue.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors shadow-teal-600/20"
            >
              <span>Explore All Events</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Smart Contextual Secondary Button */}
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span>Create Free Account</span>
              </Link>
            ) : isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-purple-300 bg-purple-50 px-5 py-3 text-xs sm:text-sm font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/60 transition-colors shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Go to Admin Console</span>
              </Link>
            ) : isOrganizer ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                <span>Go to Organizer Hub</span>
              </Link>
            ) : (
              <Link
                to="/my-passes"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                <Ticket className="h-4 w-4 text-teal-600" />
                <span>View My Passes</span>
              </Link>
            )}
          </div>

          {/* Metrics / Trust Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">100%</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Encrypted Passes</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">&lt; 1s</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Gate Verification</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Live</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Capacity Tracking</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Zero</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Paper Tickets</p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEATURED UPCOMING EVENTS                                               */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Featured Upcoming Events
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hand-picked conferences, workshops, and meetups open for registration right now.
            </p>
          </div>

          <Link
            to="/events"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            <span>Browse All Events</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading upcoming events...
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Ticket className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-500">No events currently scheduled. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredEvents.map((evt) => {
              const fillRate = evt.total_capacity > 0
                ? Math.round((evt.registered_count / evt.total_capacity) * 100)
                : 0;
              const availableSeats = Math.max(0, evt.total_capacity - evt.registered_count);

              return (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-3">
                    {/* Header Row: Category & Price */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-lg">
                        <Tag className="h-3 w-3" />
                        <span>{evt.category}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {Number(evt.ticket_price) > 0 ? `₹${evt.ticket_price}` : 'Free Entry'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Venue & Date Details */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                        <span>
                          {new Date(evt.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{evt.venue}, {evt.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Capacity Bar & Action Button */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {availableSeats > 0 ? `${availableSeats} seats remaining` : 'Sold Out'}
                        </span>
                        <span className="text-slate-400">{fillRate}% filled</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            availableSeats <= 5 ? 'bg-amber-500' : 'bg-teal-600'
                          }`}
                          style={{ width: `${Math.min(fillRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/events/${evt.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-teal-600 text-xs font-semibold transition-colors dark:bg-slate-800 dark:hover:bg-teal-600 shadow-sm"
                    >
                      <span>View Details & Register</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS (3-STEP VALUE FLOW)                                      */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Simple 3-Step Process
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            How EventPass Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            From discovering great events to rapid check-in at the gate, everything is unified in a single seamless flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="relative p-5 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-800/40 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-sm shadow-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Discover & Reserve
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore upcoming technology conferences, hands-on workshops, and community meetups. 
              Claim your seat in one click with instant capacity reservation.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-5 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-800/40 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-sm shadow-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Encrypted Digital Pass
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your pass is cryptographically protected with AES-256-GCM. 
              Ordinary phone cameras see only an opaque hash, preventing ticket cloning and data leaks.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-5 rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-800/40 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-sm shadow-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              One-Tap Gate Check-In
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Show your digital pass on your phone screen at the venue gate. 
              Authorized organizers scan it with the Live Camera Scanner for instant check-in.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PLATFORM CAPABILITIES & FEATURES                                      */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Why Choose EventPass
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Built for Attendees & Organizers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered with modern web standards, strict role-based access control, and rock-solid cryptographic security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Security */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tamper-Proof QR
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AES-256-GCM authenticated encryption rejects any forged or altered pass tokens automatically.
            </p>
          </div>

          {/* Card 2: Instant Digital Delivery */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
              <Ticket className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Paperless Digital Hub
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Never lose a paper pass. Download offline PNG QR codes or access them live from any device anytime.
            </p>
          </div>

          {/* Card 3: Organizer Live Scanner */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Camera Scanner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Organizers use an in-browser camera scanner with instant decryption, validation, and 1-click admission.
            </p>
          </div>

          {/* Card 4: Capacity Tracking */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Seat Meters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated seat counters ensure capacity limits are strictly enforced with zero risk of overbooking.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BOTTOM CALL-TO-ACTION (CTA)                                           */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-8 sm:p-12 text-center dark:border-teal-900/60 dark:from-slate-900 dark:to-teal-950/20 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
            <Ticket className="h-6 w-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to Attend Your Next Event?
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Join developers, designers, and organizers using EventPass for seamless registrations 
            and tamper-proof digital access passes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              <span>Browse All Events</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                <span>Create Free Account</span>
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
