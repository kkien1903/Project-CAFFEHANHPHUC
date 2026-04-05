import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Cho phép gửi cookie đi kèm request
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;