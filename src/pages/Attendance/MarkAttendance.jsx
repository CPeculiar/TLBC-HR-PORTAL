import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, SwitchCamera } from "lucide-react";
import QrScanner from "react-qr-scanner";

const AttendanceMarkerPage = () => {
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
    <div className="flex h-screen overflow-hidden">


        
        <h1 className="text-3xl font-bold mb-5 text-center mt-8">Attendance Marker</h1>

        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-4">
        {!scanning && !successMessage && (
          <button
            onClick={startScanning}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <Camera className="mr-2" />
            Take Attendance
          </button>
        )}

        {scanning && (
          <div className="w-full max-w-md">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%" }}
              constraints={{
                video: { deviceId: cameraId },
              }}
            />
            <p className="text-center mt-2">
              Please scan the QR code displayed for attendance.
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={toggleCamera}
                disabled={cameras.length <= 1}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <SwitchCamera className="mr-2" />
                Switch Camera
              </button>
              <button
                onClick={stopScanning}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Stop Scanning
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded whitespace-pre-wrap">
            {error}
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-8 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
 
  );
};

export default AttendanceMarkerPage;
