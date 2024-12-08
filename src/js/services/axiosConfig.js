import axios from 'axios';
import authService from './authService';

let tokenRefreshInterval = null;

const setupAxiosInterceptors = () => {

  // Clear any existing interval to prevent multiple intervals
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

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
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // Logout if any error occurs during refresh
          await authService.logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

   // Start periodic token refresh
   startTokenRefresh();
};

const startTokenRefresh = () => {
  // Clear any existing interval
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

  // Start new interval for token refresh and validation
  tokenRefreshInterval = setInterval(async () => {
    // Only attempt refresh if access token exists
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

   if (accessToken && refreshToken) {
      try {
        // First, verify the current token
        const isValid = await authService.checkTokenValidity();

        if (!isValid) {
          // If token is invalid, attempt to refresh
          const refreshResult = await authService.refreshToken();

        //   const response = await axios.post('https://tlbc-platform-api.onrender.com/api/token/refresh/', {});
        
        // if (response.data.access && response.data.refresh) {
        //   // Update tokens in localStorage
        //   localStorage.setItem('accessToken', response.data.access);
        //   localStorage.setItem('refreshToken', response.data.refresh);

        //   // Update axios default header
        //   authService.setAuthHeader(response.data.access);


          if (!refreshResult) {
            // If refresh fails, logout
            await authService.logout();
          }
        }
      } catch (error) {
        console.error('Token management error:', error);
        // Optionally logout user if refresh fails persistently
        await authService.logout();
      }
    } else {
      // If no tokens, stop the interval
      stopTokenRefresh();
    }
  }, 2 * 60 * 1000); // Check every 3 minutes
};

const stopTokenRefresh = () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
};

// Modify authService to include stop and start methods
authService.startTokenRefresh = startTokenRefresh;
authService.stopTokenRefresh = stopTokenRefresh;

export default setupAxiosInterceptors;