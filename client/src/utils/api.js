import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    return url.endsWith('/api') ? url : `${url}/api`;
  }
  // Auto-detect production environment to prevent localhost fallback failures
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://civicsense-api.onrender.com/api';
  }
  return 'http://127.0.0.1:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT authorization token from localStorage
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

// Automatically handle unauthorized errors (401) by clearing invalid/expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't intercept login or registration requests to avoid interrupting normal login errors
      const isAuthRequest = error.config && (
        error.config.url.includes('/auth/login') || 
        error.config.url.includes('/auth/register')
      );
      
      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          if (window.location.pathname.startsWith('/citizen')) {
            window.location.href = '/login?role=citizen';
          } else {
            window.location.href = '/login?role=mp';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const baseURL = getBaseURL().replace(/\/api$/, '');
  return `${baseURL}${path}`;
};

export default api;
