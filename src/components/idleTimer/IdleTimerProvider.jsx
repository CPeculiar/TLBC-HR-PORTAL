import React, { useState, useEffect, useRef } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { Modal, Button } from 'antd'; 
import authService from '../../js/services/authService';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 4 minutes
const COUNTDOWN_DURATION = 60; // 1 minute

const IdleTimerProvider = ({ children }) => {
  const [isIdle, setIsIdle] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const countdownTimerRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isInitialIdleRef = useRef(true);  // New ref to track initial idle state


  // Function to broadcast idle state across tabs
  const broadcastIdleState = (state) => {
    localStorage.setItem('idleState', JSON.stringify({
      isIdle: state,
      timestamp: Date.now()
    }));
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
    isInitialIdleRef.current = true;  // Reset initial idle state

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
    if (!isIdle) {
      setIsIdle(true);
      broadcastIdleState(true);
      setIsModalVisible(true);
      startCountdownTimer();
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

         // If idle state changes in another tab, sync this tab
        // Only trigger if it's not the initial idle state
        if (idleState.isIdle && isInitialIdleRef.current) {
          isInitialIdleRef.current = false;  // Mark as no longer initial
          setIsIdle(true);
          setIsModalVisible(true);
          startCountdownTimer();
        } else if (!idleState.isIdle) {
          resetIdleState();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
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