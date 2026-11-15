import axios from 'axios';

// Accept either the Render service origin or a complete API base URL.
const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
const baseURL = configuredBaseURL
  ? new URL(configuredBaseURL).pathname === '/'
    ? `${configuredBaseURL}/api`
    : configuredBaseURL
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every outgoing request if present
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

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized / session expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
