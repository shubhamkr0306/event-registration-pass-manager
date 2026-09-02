import api from './api';

// Fetch organizer overview statistics
export const getOrganizerStatsApi = async () => {
  const response = await api.get('/organizer/stats');
  return response.data;
};

// Fetch all events created by the logged-in organizer
export const getOrganizerEventsApi = async () => {
  const response = await api.get('/organizer/events');
  return response.data;
};

// Create a new event
export const createEventApi = async (eventData) => {
  const response = await api.post('/organizer/events', eventData);
  return response.data;
};

// Fetch single event details
export const getEventByIdApi = async (id) => {
  const response = await api.get(`/organizer/events/${id}`);
  return response.data;
};

// Update an existing event
export const updateEventApi = async (id, eventData) => {
  const response = await api.put(`/organizer/events/${id}`, eventData);
  return response.data;
};

// Delete an event
export const deleteEventApi = async (id) => {
  const response = await api.delete(`/organizer/events/${id}`);
  return response.data;
};

// Fetch attendees for the logged-in organizer's events
export const getOrganizerAttendeesApi = async (params = {}) => {
  const response = await api.get('/organizer/attendees', { params });
  return response.data;
};

// Fetch analytics for the logged-in organizer's events
export const getOrganizerAnalyticsApi = async () => {
  const response = await api.get('/organizer/analytics');
  return response.data;
};

// Check in or revert check-in for an attendee pass
export const checkInPassApi = async (passId, action = '') => {
  const payload = action ? { action } : {};
  const response = await api.patch(`/passes/${passId}/check-in`, payload);
  return response.data;
};

