import axios from 'axios';

const getBaseURL = () => {
  let url = '';
  if (import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL.trim();
  } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Correct fallback URL to match the actual production API server domain
    url = 'https://civicsense-ai-88cr.onrender.com';
  } else {
    url = 'http://127.0.0.1:5000';
  }

  // Remove trailing slashes to prevent double slash routing issues (e.g. //api/auth/login)
  url = url.replace(/\/+$/, '');

  return url.endsWith('/api') ? url : `${url}/api`;
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
          window.location.href = '/login';
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
