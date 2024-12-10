import React, { useState, useEffect, useRef } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { Modal, Button } from 'antd'; 
import authService from '../../js/services/authService';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 4 minutes
const COUNTDOWN_DURATION = 60; // 1 minute
const PORTAL_DOMAIN = 'localhost:5173'; // Replace with your actual portal domain

const IdleTimerProvider = ({ children }) => {
  const [isIdle, setIsIdle] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const countdownTimerRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Broadcast idle state across tabs and track visibility
  const broadcastIdleState = (state) => {
    localStorage.setItem('idleState', JSON.stringify({
      isIdle: state,
      timestamp: Date.now(),
      url: window.location.href
    }));
  };

  // Check if current site is the portal
  const isOnPortal = () => {
    return window.location.hostname.includes(PORTAL_DOMAIN);
  };

  // Function to handle keeping the user signed in
  const handleKeepSignedIn = () => {
    resetIdleState();
    setIsModalVisible(false);
  };

  // Function to handle logout
  const handleLogout = () => {
    authService.logout();
  };

  // Reset idle state and clear timers
  const resetIdleState = () => {
    setIsIdle(false);
    setCountdown(COUNTDOWN_DURATION);
    broadcastIdleState(false);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  };

  // Start countdown timer
  const startCountdownTimer = () => {
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownTimerRef.current);
          handleLogout();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  // Handle idle state
  const handleIdle = () => {
    // Check visibility and site
    if (!isOnPortal() || document.hidden) {
      if (!isIdle) {
        setIsIdle(true);
        broadcastIdleState(true);
        setIsModalVisible(true);
        startCountdownTimer();
      }
    }
  };

  // Initialize idle timer
  const { reset } = useIdleTimer({
    onIdle: handleIdle,
    timeout: IDLE_TIMEOUT,
    throttle: 500
  });

  // Listen for activity and idle state changes across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'idleState') {
        const idleState = JSON.parse(e.newValue);

        // Check if idle state is from a different site or tab
        const isFromDifferentSite = !idleState.url.includes(PORTAL_DOMAIN);
        const isFromDifferentTab = idleState.url !== window.location.href;

        if (isFromDifferentSite || (isFromDifferentTab && idleState.isIdle)) {
          setIsIdle(true);
          setIsModalVisible(true);
          startCountdownTimer();
        } else {
          resetIdleState();
        }
      }
    };

    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.hidden && !isOnPortal()) {
        handleIdle();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {children}
      <Modal
        title="Session Expiring"
        open={isModalVisible}
        closable={false}
        footer={[
          <Button key="stay" type="primary" onClick={handleKeepSignedIn}>
            Keep Me Signed In
          </Button>,
          <Button key="logout" danger onClick={handleLogout}>
            Logout
          </Button>
        ]}
      >
        <p>Your session will expire in {countdown} seconds due to inactivity.</p>
        <p>Would you like to stay signed in?</p>
      </Modal>
    </>
  );
};

export default IdleTimerProvider;