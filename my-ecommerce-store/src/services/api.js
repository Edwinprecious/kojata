import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Django API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors for Geo-Location headers if needed
api.interceptors.request.use((config) => {
  const country = localStorage.getItem('user_country');
  if (country) {
    config.headers['X-Country-Code'] = country;
  }
  return config;
});

export default api;