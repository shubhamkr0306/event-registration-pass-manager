import api from './api';

// Fetch public events with optional search query & category filter
export const getPublicEventsApi = async (params = {}) => {
  const response = await api.get('/events', { params });
  return response.data;
};

// Fetch single event details
export const getEventDetailsApi = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};
