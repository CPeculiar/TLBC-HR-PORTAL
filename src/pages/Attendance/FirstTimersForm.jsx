import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Camera, SwitchCamera } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";

import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const FirstTimersForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    gender: '',
    birth_date: '',
    address: '',
    profile_picture: null,
    occupation: '',
    invited_by: '',
    want_to_be_member: true,
    marital_status: '',
    interested_department: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refCode, setRefCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [cameraId, setCameraId] = useState("environment");
    const [cameras, setCameras] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Extract ref_code from URL
    const path = window.location.pathname;
    console.log("Full Path:", path); // Debug log

    // Split by '/forms/' instead of '/form/'
  const extractedRefCode = path.split('/forms/')[1];

    console.log('Extracted refCode:', extractedRefCode);


    if (!extractedRefCode) {
        // Handle case where ref_code is not found
        console.error('No reference code found in URL');
        // Optionally set an error state or redirect
      } else {
        setRefCode(extractedRefCode);
      }
     }, []);


  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        profile_picture: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

     // Verify refCode before making API call
 if (!refCode) {
    setErrors({ message: 'Invalid reference code' });
    return;
  }

    const formDataToSubmit = new FormData();
    
    // Append all form fields to FormData
  Object.keys(formData).forEach(key => {
    if (formData[key] !== null && formData[key] !== undefined) {
      formDataToSubmit.append(key, formData[key]);
    }
  });


  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate("/login");
      return;
    }

      const response = await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/newcomers/`,
        formDataToSubmit,
        {
          params: { ref_code: refCode }, 
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`, 
          },
          
        }
      );

      // Extract date from response message
      const match = response.data.message.match(/for '(.*?)'/);
      const dateString = match ? match[1] : 'this service';
      
      setSuccessMessage(`Your Attendance successfully marked for ${dateString}`);
    
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        gender: '',
        birth_date: '',
        address: '',
        profile_picture: null,
        occupation: '',
        invited_by: '',
        want_to_be_member: true,
        marital_status: '',
        interested_department: ''
      });
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ message: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
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
      <Breadcrumb pageName="First Timers" />
  
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
              {/* {!scanning && !successMessage && (
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
   */}
  
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
};

export default FirstTimersForm;