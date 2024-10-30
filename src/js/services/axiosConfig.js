import axios from 'axios';
import authService from './authService';

const setupAxiosInterceptors = () => {
  // Set up request interceptor
  axios.interceptors.request.use(async (config) => {
    // Check if there's a stored token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, (error) => Promise.reject(error));

  // Set up response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const isRefreshed = await authService.refreshToken();
        if (isRefreshed) {
          return axios(originalRequest);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;