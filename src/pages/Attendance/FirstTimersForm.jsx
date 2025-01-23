import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Camera, SwitchCamera } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import QrScanner from "react-qr-scanner";

import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const FirstTimersForm = () => {

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refCode, setRefCode] = useState('');
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

  try {

      // Extract date from response message
      const match = response.data.message.match(/for '(.*?)'/);
      const dateString = match ? match[1] : 'this service';
      
      setSuccessMessage(`Your Attendance successfully marked for ${dateString}`);
 
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
              <h2 className='font-bold text-black dark:text-white text-center text-2xl'>Welcome!</h2>
              <p className='font-xl text-black dark:text-white text-center'>Please select the option that 
              best applies to you from the options below.</p>
              <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                <button
                  onClick={() => {
                    if (refCode) {
                      navigate(`/form/${refCode}`, { state: { refCode } });
                    } else {
                      console.error('No reference code found');
                      alert('No reference code found');
                      // Optional: Add error handling or user feedback
                    }
                  }}
                  className="flex items-center justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  I'm a Newcomer
                </button>               

                <button
                  onClick={() => {
                  
                    if (refCode) {
                                            navigate(`/returningNewcomers/${refCode}`, { state: { refCode } });
                                        } else {
                                            console.error('No reference code found');
                                            alert('No reference code found');
                                        }
                                    }}
                  className="flex items-center justify-center rounded bg-secondary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  I'm not a Newcomer
                </button>
              </div>

  
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