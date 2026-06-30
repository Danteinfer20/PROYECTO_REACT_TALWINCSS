import axios from 'axios';

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: isDevelopment ? 'http://localhost:8000/api/v1' : '/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const lang = localStorage.getItem('app_lang') || 'es';
    config.headers['X-Localization'] = lang;
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;