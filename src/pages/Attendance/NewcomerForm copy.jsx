import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, SwitchCamera } from "lucide-react";
import QrScanner from "react-qr-scanner";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';


const NewcomerForm2 = () => {
  const [scanning, setScanning] = useState(false);
  const [cameraId, setCameraId] = useState("environment");
  const [cameras, setCameras] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleScan = async (data) => {
    if (data) {
      setScanning(false);
      setIsLoading(true);
      try {
        const refCode = data.text; // Assuming the QR code contains only the ref_code
        const response = await axios.put(
          `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/mark/`
        );
        setSuccessMessage(response.data.message);
      } catch (err) {
        console.error("Error marking attendance:", err);
        if (err.response) {
          setError(
            `Error: ${err.response.status}\n${JSON.stringify(
              err.response.data,
              null,
              2
            )}`
          );
        } else {
          setError(
            "An error occurred while marking attendance. Please try again."
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
      <Breadcrumb pageName="Mark Attendance" />
  
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          {/* Main Card */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Attendance Options
              </h3>
            </div>
  
            <div className="p-6.5 space-y-4">
              {/* Add Newcomer and Returning Member Buttons */}
              <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <button
                  onClick={() => {
                    const newcomerLink = localStorage.getItem('newcomerLink');
                    if (newcomerLink) {
                      navigate(newcomerLink.replace(window.location.origin, ''));
                    }
                  }}
                  className="flex items-center justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Add a Newcomer
                </button>
                
                <button
                  onClick={() => navigate("/attendancereport")}
                  className="flex items-center justify-center rounded bg-secondary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Add a Returning New Member
                </button>
              </div>
  
              {/* Existing Scanning Section */}
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
  
  
              {/* Back Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export default NewcomerForm2;