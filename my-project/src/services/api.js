import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://v-learn-5n7j.onrender.com/api',
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Check both potential keys for resilience
    const userData = localStorage.getItem('user') || localStorage.getItem('userInfo');
    const user = userData ? JSON.parse(userData) : null;
    
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
