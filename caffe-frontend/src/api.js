import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true, // To send cookies with requests
});

export default api;