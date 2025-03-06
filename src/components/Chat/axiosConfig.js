// api/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
<<<<<<< HEAD
  baseURL: 'https://tlbc-platform-api.onrender.com',
=======
  baseURL: 'https://api.thelordsbrethrenchurch.org',
>>>>>>> dfc3f27a5deda41d600716fc965790772dae9a98
  timeout: 5000,
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;