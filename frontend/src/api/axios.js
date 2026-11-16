import axios from 'axios';
import { resolveApiConfig } from './config';

// Accept either the Render service origin or a complete API base URL.
const { baseURL, isConfigured } = resolveApiConfig(
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.DEV
);
export const isApiConfigured = isConfigured;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every outgoing request if present
api.interceptors.request.use(
  (config) => {
    if (!isApiConfigured) {
      return Promise.reject(new Error('Account services are not connected yet. Please contact the placement office.'));
    }
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
