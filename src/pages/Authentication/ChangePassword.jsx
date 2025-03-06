
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Effect to check password match in real-time
  useEffect(() => {
    if (newPassword || confirmPassword) {
      validatePasswordMatch();
    }
  }, [newPassword, confirmPassword]);

  const validatePasswordMatch = () => {
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'The Passwords you entered do not match'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };
  
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    setMessage('');
    
    // Clear specific field error when user starts typing
    if (errors.confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for password match before submitting
    if (newPassword !== confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'The Passwords you entered do not match'
      }));
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate('/');
      return;
    }
    setIsLoading(true);

      const response = await axios.post('https://api.thelordsbrethrenchurch.org/api/password/change/', {
        old_password: oldPassword,
        new_password: newPassword, 
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

      setMessage('Password was successfully changed.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = Object.values(error.response.data)[0][0];
        setMessage(errorMessage);
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Change Password</h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
          <label htmlFor="old-password" className="mb-2.5 block text-black font-medium  dark:text-white">Old Password</label>
          <div className="relative">
          <input
           type={showOldPassword ? 'text' : 'password'}
            id="old-password"
            value={oldPassword}
            onChange={(e) => {
              handleInputChange(e, setOldPassword);
               setMessage('');
               }}
               placeholder="Enter your old password"
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-4"
                >
                 <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                        fill=""
                      />
                      <path
                        d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                        fill=""
                      />
                    </g>
                  </svg>
                </button>
              </div>
            </div>
         
            <div className="relative">
          <label htmlFor="new-password" className="mb-2.5 block font-medium text-black dark:text-white">New Password</label>
          <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="new-password"
            value={newPassword}
            onChange={(e) => { 
              handleInputChange(e, setNewPassword);
              setMessage(''); 
               }}
               placeholder="Enter your new password"
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-4"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                        fill=""
                      />
                      <path
                        d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                        fill=""
                      />
                    </g>
                  </svg>
                </button>
              </div>
            </div>


            <div className="relative">
          <label htmlFor="confirm-password" className="mb-2.5 block font-medium text-black dark:text-white">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => { 
                handleInputChange(e, setConfirmPassword);
                setMessage(''); 
                }}
                placeholder="Confirm your new password"
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.5">
                      <path
                        d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                        fill=""
                      />
                      <path
                        d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                        fill=""
                      />
                    </g>
                  </svg>
                </button>
                <span className="text-red-500 text-sm">{errors.confirmPassword}</span>
              </div>
            </div>
          </div>


          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 ${
                isLoading ? 'cursor-not-allowed bg-opacity-50' : ''
              }`}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>

        {message && (
          <div className="text-red-500 text-sm mt-1">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;