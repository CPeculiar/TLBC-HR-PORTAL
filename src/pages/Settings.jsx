import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import userThree from '../images/user/user-03.png';
import axios from 'axios';
import { X, Edit2, Calendar  } from 'lucide-react';
import authService from '../js/services/authService';
import { Camera, Loader } from 'lucide-react';
import DatePicker from "react-multi-date-picker"
import 'react-datepicker/dist/react-datepicker.css';
import { nigerianStates } from '../utils/nigerianStates';
import ProfilePicture from './ProfilePicture';
import { BiMap } from "react-icons/bi";
import { FaFlag, FaCity, FaFileAlt, FaClipboardCheck } from "react-icons/fa";
import UserIcon from '../images/user/user-14.png';

const Settings = ({ onUpdateSuccess, onFileSelect }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const [profilePicture, setProfilePicture] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const profilePictureRef = useRef(null);

  const [profileData, setProfileData] = useState({
    profile_picture: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    groups: [],
    birth_date: '',
    joined_at: '',
    gender: '',
    phone_number: '',
    church: '',
    origin_state: '',
    address: '',
    perm_address: '',
    city: '',
    state: '',
    country: '',
    invited_by: '',
    first_min_arm: '',
    current_min_arm: '',
    current_offices: '',
    previous_offices: '',
    suspension_record: '',
    wfs_graduation_year: '',
    wts_graduation_year: null,
    tlsom_graduation_year: null,
    bio: '',
    facebook_link: null,
    instagram_link: null,
    tiktok_link: null,
    twitter_link: null,
    youtube_link: null,
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const churchOptions = {
    'Central': 'central',
    'TLBC Awka': 'tlbc-awka',
    'TLBC Ekwulobia': 'tlbc-ekwulobia',
    'TLBC Ihiala': 'tlbc-ihiala', 
    'TLBC Mbaukwu': 'tlbc-mbaukwu',
    'TLBC Nnewi': 'tlbc-nnewi',
    'TLBC Onitsha': 'tlbc-onitsha',
    'TLBCM Agulu': 'tlbcm-agulu',
    'TLBCM COOU Igbariam': 'tlbcm-coou-igbariam',
    'TLBCM COOU Uli': 'tlbcm-coou-uli',
    'TLBCM FUTO': 'tlbcm-futo',
    'TLBCM IMSU': 'tlbcm-imsu',
    'TLBCM Mgbakwu': 'tlbcm-mgbakwu',
    'TLBCM NAU': 'tlbcm-nau',
    'TLBCM Nekede': 'tlbcm-nekede',
    'TLBCM Oko': 'tlbcm-oko',
    'TLBCM Okofia': 'tlbcm-okofia',
    'TLBCM UNILAG': 'tlbcm-unilag',
    'TLTN Agulu': 'tltn-agulu',
    'TLTN Awka': 'tltn-awka'
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const countries = [
    "Nigeria", "United States", "Canada", "United Kingdom", "Germany",
    "France", "Australia", "India", "China", "Brazil", "South Africa",
     "Benin", "Cameroon", "Chad", "Ghana", "Niger",  "Ivory Coast",
  "Togo", "Burkina Faso", "Mali", "Central African Republic"
  ];
  
    const fetchProfileData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setError("Access token not found. Please login first.");
          navigate("/");
          return;
        }
        setLoading(true);

      const response = await axios.get('https://tlbc-platform-api.onrender.com/api/user/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const data = response.data;
      setProfileData(data);
      setFormData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add event listener to close image options when clicking outside
    // document.addEventListener('mousedown', handleClickOutside);
    // return () => {
    //   document.removeEventListener('mousedown', handleClickOutside);
    // };
  


  const handleClickOutside = (event) => {
    if (
      profilePictureRef.current &&
      !profilePictureRef.current.contains(event.target)
    ) {
      setShowImageOptions(false);
    }
  };

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  
  const parseDDMMYYYYToISO = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'church') {
      // For church, we store the slug value
      setFormData((prev) => ({
        ...prev,
        [name]: churchOptions[value] || value,
      }));
    // } else if (name === 'birth_date') {
    //   setFormData((prev) => ({ 
    //     ...prev, 
    //     [name]: value ? new Date(value) : null 
    //   }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // const handleDateChange = (date, key) => {
  //   const formattedDate = date ? date.toISOString().split('T')[0] : null;
  //   setFormData((prev) => ({ ...prev, [key]: formattedDate }));
  // };

  // const handleDateChange = (date, fieldName) => {
  //   if (date) {
  //     // Format date as YYYY-MM-DD for API
  //     const formattedDate = date.toISOString().split('T')[0];
  //     setFormData(prev => ({ ...prev, [fieldName]: formattedDate }));
  //   } else {
  //     setFormData(prev => ({ ...prev, [fieldName]: null }));
  //   }
  // };

  const handleDateChange = (value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
       // Validate file type and size
       const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrorMessage('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      if (file.size > maxSize) {
        setErrorMessage('File size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      // uploadProfilePicture(file);
    }
  };


  const uploadProfilePicture = async (file) => {
    setUpdating(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("profile_picture", file);

      const response = await axios.patch(
        "https://tlbc-platform-api.onrender.com/api/user/",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      // Update profile data with new profile picture
      const updatedProfileData = {
        ...profileData,
        profile_picture: response.data.profile_picture || profileData.profile_picture
      };

      setProfileData(updatedProfileData);
      
      // Force a re-render of the profile picture
      const timestamp = new Date().getTime();
      setProfileData(prev => ({
        ...prev,
        profile_picture: `${prev.profile_picture}?t=${timestamp}`
      }));

      alert("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
      
        if (error.response.data.profile_picture) {
          alert(error.response.data.profile_picture[0]);
        } else {
          alert("Failed to upload profile picture");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response from server. Please check your connection.");
      } else {
        console.error("Error setting up request:", error.message);
        alert("An error occurred while uploading profile picture");
      }
    } finally {
      setUpdating(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMessage('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      // Phone validation
      const phoneRegex = /^\+?[0-9\s\-()]+$/;
      if (formData.phone && !phoneRegex.test(formData.phone)) {
        alert('Please enter a valid phone number');
        setUpdating(false);
        return;
      }

      const formDataToSend = new FormData();

      // Add changed fields to formData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== profileData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

       // Add profile picture if changed
       if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }


      const response = await axios.patch(
        'https://tlbc-platform-api.onrender.com/api/user/',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      alert('Profile updated successfully');
      setProfileData(response.data);
      setFormData(response.data);
      setIsEditMode(false);
      setErrorMessage('Profile updated successfully');
    } catch (error) {
      if (error.response?.data) {
        // Extract error message from the first error found
        const firstErrorKey = Object.keys(error.response.data)[0];
        const errorMessage = error.response.data[firstErrorKey][0];
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage('Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditMode(false);
    setErrorMessage('');
    setProfilePicture(null);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };
  
  const handleImageClick = () => {
    setShowImageOptions(true);
  };

  const handleFileSelect = (file) => {
    setProfilePicture(file);
    handleSubmit(null, file);
  };

  const handleViewImage2 = () => {
    const imageUrl = `${profileData.profile_picture}`;
    window.open(imageUrl, '_blank');
    setShowImageOptions(false);
  };

  const handleViewImage = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleUploadImage = () => {
    fileInputRef.current.click();
    setShowImageOptions(false);
  };

  const handleChangePassword = () => {
    navigate('/changepassword');
  };

  // Helper function to get display name from slug
  const getChurchDisplayName = (slug) => {
    return (
      Object.keys(churchOptions).find((key) => churchOptions[key] === slug) ||
      slug
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderField = (key, label, type = 'text') => {
    // if (key === 'birth_date' || key === 'joined_at') {
    //   return (
    //     <div key={key}>
    //       <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
    //       <DatePicker
    //         selected={formData[key] ? new Date(formData[key]) : null}
    //         onChange={(date) => handleDateChange(date, key)}
    //         dateFormat="dd/MM/yyyy"
    //         className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
    //         isClearable
    //         placeholderText="Select date"
    //       />
    //     </div>
    //   );
    // }

    return (
      <div key={key}>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}:
        </label>
        <input
          type={type}
          name={key}
          value={formData[key] || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    );
  };

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        {errorMessage && (
          <div className={`mb-4 p-4 rounded ${
            errorMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <div className="p-7">
              <form onSubmit={handleSubmit}>
                   {/* Action buttons */}
                   <div className="flex justify-end gap-4.5">
                  {isEditMode ? (
                    <>
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                      disabled={updating}
                    >
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="fullName"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
 l                         className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          value={`${profileData.first_name} ${profileData.last_name}`.trim()}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <div className='relative'>
                      <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                      <input
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="text"
                        value={profileData.username}
                        readOnly
                      />
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="email"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="email"
                          value={profileData.email}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phone_number"
                      >
                        Phone Number
                      </label>
                      <div className='relative'>
                        <span className="absolute left-4.5 top-4">
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g opacity="0.8">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4.16667 2.5C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667V5.83333C2.5 11.8167 7.35167 16.6667 13.3333 16.6667H15C15.442 16.6667 15.866 16.4911 16.1785 16.1785C16.4911 15.866 16.6667 15.442 16.6667 15V12.9083C16.6667 12.5333 16.4583 12.1867 16.1233 12.0033L13.62 10.7517C13.2367 10.5417 12.7733 10.5733 12.4233 10.8317L11.3233 11.6667C10.9783 11.9167 10.52 11.96 10.1367 11.7733C9.30331 11.3984 8.55763 10.8779 7.93334 10.2333C7.28876 9.60901 6.76823 8.86334 6.39334 8.03C6.20667 7.64667 6.25 7.18833 6.5 6.84333L7.335 5.74333C7.59333 5.39333 7.625 4.93 7.415 4.54667L6.16334 2.04333C6.07253 1.86008 5.93271 1.70369 5.75751 1.59159C5.58232 1.47948 5.37827 1.41581 5.16834 1.40667H4.16667C3.72464 1.40667 3.30072 1.58226 2.98816 1.89482C2.67559 2.20738 2.5 2.63131 2.5 3.07333V4.16667C2.5 10.15 7.35167 15 13.3333 15H15C15.442 15 15.866 14.8244 16.1785 14.5118C16.4911 14.1993 16.6667 13.7754 16.6667 13.3333V11.2417C16.6667 10.8667 16.4583 10.52 16.1233 10.3367L13.62 9.085C13.2367 8.875 12.7733 8.90667 12.4233 9.165L11.3233 10C10.9783 10.25 10.52 10.2933 10.1367 10.1067C9.30331 9.73175 8.55763 9.21122 7.93334 8.56667C7.28876 7.94238 6.76823 7.1967 6.39334 6.36333C6.20667 5.98 6.25 5.52167 6.5 5.17667L7.335 4.07667C7.59333 3.72667 7.625 3.26333 7.415 2.88L6.16334 0.376667C6.07253 0.193422 5.93271 0.037029 5.75751 -0.075071C5.58232 -0.187171 5.37827 -0.250839 5.16834 -0.26V4.16667Z"
                                  fill=""
                                />
                              </g>
                            </svg>
                        </span>
                      <input
                       className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="tel"
                        value={profileData.phone_number}
                        readOnly
                      />
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="gender"
                      >
                        Gender
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <select
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="gender"
                          name="gender"
                          placeholder="Gender"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="" selected disabled>
                            Select your gender
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="church"
                      >
                        Church
                      </label>
                      <div className='relative'>
                      <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 3C12.3183 3 12.6235 3.12643 12.8485 3.35147L16.2485 6.75147C16.6029 7.10593 16.6029 7.67593 16.2485 8.03053C15.8941 8.38511 15.324 8.38511 14.9696 8.03053L12 5.09696L9.03043 8.03053C8.676 8.38511 8.106 8.38511 7.75157 8.03053C7.39714 7.67593 7.39714 7.10593 7.75157 6.75147L11.1515 3.35147C11.3765 3.12643 11.6817 3 12 3Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4 11C4 9.89543 4.89543 9 6 9H18C19.1046 9 20 9.89543 20 11V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V11ZM6 11H18V20H15V16C15 14.8954 14.1046 14 13 14H11C9.89543 14 9 14.8954 9 16V20H6V11ZM11 20V16H13V20H11Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                      <select
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="text"
                        id="church"
                        name="church"
                        placeholder="Church"
                        value={getChurchDisplayName(formData.church)}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Select a church
                        </option>
                        {Object.keys(churchOptions).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    </div>
                  </div>


                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="birth_date"
                      >
                        Date of Birth (dd/mm/yyyy)
                      </label>
                      <div className="relative">
                        {/* <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span> */}

                         <span className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </span>
                          <input
                            type="date"
                            id="birth_date"
                            value={formData.birth_date || 'N/A'}
                            onChange={(e) => handleDateChange(e.target.value, 'birth_date')}
                            className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                            disabled={!isEditMode}
                          />
                        </div>
                      </div> 

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="joined_at"
                      >
                        When did you join the Ministry? (dd/mm/y)
                      </label>
                      <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </span>
                      <input
                       type="date"
                       id='"joined_at'
                       value={formData.joined_at || 'N/A'}
                       onChange={(e) => handleDateChange(e.target.value, 'joined_at')}
                       className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                      disabled={!isEditMode}
                      />
                    </div>
                    </div>
                  </div>


                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="origin_state"
                      >
                        State of origin
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <select
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="origin_state"
                          name="origin_state"
                          placeholder="State of origin"
                          value={formData.origin_state}
                          onChange={handleChange}
                        >
                          <option value="">State of origin</option>
                          {nigerianStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="address"
                      >
                        Address
                      </label>
                      <div className='relative'>
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 4C9.23858 4 7 6.23858 7 9C7 10.3583 7.67432 11.5775 8.71885 12.3846L12 16.6923L15.2812 12.3846C16.3257 11.5775 17 10.3583 17 9C17 6.23858 14.7614 4 12 4ZM12 2C15.866 2 19 5.13401 19 9C19 10.8861 18.1032 12.5786 16.7026 13.7014C16.7024 13.7015 16.7023 13.7017 16.7021 13.7019L12.7071 18.7069C12.3166 19.0974 11.6834 19.0974 11.2929 18.7069L7.29792 14.7019L7.29741 14.7014C5.89682 13.5786 5 11.8861 5 9C5 5.13401 8.13401 2 12 2Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 8C11.4477 8 11 8.44772 11 9C11 9.55228 11.4477 10 12 10C12.5523 10 13 9.55228 13 9C13 8.44772 12.5523 8 12 8ZM9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5 21C4.44772 21 4 20.5523 4 20C4 19.4477 4.44772 19 5 19H19C19.5523 19 20 19.4477 20 20C20 20.5523 19.5523 21 19 21H5Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                      <input
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="text"
                        id="address"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="perm_address"
                      >
                        Permanent Address
                      </label>
                      <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 4C9.23858 4 7 6.23858 7 9C7 10.3583 7.67432 11.5775 8.71885 12.3846L12 16.6923L15.2812 12.3846C16.3257 11.5775 17 10.3583 17 9C17 6.23858 14.7614 4 12 4ZM12 2C15.866 2 19 5.13401 19 9C19 10.8861 18.1032 12.5786 16.7026 13.7014C16.7024 13.7015 16.7023 13.7017 16.7021 13.7019L12.7071 18.7069C12.3166 19.0974 11.6834 19.0974 11.2929 18.7069L7.29792 14.7019L7.29741 14.7014C5.89682 13.5786 5 11.8861 5 9C5 5.13401 8.13401 2 12 2Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 8C11.4477 8 11 8.44772 11 9C11 9.55228 11.4477 10 12 10C12.5523 10 13 9.55228 13 9C13 8.44772 12.5523 8 12 8ZM9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5 21C4.44772 21 4 20.5523 4 20C4 19.4477 4.44772 19 5 19H19C19.5523 19 20 19.4477 20 20C20 20.5523 19.5523 21 19 21H5Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="perm_address"
                          name="perm_address"
                          placeholder="Permanent address"
                          value={formData.perm_address}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="city"
                      >
                        City
                      </label>
                      <div className='relative'>
                      <span className="absolute left-4.5 top-4">
                      <BiMap size={24} className="bg-gray" />
                      </span>
                      <input
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="text"
                        id="city"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="state"
                      >
                        State of Residence
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                        <BiMap size={24} className="bg-gray" />
                        </span>
                        <select
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="state"
                          name="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={handleChange}
                        >
                          <option value="">State of residence</option>
                          {nigerianStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="country"
                      >
                        Country
                      </label>
                      <div className='relative'>
                      <span className="absolute left-4.5 top-4">
                      <FaFlag size={24} className="bg-gray" />
                      </span>
                     
                      <select
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        id="country"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleChange}
                      >
                       <option value="">Select a country</option>
                        {countries.map((country, index) => (
                          <option key={index} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="invited_by"
                      >
                        Who invited you to the Ministry?
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="invited_by"
                          name="invited_by"
                          placeholder="Who invited you to TLBC?"
                          value={formData.invited_by}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="first_min_arm"
                      >
                        First ministry arm you joined
                      </label>
                      <div className="relative">
                      <span className="absolute left-4.5 top-4">
                      <FaCity size={24} className="bg-gray" />
                      </span>
                      <input
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="text"
                        id="first_min_arm"
                        name="first_min_arm"
                        placeholder="First ministry arm you joined"
                        value={formData.first_min_arm}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="current_min_arm"
                      >
                        Current ministry Arm
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                        <FaCity size={24} className="bg-gray" />
                        </span>
                        <select
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="current_min_arm"
                          name="current_min_arm"
                          placeholder="Current ministry arm"
                          value={formData.current_min_arm}
                          onChange={handleChange}
                        >
                          <option value="" selected disabled>
                            Select ministry arm
                          </option>
                          <option value="TLBC">TLBC</option>
                          <option value="TLBCM">TLBCM</option>
                          <option value="TLTN">TLTN</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="wfs_graduation_year"
                      >
                        Word Foundation School Graduation Year
                      </label>
                      <div className='relative'>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </span>
                      <input
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="tel"
                        id="wfs_graduation_year"
                        name="wfs_graduation_year"
                        placeholder="WFS graduation year"
                        value={formData.wfs_graduation_year}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                  </div>

                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="wts_graduation_year"
                      >
                        Workers Training School Graduation Year
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="wts_graduation_year"
                          name="wts_graduation_year"
                          placeholder="WTS graduation year"
                          value={formData.wts_graduation_year}
                          onChange={handleChange}
                        />
                      </div>
                    </div> 

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="tlsom_graduation_year"
                      >
                        TLOSOM Graduation Year
                      </label>
                      <div className='relative'>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </span>
                      <input
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="tel"
                        id="tlsom_graduation_year"
                        name="tlsom_graduation_year"
                        placeholder="TLOSOM graduation year"
                        value={formData.tlsom_graduation_year}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="current_offices"
                      >
                        Current ministry offices
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                        <FaCity size={24} className="bg-gray" />
                        </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="current_offices"
                          name="current_offices"
                          placeholder="current_offices"
                          value={formData.current_offices}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="previous_offices"
                      >
                        Previous ministry offices
                      </label>
                      <div className="relative">
                      <span className="absolute left-4.5 top-4">
                      <FaCity size={24} className="bg-gray" />
                      </span>
                      <input
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        type="text"
                        id="previous_offices"
                        name="previous_offices"
                        placeholder="Your previous offices"
                        value={formData.previous_offices}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                  </div>
                
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="suspension_record"
                      >
                        Do you have any record of Suspension?
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                        <FaFileAlt size={24} className="bg-gray" />
                        </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="suspension_record"
                          name="suspension_record"
                          placeholder="Suspension record"
                          value={formData.suspension_record}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

              

                  <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="youtube_link"
                      >
                      Youtube Profile link
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                      <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="youtube_link"
                          name="youtube_link"
                          placeholder="Link to your YouTube Profile"
                          value={formData.youtube_link}
                          onChange={handleChange}
                        />
                    </div>
                    </div>

                     
                  
                  </div>
                  



                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="facebook_link"
                      >
                        Facebook Profile link
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="facebook_link"
                          name="facebook_link"
                          placeholder="Link to your Facebook Profile"
                          value={formData.facebook_link}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="instagram_link"
                      >
                        Instagram Profile link
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                      <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="instagram_link"
                          name="instagram_link"
                          placeholder="Link to your Instagram Profile"
                          value={formData.instagram_link}
                          onChange={handleChange}
                        />
                    </div>
                    </div>
                  </div>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="tiktok_link"
                      >
                         TikTok Profile link
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="tiktok_link"
                          name="tiktok_link"
                          placeholder="Link to your TikTok Profile"
                          value={formData.tiktok_link}
                          onChange={handleChange}
                        />
                      </div>
                    </div>                  

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="twitter_link"
                      >
                      Twitter Profile link
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                      <input
                          className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                          type="text"
                          id="twitter_link"
                          name="twitter_link"
                          placeholder="Link to your Twitter Profile"
                          value={formData.twitter_link}
                          onChange={handleChange}
                        />
                    </div>
                    </div>
                  </div>
                  
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="bio"
                    >
                      BIO
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8" clipPath="url(#clip0_88_10224)">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M16.6664 2.39884C16.4185 2.39884 16.1809 2.49729 16.0056 2.67253L8.25216 10.426L7.81167 12.188L9.57365 11.7475L17.3271 3.99402C17.5023 3.81878 17.6008 3.5811 17.6008 3.33328C17.6008 3.08545 17.5023 2.84777 17.3271 2.67253C17.1519 2.49729 16.9142 2.39884 16.6664 2.39884ZM14.8271 1.49402C15.3149 1.00622 15.9765 0.732178 16.6664 0.732178C17.3562 0.732178 18.0178 1.00622 18.5056 1.49402C18.9934 1.98182 19.2675 2.64342 19.2675 3.33328C19.2675 4.02313 18.9934 4.68473 18.5056 5.17253L10.5889 13.0892C10.4821 13.196 10.3483 13.2718 10.2018 13.3084L6.86847 14.1417C6.58449 14.2127 6.28409 14.1295 6.0771 13.9225C5.87012 13.7156 5.78691 13.4151 5.85791 13.1312L6.69124 9.79783C6.72787 9.65131 6.80364 9.51749 6.91044 9.41069L14.8271 1.49402Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_88_10224">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </span>

                      <textarea
                        className="w-full rounded border border-gray-300 bg-gray py-3 pl-12 pr-4 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                        name="bio"
                        id="bio"
                        rows={6}
                        placeholder="Briefly write your bio here"
                        value={formData.bio}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

               
                </form>
              </div>
            </div>
          </div>

          {/* PROFILE PICTURE SECTION */}

          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Your Photo
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={uploadProfilePicture}>
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="relative h-24 w-24 cursor-pointer rounded-full overflow-hidden border-2 border-primary"
                      onClick={handleViewImage}
                    >
                      <img
                        src={profileData?.profile_picture ||  UserIcon }
                        alt="User"
                        className="h-full w-full object-cover"
                         onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = UserIcon;
                    }}
                      />
                    </div>

                    <div>
                      <span className="mb-1.5 text-black dark:text-white">
                        Edit your photo
                      </span>
                      <span className="flex gap-2.5">
                        <Link className="text-sm hover:text-primary"
                        onClick={handleViewImage}>
                          View Photo
                        </Link>
                        <Link
                          className="text-sm hover:text-primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Update
                        </Link>
                      </span>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                  />

                  {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="relative max-w-4xl w-full mx-4 bg-white dark:bg-boxdark rounded-lg overflow-hidden">
                        <div className="relative">
                          <button
                            className="absolute top-4 right-4 p-1 rounded-full bg-white dark:bg-boxdark hover:bg-gray-100 dark:hover:bg-meta-4"
                            onClick={handleCloseModal}
                          >
                            <X className="h-6 w-6 text-black dark:text-white" />
                          </button>
                          <img
                            src={profileData?.profile_picture}
                            alt="Profile"
                            className="w-full h-auto max-h-[80vh] object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                    />
                    
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                            fill="#3C50E0"
                          />
                        </svg>
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                      <p>(max, 800 X 800px)</p>
                    </div>
                  </div>

                  {/* <ProfilePicture
 profileData={profileData}
    onFileSelect={handleFileSelect}
    onUpdateSuccess={(updatedData) => {
      setProfileData(updatedData);
    }}
/> */}

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="submit"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                      disabled={updating}
                      onClick={handleSubmit}
                    >
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>   
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
