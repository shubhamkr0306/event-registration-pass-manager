import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Percent, 
  IndianRupee, 
  Calendar, 
  RefreshCw, 
  Tag, 
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { getOrganizerAnalyticsApi } from '@/services/organizerService';

export default function EventAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await getOrganizerAnalyticsApi();
      if (res.success) {
        setData(res.analytics);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load event analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = data || {
    totalEvents: 0,
    totalRegistrations: 0,
    totalCheckedIn: 0,
    checkInRate: 0,
    totalCapacity: 0,
    fillRate: 0,
    totalRevenue: 0,
    events: [],
    categories: [],
  };

  return (
    <div className="space-y-6 py-2">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Event Analytics & Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time attendance rates, venue gate turnout, capacity utilization, and revenue performance.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Overview KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Registrations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Registrations</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalRegistrations}
          </p>
          <p className="text-[11px] text-slate-400">Across {stats.totalEvents} hosted events</p>
        </div>

        {/* Card 2: Gate Check-in Turnout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gate Turnout</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.checkInRate}%
          </p>
          <p className="text-[11px] text-slate-400">
            {stats.totalCheckedIn} / {stats.totalRegistrations} attendees admitted
          </p>
        </div>

        {/* Card 3: Capacity Fill Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Seat Fill Rate</span>
            <Percent className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {stats.fillRate}%
          </p>
          <p className="text-[11px] text-slate-400">
            {stats.totalRegistrations} / {stats.totalCapacity} total capacity
          </p>
        </div>

        {/* Card 4: Gross Ticket Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Ticket Revenue</span>
            <IndianRupee className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Gross pass bookings</p>
        </div>

      </div>

      {/* Event Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Event Performance Breakdown ({stats.events?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Capacity & Turnout Metrics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Event Name</th>
                <th className="py-3 px-4 font-semibold">Date & Price</th>
                <th className="py-3 px-4 font-semibold">Capacity Fill</th>
                <th className="py-3 px-4 font-semibold">Gate Turnout</th>
                <th className="py-3 px-4 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Loading performance data...
                  </td>
                </tr>
              ) : stats.events?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No event data available yet.
                  </td>
                </tr>
              ) : (
                stats.events.map((evt) => {
                  const fillPercent = evt.total_capacity > 0
                    ? Math.round((evt.total_registered / evt.total_capacity) * 100)
                    : 0;
                  const turnoutPercent = evt.total_registered > 0
                    ? Math.round((evt.checked_in_count / evt.total_registered) * 100)
                    : 0;

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      
                      {/* Event Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {evt.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Tag className="h-3 w-3 text-teal-600" />
                          <span>{evt.category}</span>
                        </div>
                      </td>

                      {/* Date & Price */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          {new Date(evt.date).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {Number(evt.ticket_price) > 0 ? `₹${evt.ticket_price}` : 'Free'}
                        </div>
                      </td>

                      {/* Capacity Meter */}
                      <td className="py-3.5 px-4">
                        <div className="w-36">
                          <div className="flex justify-between text-[11px] font-medium mb-1">
                            <span>{evt.total_registered} / {evt.total_capacity}</span>
                            <span className="text-slate-400">{fillPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${Math.min(fillPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Gate Turnout Meter */}
                      <td className="py-3.5 px-4">
                        <div className="w-36">
                          <div className="flex justify-between text-[11px] font-medium mb-1">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {evt.checked_in_count} checked in
                            </span>
                            <span className="text-slate-400">{turnoutPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(turnoutPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{Number(evt.revenue).toLocaleString()}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Category Performance Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <span>Category Performance & Audience Distribution</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.categories?.map((cat) => {
            const catTurnout = cat.total_registrations > 0
              ? Math.round((cat.checked_in_count / cat.total_registrations) * 100)
              : 0;

            return (
              <div
                key={cat.category}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {cat.category}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                    {cat.event_count} Events
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs pt-1">
                  <span className="text-slate-500 dark:text-slate-400">Registrations:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.total_registrations}</span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Gate Turnout:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{catTurnout}%</span>
                </div>

                <div className="flex items-baseline justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Revenue:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">₹{Number(cat.revenue).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
