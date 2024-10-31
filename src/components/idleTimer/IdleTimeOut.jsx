import { useState, useCallback, useRef } from "react";
import { useIdleTimer } from "react-idle-timer";
import { GetLocalStorage, logoutUser } from "../utils/redux/resources/general";
import Button from "./Button";
import { isTokenExpired } from "@/utils/expiringSoon";
import { useRefreshMutation } from "@/utils/redux/reducers/auth.reducers";

const IdleTimeoutModal = ({ remainingTime, onKeepSignedIn, onLogout }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div
        className="bg-white text-center shadow-md rounded-md w-full max-w-sm flex flex-col"
        style={{
          width: "25rem",
          height: "12rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div className="p-4 flex-grow">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Your session will expire in:
          </h2>
          <p className="text-2xl font-bold mb-4">{formatTime(remainingTime)}</p>
        </div>
        <div
          className="flex justify-end bg-gray-200 border-t border-gray-300 p-4 space-x-3"
          // style={{ alignItems: "flex-end", height: "4rem", alignSelf: "flex-end" }}
        >
          <Button variant="destructive" onClick={onKeepSignedIn}>
            Continue session
          </Button>
          <Button variant="outline" onClick={onLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

const IdleTimeout = ({ children }) => {
  const [isIdle, setIsIdle] = useState(false);
  const [getNewToken] = useRefreshMutation();
  const [remainingTime, setRemainingTime] = useState(60);
  // const [debugInfo, setDebugInfo] = useState({
  //   lastActivity: "N/A",
  //   isIdle: false,
  // });
  const countdownIntervalRef = useRef(null);

  const handleOnIdle = () => {
    // console.log("Idle detected");
    setIsIdle(true);
    // setDebugInfo((prev) => ({ ...prev, isIdle: true }));
    startCountdown();
  };

  const handleOnActive = () => {
    if (isTokenExpired()) {
      getNewToken(GetLocalStorage("user")?.refresh);
    }
  };

  const startCountdown = () => {
    setRemainingTime(60);
    countdownIntervalRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleLogout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleKeepSignedIn = () => {
    // console.log("Keeping session active");
    setIsIdle(false);
    clearInterval(countdownIntervalRef.current);
    setRemainingTime(60);
    idleTimer.reset();
    getNewToken(GetLocalStorage("user")?.refresh);
    // setDebugInfo((prev) => ({ ...prev, isIdle: false }));
  };

  const handleLogout = useCallback(() => {
    // console.log("Logging out");
    clearInterval(countdownIntervalRef.current);
    logoutUser("Logging out due to inactivity...");
  }, []);

  const idleTimer = useIdleTimer({
    timeout: 1000 * 60 * 3,
    onIdle: handleOnIdle,
    onAction: handleOnActive,
    debounce: 500,
  });

  return (
    <div>
      {children}
      {isIdle && (
        <IdleTimeoutModal
          remainingTime={remainingTime}
          onKeepSignedIn={handleKeepSignedIn}
          onLogout={handleLogout}
        />
      )}
      {/* <div className="fixed bottom-0 left-0 bg-gray-200 p-2 text-sm">
        Debug: Last Activity: {debugInfo.lastActivity}, Is Idle:{" "}
        {debugInfo.isIdle.toString()}
      </div> */}
    </div>
  );
};

export default IdleTimeout;
