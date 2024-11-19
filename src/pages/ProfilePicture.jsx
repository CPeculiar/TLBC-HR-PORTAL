import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import userThree from '../images/user/user-03.png';
import { X } from 'lucide-react';
import ChangePassword from '../pages/Authentication/ChangePassword';
import axios from 'axios';
import authService from '../js/services/authService';
import { Camera, Loader } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { nigerianStates } from '../utils/nigerianStates';
import LogoIcon from '../images/logo/logo-icon.svg';
import LogoBG from '../assets/images/TLBC_LOGO_removebg.png';

const ProfilePicture = ({ onUpdateSuccess, onFileSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [formData, setFormData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const profilePictureRef = useRef(null);


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await authService.getUserInfo();
        setProfileData(data);
        setFormData({
          ...data,
          birth_date: data.birth_date ? new Date(data.birth_date) : null,
          joined_at: data.joined_at ? new Date(data.joined_at) : null,
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();

    // Add event listener to close image options when clicking outside
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewImage = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
      setProfilePicture(file);
      handleSubmit(null, file);
    }
  };

  const handleClickOutside = (event) => {
    if (
      profilePictureRef.current &&
      !profilePictureRef.current.contains(event.target)
    ) {
      setShowImageOptions(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/login");
        return;
      }


      const formDataToSend = new FormData();

      // const updatedFields = {};

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== profileData[key] && formData[key] !== "") {
          if (key === 'birth_date' || key === 'joined_at') {
            formDataToSend.append(key, formData[key] ? formData[key].toISOString().split('T')[0] : '');
          } else {
            formDataToSend.append(key, formData[key]);
          // updatedFields[key] = formData[key];
        }
      }
      });

      if (profilePicture) {
        formDataToSend.append("profile_picture", profilePicture);
      }


      const response = await axios.patch(
        "https://tlbc-platform-api.onrender.com/api/user/",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`, // Assuming you have a method to get the token
          },
          withCredentials: true, // This will send cookies with the request
        }
      );

      // await authService.updateProfile(updatedFields);
      alert("Profile updated successfully");
      setProfileData(response.data);
      setFormData({
        ...response.data,
      });

       // Force a re-render of the profile picture
       const timestamp = new Date().getTime();
       setProfileData(prev => ({
         ...prev,
         profile_picture: `${prev.profile_picture}?t=${timestamp}`
       }));
     } catch (error) {
       console.error("Error updating profile:", error);
       alert("Failed to update profile");
     }finally {
      setUpdating(false);
    }
   };

   const handleImageClick = () => {
    setShowImageOptions(true);
  };

  const handleFileSelect = (file) => {
    setProfilePicture(file);
    handleSubmit(null, file);
  };

  const handleUploadImage = () => {
    fileInputRef.current.click();
    setShowImageOptions(false);
  };


  if (loading) {
    return <div>Loading...</div>;
  }








  return (
    <div className="relative">
      {/* Profile Picture Display */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="relative h-24 w-24 cursor-pointer rounded-full overflow-hidden border-2 border-primary"
          onClick={handleViewImage}
          ref={profilePictureRef}
        >
          <img
            src={profileData?.profile_picture || { userThree }}
            alt="User"
            className="h-full w-full object-cover"
            // onClick={handleImageClick}
            onClick={() => setShowImageOptions(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = Image;
                    }}
          />

<div  className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-50 rounded-full cursor-pointer"
                    onClick={() => setShowImageOptions(true)}
                  >
                    <Camera className="text-white" size={24} />
                  </div>

                  {showImageOptions && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-lg z-10">
                      <button onClick={handleViewImage} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        View Profile Picture
                      </button>
                      <button onClick={handleUploadImage} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                        Upload Profile Picture
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />


        <div className="flex flex-col">
          <span className="mb-1.5 text-black dark:text-white">
            Edit your photo
          </span>
          <span className="flex gap-2.5">
            <button
              className="text-sm hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Update
            </button>
          </span>
        </div> 
      </div>

      <form
                onSubmit={handleSubmit}
              > 

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* View Modal */}
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

      {/* File Upload Area */}
      <div className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
          onChange={handleFileChange}
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
            <span className="text-primary">Click to upload</span> or drag and
            drop
          </p>
          <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
          <p>(max, 800 X 800px)</p>
        </div>
      </div>


      <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-center mt-6">
                <button
                  type="submit"
                  className={`w-full sm:w-auto px-6 py-3 rounded-md transition duration-300 ease-in-out mb-4 sm:mb-0 ${
                    updating
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
                  disabled={updating}
                >
                  {updating ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </button>
                </div>



      </form>
    </div>
  );
};

export default ProfilePicture;
