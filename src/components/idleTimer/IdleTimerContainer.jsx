import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useIdleTimer } from 'react-idle-timer';

// Axios interceptor for handling authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const IdleTimerContainer = ({ children }) => {
  const navigate = useNavigate();
  const [isIdle, setIsIdle] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  const [countdownStarted, setCountdownStarted] = useState(false);


  const handleIdle = () => {
    setIsIdle(true);
    setRemainingTime(60);
    setCountdownStarted(true);
  };

  const handleActive = () => {
    setIsIdle(false);
    setRemainingTime(60);
    setCountdownStarted(false);
  };

  const handleStayActive = () => {
    setIsIdle(false);
    setRemainingTime(60);
    setCountdownStarted(false);
  };

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      const response = await axios.post('https://tlbc-platform-api.onrender.com/api/logout/', { refresh: refreshToken });
      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('firstName');
        localStorage.removeItem('userRole');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const handleLogout = () => {
    setIsIdle(false);
    setCountdownStarted(false);
    logout();
  };

  const { getRemainingTime } = useIdleTimer({
    timeout: 1000 * 60 * 1, // 10 minutes
    onIdle: handleIdle,
    onActive: handleActive,
    debounce: 500
  });

  useEffect(() => {
    let interval;
    if (isIdle && countdownStarted) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleLogout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isIdle, countdownStarted]);

  return (
    <>
      {children}
      {isIdle && countdownStarted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-2xl w-3/4 md:w-1/2 lg:w-1/3">
            <h2 className="text-2xl md:text-3xl text-center font-bold mb-6">You've been idle</h2>
            <p className="mb-6 text-lg md:text-xl">You will be logged out in {remainingTime} seconds.</p>
            <div className="flex justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg md:text-xl"
                onClick={handleStayActive}
              >
                Keep me signed in
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg md:text-xl"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IdleTimerContainer;