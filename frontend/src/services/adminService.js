import api from './api';

// Fetch system dashboard metrics (Total users, attendees, organizers, uptime)
export const getAdminStatsApi = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Fetch all registered users with optional role filtering
export const getAdminUsersApi = async (role = '') => {
  const url = role ? `/admin/users?role=${encodeURIComponent(role)}` : '/admin/users';
  const response = await api.get(url);
  return response.data;
};

// Update a user's role (Promote / Demote)
export const updateUserRoleApi = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Delete a user account
export const deleteUserApi = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Fetch system-wide attendees with optional filters (eventId, status, search)
export const getAdminAttendeesApi = async (params = {}) => {
  const response = await api.get('/admin/attendees', { params });
  return response.data;
};

// Fetch system-wide event analytics
export const getAdminAnalyticsApi = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

// Check in or revert check-in for an attendee pass
export const checkInPassApi = async (passId, action = '') => {
  const payload = action ? { action } : {};
  const response = await api.patch(`/passes/${passId}/check-in`, payload);
  return response.data;
};

