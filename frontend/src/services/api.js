import axios from 'axios';

// Resolve API Base URL gracefully across local development and Render/Cloud hosts
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return 'http://localhost:5000/api/v1';

  let url = envUrl.trim();

  // Extract host part to check if it's a bare service slug (e.g. 'eventpass-api-9ytc')
  const cleanHost = url.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

  // If Render internal service name was passed without a domain suffix, append .onrender.com
  if (cleanHost && !cleanHost.includes('.') && cleanHost !== 'localhost') {
    url = `https://${cleanHost}.onrender.com`;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  if (!url.endsWith('/api/v1')) {
    url = url.endsWith('/') ? `${url}api/v1` : `${url}/api/v1`;
  }
  return url;
};

// Create configured Axios instance
const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle global 401 unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on authentication expiry
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
