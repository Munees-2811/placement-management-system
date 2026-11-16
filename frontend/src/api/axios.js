import axios from 'axios';
import { resolveApiConfig } from './config';

// Accept either the Render service origin or a complete API base URL.
const { baseURL, isConfigured } = resolveApiConfig(
  import.meta.env.VITE_API_BASE_URL,
  import.meta.env.DEV
);
export const isApiConfigured = isConfigured;

// Log the resolved base URL in development to aid debugging
if (import.meta.env.DEV) {
  console.info(`[API] baseURL resolved to: ${baseURL}`);
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout to 30 s to tolerate Render free-tier cold starts
  timeout: 30000,
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

    // Translate network/CORS errors into a human-readable message
    if (!error.response && error.request) {
      // Request was sent but no response received — backend is down or CORS blocked the preflight
      error.message =
        'Unable to reach the server. The backend may be starting up (allow ~30 s on first load) or is offline.';
    }

    return Promise.reject(error);
  }
);

export default api;
