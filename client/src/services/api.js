// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ✅ .env 파일과 일치하도록 변경
  withCredentials: true,  // ✅ CORS 문제 해결
});
export default api;
