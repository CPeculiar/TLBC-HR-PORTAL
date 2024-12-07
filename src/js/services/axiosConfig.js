import axios from 'axios';
import authService from './authService';

const setupAxiosInterceptors = () => {
  // Set up request interceptor
  axios.interceptors.request.use(
    async (config) => {
    // Check if there's a stored token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, 
  (error) => Promise.reject(error)
);

  // Set up response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error status is 401 and there is no originalRequest._retry flag
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const isRefreshed = await authService.refreshToken();
          
          if (isRefreshed) {
            // Retry the original request with the new token
            return axios(originalRequest);
          } else {
            // If refresh fails, logout the user
            await authService.logout();
          }
        } catch (refreshError) {
          // Logout if any error occurs during refresh
          await authService.logout();
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;