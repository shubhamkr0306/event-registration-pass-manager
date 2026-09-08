import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Ticket, 
  UserCheck, 
  RefreshCw, 
  Trash2, 
  Search, 
  AlertCircle, 
  CheckCircle2,
  Database,
  BarChart3,
  Check,
  Undo2,
  Clock,
  Tag,
  TrendingUp,
  Percent,
  IndianRupee,
  Sparkles,
  Calendar
} from 'lucide-react';
import { 
  getAdminStatsApi, 
  getAdminUsersApi, 
  updateUserRoleApi, 
  deleteUserApi,
  getAdminAttendeesApi,
  getAdminAnalyticsApi,
  checkInPassApi
} from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';

export default function AdminPanelPage() {
  const { user: currentAdmin } = useAuth();

  // Active Tab: 'users' | 'attendees' | 'analytics'
  const [activeTab, setActiveTab] = useState('users');

  // Common State
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // 1. Users Tab State
  const [stats, setStats] = useState({
    totalUsers: 0,
    attendees: 0,
    organizers: 0,
    admins: 0,
    dbStatus: 'CONNECTING',
    serverUptime: '0s',
  });
  const [usersList, setUsersList] = useState([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // 2. Attendees Tab State
  const [attendeesList, setAttendeesList] = useState([]);
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('');
  const [selectedPassStatus, setSelectedPassStatus] = useState('');
  const [actionPassId, setActionPassId] = useState(null);

  // 3. Analytics Tab State
  const [analyticsData, setAnalyticsData] = useState(null);

  // Load Data based on active tab
  const fetchData = async () => {
    try {
      setLoading(true);
      setNotification(null);

      if (activeTab === 'users') {
        const [statsRes, usersRes] = await Promise.all([
          getAdminStatsApi(),
          getAdminUsersApi(selectedRoleFilter),
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (usersRes.success) setUsersList(usersRes.users);
      } else if (activeTab === 'attendees') {
        const params = {};
        if (selectedPassStatus) params.status = selectedPassStatus;
        if (attendeeSearchQuery.trim()) params.search = attendeeSearchQuery.trim();

        const res = await getAdminAttendeesApi(params);
        if (res.success) setAttendeesList(res.attendees);
      } else if (activeTab === 'analytics') {
        const res = await getAdminAnalyticsApi();
        if (res.success) setAnalyticsData(res.analytics);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load administrative data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedRoleFilter, selectedPassStatus]);

  // --- Handlers for Users Tab ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      setNotification(null);
      const res = await updateUserRoleApi(userId, newRole);

      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: res.user.role } : u))
        );
        const statsRes = await getAdminStatsApi();
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update user role.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove user "${userName}"?`)) {
      return;
    }
    try {
      setNotification(null);
      const res = await deleteUserApi(userId);

      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
        const statsRes = await getAdminStatsApi();
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete user.',
      });
    }
  };

  // --- Handlers for Attendees Tab ---
  const handleAttendeeSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggleCheckIn = async (passId, currentStatus) => {
    try {
      setActionPassId(passId);
      setNotification(null);

      const action = currentStatus === 'USED' ? 'REVERT' : '';
      const res = await checkInPassApi(passId, action);

      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        const newStatus = currentStatus === 'USED' ? 'ACTIVE' : 'USED';
        setAttendeesList((prev) =>
          prev.map((a) => (a.pass_id === passId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update check-in status.',
      });
    } finally {
      setActionPassId(null);
    }
  };

  // Filtered users for user search input
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Attendees summary calculations
  const totalPasses = attendeesList.length;
  const totalAdmitted = attendeesList.filter((a) => a.status === 'USED').length;
  const totalPending = attendeesList.filter((a) => a.status === 'ACTIVE').length;
  const attendeeTurnout = totalPasses > 0 ? Math.round((totalAdmitted / totalPasses) * 100) : 0;

  return (
    <div className="space-y-6 py-2">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Administrator Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System-wide user permissions, attendee check-in management, and platform event analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-sm transition-colors disabled:opacity-50"
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

      {/* Navigation Tabs Segmented Control */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Accounts & Roles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'attendees'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Ticket className="h-4 w-4" />
          <span>Attendees & Check-In</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Event Analytics</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS & ROLE PERMISSIONS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* System Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                <Users className="h-4 w-4 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Attendees</span>
                <Ticket className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.attendees}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Organizers</span>
                <UserCheck className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.organizers}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">PostgreSQL DB</span>
                <Database className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Active ({stats.serverUptime})
                </span>
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                User Accounts & Permissions ({filteredUsers.length})
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="text-xs rounded-xl border border-slate-300 bg-white py-1.5 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none font-medium"
                >
                  <option value="">All Roles</option>
                  <option value="ATTENDEE">Attendees</option>
                  <option value="ORGANIZER">Organizers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">ID</th>
                    <th className="py-3 px-4 font-semibold">User Details</th>
                    <th className="py-3 px-4 font-semibold">Current Role</th>
                    <th className="py-3 px-4 font-semibold">Registered</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        Loading users from PostgreSQL...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No users matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = currentAdmin?.id === u.id;
                      const isUpdating = updatingId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            #{u.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {u.name} {isSelf && <span className="text-[10px] text-teal-600 font-bold">(You)</span>}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              disabled={isSelf || isUpdating}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className={`text-xs font-semibold py-1 px-2 rounded-lg border focus:outline-none transition-colors ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-900/50 dark:text-purple-300'
                                  : u.role === 'ORGANIZER'
                                  ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:border-teal-900/50 dark:text-teal-300'
                                  : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300'
                              } ${isSelf ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <option value="ATTENDEE">ATTENDEE</option>
                              <option value="ORGANIZER">ORGANIZER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                title="Remove User"
                              >
                                <Trash2 className="h-4 w-4" />
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ATTENDEES & CHECK-IN (SYSTEM-WIDE)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'attendees' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Total Passes</span>
                <Ticket className="h-4 w-4 text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalPasses}
              </p>
              <p className="text-[11px] text-slate-400">Issued across all events</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Admitted at Gate</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalAdmitted}
              </p>
              <p className="text-[11px] text-slate-400">Checked-in passes (USED)</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Pending Check-In</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {totalPending}
              </p>
              <p className="text-[11px] text-slate-400">Active passes awaiting entry</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Turnout Rate</span>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {attendeeTurnout}%
              </p>
              <p className="text-[11px] text-slate-400">Platform attendance percentage</p>
            </div>
          </div>

          {/* Attendees Table Card */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                All Event Passes & Check-In Roster ({attendeesList.length})
              </h2>

              <div className="flex flex-wrap items-center gap-2.5">
                <form onSubmit={handleAttendeeSearchSubmit} className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search attendee, pass, event..."
                    value={attendeeSearchQuery}
                    onChange={(e) => setAttendeeSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </form>

                <select
                  value={selectedPassStatus}
                  onChange={(e) => setSelectedPassStatus(e.target.value)}
                  className="text-xs rounded-xl border border-slate-300 bg-white py-1.5 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Pending (ACTIVE)</option>
                  <option value="USED">Admitted (USED)</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Pass Code</th>
                    <th className="py-3 px-4 font-semibold">Attendee</th>
                    <th className="py-3 px-4 font-semibold">Event & Organizer</th>
                    <th className="py-3 px-4 font-semibold">Booked Date</th>
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
                  ) : attendeesList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No attendees found.
                      </td>
                    </tr>
                  ) : (
                    attendeesList.map((att) => {
                      const isAdmitted = att.status === 'USED';
                      const isActionLoading = actionPassId === att.pass_id;

                      return (
                        <tr key={att.pass_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                            {att.pass_code}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {att.attendee_name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {att.attendee_email}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                              {att.event_title}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Org: {att.organizer_name}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                            {new Date(att.registered_at).toLocaleDateString()}
                          </td>
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM-WIDE EVENT ANALYTICS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Total Registrations</span>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {analyticsData?.totalRegistrations || 0}
              </p>
              <p className="text-[11px] text-slate-400">
                Across {analyticsData?.totalEvents || 0} platform events
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Overall Turnout</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {analyticsData?.checkInRate || 0}%
              </p>
              <p className="text-[11px] text-slate-400">
                {analyticsData?.totalCheckedIn || 0} attendees admitted
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Platform Capacity</span>
                <Percent className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {analyticsData?.fillRate || 0}%
              </p>
              <p className="text-[11px] text-slate-400">
                {analyticsData?.totalRegistrations || 0} / {analyticsData?.totalCapacity || 0} total seats
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
                <IndianRupee className="h-4 w-4 text-teal-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
                ₹{Number(analyticsData?.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400">All booked passes</p>
            </div>
          </div>

          {/* Event Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Event Performance & Turnout Breakdown ({analyticsData?.events?.length || 0})
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">System-wide data</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-600 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Event Info</th>
                    <th className="py-3 px-4 font-semibold">Organizer</th>
                    <th className="py-3 px-4 font-semibold">Date & Price</th>
                    <th className="py-3 px-4 font-semibold">Capacity Fill</th>
                    <th className="py-3 px-4 font-semibold">Gate Turnout</th>
                    <th className="py-3 px-4 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        Loading analytics...
                      </td>
                    </tr>
                  ) : analyticsData?.events?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No event data recorded yet.
                      </td>
                    </tr>
                  ) : (
                    analyticsData?.events?.map((evt) => {
                      const fillPercent = evt.total_capacity > 0
                        ? Math.round((evt.total_registered / evt.total_capacity) * 100)
                        : 0;
                      const turnoutPercent = evt.total_registered > 0
                        ? Math.round((evt.checked_in_count / evt.total_registered) * 100)
                        : 0;

                      return (
                        <tr key={evt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {evt.title}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <Tag className="h-3 w-3 text-teal-600" />
                              <span>{evt.category}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {evt.organizer_name}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-700 dark:text-slate-300">
                              {new Date(evt.date).toLocaleDateString()}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {Number(evt.ticket_price) > 0 ? `₹${evt.ticket_price}` : 'Free'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="w-32">
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

                          <td className="py-3.5 px-4">
                            <div className="w-32">
                              <div className="flex justify-between text-[11px] font-medium mb-1">
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {evt.checked_in_count} admitted
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

          {/* Category Performance Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Platform Category Performance & Audience Distribution</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData?.categories?.map((cat) => {
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
      )}

    </div>
  );
}
