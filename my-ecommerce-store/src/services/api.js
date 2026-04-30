// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Your Django API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors to attach tokens and other headers
api.interceptors.request.use((config) => {
  // 1. Attach Country Code if it exists
  const country = localStorage.getItem('user_country');
  if (country) {
    config.headers['X-Country-Code'] = country;
  }

  // 2. Attach Authorization Token if the user is logged in
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;