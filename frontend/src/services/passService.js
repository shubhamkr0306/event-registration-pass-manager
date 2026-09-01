import api from './api';

// Book a pass for an event
export const bookPassApi = async (eventId) => {
  const response = await api.post('/passes/book', { eventId });
  return response.data;
};

// Get all passes issued to the logged-in attendee
export const getMyPassesApi = async () => {
  const response = await api.get('/passes/my-passes');
  return response.data;
};

// Cancel an existing pass
export const cancelPassApi = async (passId) => {
  const response = await api.delete(`/passes/${passId}`);
  return response.data;
};

// Verify a digital pass by pass code or QR data
export const verifyPassApi = async (passCode) => {
  const response = await api.post('/passes/verify', { passCode });
  return response.data;
};

// Check-in attendee at venue (mark pass as USED)
export const checkInPassApi = async (passId) => {
  const response = await api.patch(`/passes/${passId}/check-in`);
  return response.data;
};

