import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Camera, SwitchCamera } from "lucide-react";
import QrScanner from "react-qr-scanner";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';


const AttendanceMarkerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [cameraId, setCameraId] = useState("environment");
  const [cameras, setCameras] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get available cameras
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);
        // Set the back camera as default
        const backCamera = videoDevices.find((device) =>
          device.label.toLowerCase().includes("back")
        );
        setCameraId(
          backCamera
            ? backCamera.deviceId
            : videoDevices[0]
            ? videoDevices[0].deviceId
            : null
        );
      })
      .catch((err) => {
        console.error("Error enumerating devices:", err);
        setError("Unable to access camera. Please check your device settings.");
      });
  }, []);

  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
      setUserRole(userInfo.role || '');
    } catch (error) {
      console.error('Error parsing user info:', error);
      setUserRole('');
    }
  }, []);

  const isSuperAdmin = () => userRole === 'superadmin';


  const handleScan = async (data) => {
    if (data) {
      setScanning(false);
      setIsLoading(true);
      try {
        const refCode = data.text; // Assuming the QR code contains only the ref_code
        const response = await axios.put(
          `https://api.thelordsbrethrenchurch.org/api/attendance/${refCode}/mark/`
        );
        setSuccessMessage(response.data.message);
      } catch (err) {
        console.error("Error marking attendance:", err);
        
        if (err.response && err.response.data.message) {
          // Check for specific attendance closed message
          if (err.response.data.message.includes("attendance is closed")) {
            setError("Sorry, this attendance is closed. Contact your Pastor.");
          } else {
            // Generic error handling for other types of errors
            setError(err.response.data.message || "An error occurred while marking attendance. Please contact your Pastor");
          }

        } else {
          setError(
            "An error occurred while marking attendance. Please contact your Pastor."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner error:", err);
    setError("Error scanning QR code. Please try again.");
  };

  const startScanning = () => {
    setScanning(true);
    setError("");
    setSuccessMessage("");
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const toggleCamera = () => {
    const currentIndex = cameras.findIndex(
      (camera) => camera.deviceId === cameraId
    );
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCameraId(cameras[nextIndex].deviceId);
  };

  return (
    <>
       <Breadcrumb pageName="Mark Attendance"  className="text-black dark:text-white"  />

    <div className="p-4 md:p-6 2xl:p-10">
  <div className="mx-auto max-w-5xl">
    {/* Main Card */}
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Scan QR Code
        </h3>
      </div>


      <div className="p-6.5">
              {/* Scanner Controls */}
              {!scanning && !successMessage && (
                <div className="flex justify-center mb-4.5">
                  <button
                    onClick={startScanning}
                    className="flex items-center justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Attendance
                  </button>
                </div>
              )}

 {/* QR Scanner */}
        {scanning && (
          <div className="mb-4.5">
          <div className="w-full max-w-md mx-auto">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
              constraints={{
                video: { deviceId: cameraId },
              }}
            />
            <p className="text-center mt-4 text-black dark:text-white">
                      Please scan the QR code displayed for attendance.
                    </p>
                    <div className="flex justify-between mt-4">
                      <button
                onClick={toggleCamera}
                disabled={cameras.length <= 1}
                className="flex items-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 dark:text-white"
                      >
                        <SwitchCamera className="mr-2 h-4 w-4" />
                        Switch Camera
                      </button>
                      <button
                onClick={stopScanning}
                className="flex items-center rounded bg-danger p-3 font-medium text-gray hover:bg-opacity-90 dark:text-white"
                      >
                        Stop Scanning
                      </button>
                    </div>
                  </div>
                </div>
              )}


        {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-center mb-4.5">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:text-white"></div>
                </div>
              )}


         {/* Success Message */}
              {successMessage && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-500 dark:text-white">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500 whitespace-pre-wrap">
                  {error}
                </div>
              )}


         {/* Back Button */}
              <div className="flex justify-center mt-6">
                <Link
                  to={isSuperAdmin() ? "/admindashboard" : "/dashboard"}
                  className="flex items-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
            </div>
          </div>
        </div>
     
 
    </>
  );
};

export default AttendanceMarkerPage;
