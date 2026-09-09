import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Check, 
  Undo2,
  Filter,
  Download
} from 'lucide-react';
import { 
  getOrganizerAttendeesApi, 
  getOrganizerEventsApi, 
  checkInPassApi 
} from '@/services/organizerService';
import { exportAttendeesToCSV } from '@/utils/csvExport';

export default function EventAttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Load events for filter dropdown and attendees list
  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedEventId) params.eventId = selectedEventId;
      if (selectedStatus) params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [attendeesRes, eventsRes] = await Promise.all([
        getOrganizerAttendeesApi(params),
        getOrganizerEventsApi(),
      ]);

      if (attendeesRes.success) setAttendees(attendeesRes.attendees);
      if (eventsRes.success) setEvents(eventsRes.events);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load attendees data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEventId, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Check in an attendee or revert check-in
  const handleToggleCheckIn = async (passId, currentStatus) => {
    try {
      setActionLoadingId(passId);
      setNotification(null);

      const action = currentStatus === 'USED' ? 'REVERT' : '';
      const res = await checkInPassApi(passId, action);

      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        const newStatus = currentStatus === 'USED' ? 'ACTIVE' : 'USED';
        setAttendees((prev) =>
          prev.map((a) => (a.pass_id === passId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update check-in status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute summary stats from loaded list
  const totalRegistered = attendees.length;
  const totalCheckedIn = attendees.filter((a) => a.status === 'USED').length;
  const totalPending = attendees.filter((a) => a.status === 'ACTIVE').length;
  const checkInRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  return (
    <div className="space-y-6 py-2">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Attendees & Check-In Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time attendee roster, pass verification statuses, and manual gate check-in controls.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notification Banner */}
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

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Registered */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Registered</span>
            <Ticket className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalRegistered}
          </p>
          <p className="text-[11px] text-slate-400">Across current filter</p>
        </div>

        {/* Admitted / Checked In */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Admitted at Gate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalCheckedIn}
          </p>
          <p className="text-[11px] text-slate-400">Pass marked as USED</p>
        </div>

        {/* Pending Check-In */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Admission</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {totalPending}
          </p>
          <p className="text-[11px] text-slate-400">Active passes awaiting entry</p>
        </div>

        {/* Gate Check-In Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Turnout Rate</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {checkInRate}%
          </p>
          <p className="text-[11px] text-slate-400">Attendance percentage</p>
        </div>

      </div>

      {/* Main Content Card: Filter Bar & Table */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        
        {/* Toolbar: Search, Event Select, Status Select */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Attendee Roster ({attendees.length})
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search attendee, pass, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </form>

            {/* Filter By Event */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 bg-white py-1.5 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none font-medium max-w-[180px] truncate"
            >
              <option value="">All Hosted Events</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>

            {/* Filter By Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 bg-white py-1.5 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none font-medium"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Pending (ACTIVE)</option>
              <option value="USED">Admitted (USED)</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={() => exportAttendeesToCSV(attendees, 'organizer_attendees')}
              disabled={attendees.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-teal-200 bg-teal-50/70 text-teal-700 hover:bg-teal-100 hover:border-teal-300 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download attendee participant list as CSV spreadsheet"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Pass Code</th>
                <th className="py-3 px-4 font-semibold">Attendee</th>
                <th className="py-3 px-4 font-semibold">Event</th>
                <th className="py-3 px-4 font-semibold">Booked On</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading attendees...
                  </td>
                </tr>
              ) : attendees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No attendees found matching the selected filters.
                  </td>
                </tr>
              ) : (
                attendees.map((att) => {
                  const isAdmitted = att.status === 'USED';
                  const isActionLoading = actionLoadingId === att.pass_id;

                  return (
                    <tr key={att.pass_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      
                      {/* Pass Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                        {att.pass_code}
                      </td>

                      {/* Attendee Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {att.attendee_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {att.attendee_email}
                        </div>
                      </td>

                      {/* Event Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                          {att.event_title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(att.event_date).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(att.registered_at).toLocaleDateString()}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isAdmitted ? (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Admitted</span>
                          </span>
                        ) : att.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <span>{att.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Gate Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        {att.status === 'ACTIVE' && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleToggleCheckIn(att.pass_id, att.status)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm transition-colors text-xs disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Admit</span>
                          </button>
                        )}
                        {att.status === 'USED' && (
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleToggleCheckIn(att.pass_id, att.status)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors text-[11px]"
                            title="Revert check-in if made in error"
                          >
                            <Undo2 className="h-3 w-3" />
                            <span>Revert</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
