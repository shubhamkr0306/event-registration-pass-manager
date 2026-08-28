import api from './api';

// Register user
export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user
export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get current user profile
export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
