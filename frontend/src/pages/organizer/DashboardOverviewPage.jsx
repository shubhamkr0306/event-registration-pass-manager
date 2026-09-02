import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Percent, 
  IndianRupee, 
  Plus, 
  RefreshCw, 
  CalendarDays, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { 
  getOrganizerStatsApi, 
  getOrganizerEventsApi, 
  createEventApi, 
  deleteEventApi 
} from '@/services/organizerService';
import { useAuth } from '@/context/AuthContext';

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalCapacity: 0,
    activeEvents: 0,
    fillRate: 0,
    totalRevenue: 0,
  });

  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State for New Event
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    description: '',
    date: '',
    location: '',
    venue: '',
    ticket_price: 0,
    total_capacity: 100,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes] = await Promise.all([
        getOrganizerStatsApi(),
        getOrganizerEventsApi(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (eventsRes.success) setEventsList(eventsRes.events);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load organizer dashboard.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (!formData.title || !formData.date || !formData.location || !formData.venue || !formData.total_capacity) {
      setNotification({ type: 'error', message: 'Please fill in all required event details.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createEventApi(formData);

      if (res.success) {
        setNotification({ type: 'success', message: `Event "${res.event.title}" created successfully!` });
        setModalOpen(false);
        setFormData({
          title: '',
          category: 'Technology',
          description: '',
          date: '',
          location: '',
          venue: '',
          ticket_price: 0,
          total_capacity: 100,
        });
        // Reload list and counts
        fetchDashboardData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to publish event.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return;
    }

    try {
      setNotification(null);
      const res = await deleteEventApi(eventId);

      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setEventsList((prev) => prev.filter((e) => e.id !== eventId));
        fetchDashboardData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete event.',
      });
    }
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Organizer Hub Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-teal-600 dark:text-teal-400">{user?.name}</span>. Track your events, capacity, and attendee check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[11px] underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Events Hosted */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Hosted Events</span>
            <Calendar className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalEvents}
          </p>
          <p className="text-[11px] text-slate-400">
            {stats.activeEvents} upcoming / active
          </p>
        </div>

        {/* Card 2: Total Registrations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Attendees</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalRegistrations}
          </p>
          <p className="text-[11px] text-slate-400">
            Across all your hosted events
          </p>
        </div>

        {/* Card 3: Capacity Fill Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Fill Rate</span>
            <Percent className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.fillRate}%
          </p>
          <p className="text-[11px] text-slate-400">
            {stats.totalRegistrations} / {stats.totalCapacity} total seats
          </p>
        </div>

        {/* Card 4: Ticket Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            From registered passes
          </p>
        </div>

      </div>

      {/* Hosted Events Management Table */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Your Hosted Events ({eventsList.length})
          </h2>
          <Link
            to="/dashboard/events"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Manage All Events →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Event Info</th>
                <th className="py-3 px-4 font-semibold">Date & Venue</th>
                <th className="py-3 px-4 font-semibold">Capacity Fill</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Loading hosted events from PostgreSQL...
                  </td>
                </tr>
              ) : eventsList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No events hosted yet. Click <strong>"+ Create Event"</strong> to publish your first event!
                  </td>
                </tr>
              ) : (
                eventsList.map((evt) => {
                  const percent = evt.total_capacity > 0 
                    ? Math.round((evt.registered_count / evt.total_capacity) * 100) 
                    : 0;

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      
                      {/* Event Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {evt.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {evt.category} • {evt.ticket_price > 0 ? `₹${evt.ticket_price}` : 'Free Entry'}
                        </div>
                      </td>

                      {/* Date & Venue */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                          <span>{new Date(evt.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{evt.venue}, {evt.location}</span>
                        </div>
                      </td>

                      {/* Capacity Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="w-36">
                          <div className="flex justify-between text-[11px] font-medium mb-1">
                            <span>{evt.registered_count} / {evt.total_capacity}</span>
                            <span className="text-slate-400">{percent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block py-0.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            evt.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : evt.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Create Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Event
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. AI & Web Summit 2026"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Category & Date Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Venue & Location Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Venue Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="e.g. Auditorium Hall 2"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    City / Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Bangalore, India"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Price & Capacity Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ticket Price (₹)
                  </label>
                  <input
                    type="number"
                    name="ticket_price"
                    value={formData.ticket_price}
                    onChange={handleInputChange}
                    min={0}
                    step="0.01"
                    placeholder="0.00 (Free if 0)"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Total Capacity (Seats) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total_capacity"
                    value={formData.total_capacity}
                    onChange={handleInputChange}
                    min={1}
                    required
                    placeholder="e.g. 100"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Event Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide an overview of the event schedule, speakers, and guidelines..."
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Event</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
