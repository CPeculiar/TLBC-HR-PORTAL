import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeProvider } from "../../utils/ThemeContext";
import ChangePassword from "../../pages/Auth/ChangePassword";
import Sidebar from "../Sidebar";
import Header from "../Header";
import axios from "axios";
import authService from "../../Services/authService";
import Image from "../../assets/images/TLBC_LOGO_removebg.png";
import { Camera, Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { nigerianStates } from "../../utils/nigerianStates";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentTheme } = useThemeProvider();
  const location = useLocation();
  const [profileData, setProfileData] = useState({});
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef(null);
  const profilePictureRef = useRef(null);
  

  const churchOptions = {
    "TLBC Awka": "tlbc-awka",
    "TLBC Ekwulobia": "tlbc-ekwulobia",
    "TLBC Ihiala":  "tlbc-ihiala",
    "TLBC Nnewi": "tlbc-nnewi",
    "TLBC Onitsha": "tlbc-onitsha",
    "TLBCM Agulu": "tlbcm-agulu",
    "TLBCM FUTO": "tlbcm-futo",
    "TLBCM Igbariam": "tlbcm-coou-igbariam",
    "TLBCM Mbaukwu": "tlbcm-mbaukwu",
    "TLBCM Mgbakwu": "tlbcm-mgbakwu",
    "TLBCM NAU": "tlbcm-nau",
    "TLBCM Nekede": "tlbcm-nekede",    
    "TLBCM Oko": "tlbcm-oko",
    "TLBCM Okofia": "tlbcm-okofia",
    "TLBCM Uli": "tlbcm-coou-uli",
    "TLBCM UNILAG": "tlbcm-unilag",
    "TLTN Awka": "tltn-awka",
    "TLTN Agulu": "tltn-agulu"
  };

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
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();

    // Add event listener to close image options when clicking outside
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);
  
  const handleClickOutside = (event) => {
    if (profilePictureRef.current && !profilePictureRef.current.contains(event.target)) {
      setShowImageOptions(false);
    }
  };

  const handleChange = (e) => {
    // setFormData({ ...profileData, [e.target.name]: e.target.value });

    const { name, value } = e.target;
    if (name === "church") {
      // For church, we store the slug value
      setFormData(prev => ({ ...prev, [name]: churchOptions[value] || value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, birth_date: date }));
  };

  const handleFileChange = (e) => {
    // setProfilePicture(e.target.files[0]);
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      handleSubmit(null, file);
    }
  };

  const handleSubmit = async (e, newProfilePicture = null) => {
    if (e) e.preventDefault();
    setUpdating(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      // Phone validation
      const phoneRegex = /^\+?[0-9\s\-()]+$/;
      if (formData.phone && !phoneRegex.test(formData.phone)) {
        alert("Please enter a valid phone number");
        setUpdating(false);
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

      if (newProfilePicture || profilePicture) {
        formDataToSend.append("profile_picture", newProfilePicture || profilePicture);
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
      // Refresh profile data
      // const updatedData = await authService.getUserInfo();
      // setProfileData(updatedData);
      // setFormData(updatedData);
      setProfileData(response.data);
      setFormData({
        ...response.data,
        birth_date: response.data.birth_date ? new Date(response.data.birth_date) : null,
        joined_at: response.data.joined_at ? new Date(response.data.joined_at) : null,
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

  const handleViewImage = () => {
    const imageUrl = `${profileData.profile_picture}`;
    window.open(imageUrl, '_blank');
    setShowImageOptions(false);
  };

  const handleUploadImage = () => {
    fileInputRef.current.click();
    setShowImageOptions(false);
  };

  const handleChangePassword = () => {
    navigate("/changepassword");
  };

  // Helper function to get display name from slug
  const getChurchDisplayName = (slug) => {
    return Object.keys(churchOptions).find(key => churchOptions[key] === slug) || slug;
  };


  const renderField = (key, label, type = "text") => {
    if (key === "birth_date" || key === "joined_at") {
      return (
        <div key={key}>
          <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
          <DatePicker
            selected={formData[key]}
            onChange={(date) => handleDateChange(date, key)}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      );
    }

    if (key === "gender") {
      return (
        <div key={key}>
          <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
          <select
            name={key}
            value={formData[key] || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      );
    }

    if (key === "church") {
      return (
        <div key={key}>
        <label className="block mb-2 capitalize text-sm font-medium text-gray-700">{label}</label>
        <select
            name={key}
            value={getChurchDisplayName(formData[key]) || "" }
            onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
<option value="" disabled>Select a church</option>
                    {Object.keys(churchOptions).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  </div>
                );
              }


    if (key === "origin_state") {
      return (
        <div key={key}>
          <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
          <select
            name={key}
            value={formData[key] || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select state of origin</option>
            {nigerianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      );
    }

    if (key === "state") {
      return (
        <div key={key}>
          <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
          <select
            name={key}
            value={formData[key] || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select state of residence</option>
            {nigerianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      );
    }

    if (key === "enrolled_in_wfs" && !formData.wfs_graduation_year) {
      return (
        <div key={key}>
          <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
          <select
            name={key}
            value={formData[key] ? "Yes" : "No"}
            onChange={(e) => handleChange({
              target: { name: key, value: e.target.value === "Yes" }
            })}
            className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      );
    }

    return (
      <div key={key}>
        <label className="block mb-2 text-sm font-medium text-gray-700">{label}:</label>
        <input
          type={type}
          name={key}
          value={formData[key] || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    );
  };

  const fieldLabels = {
    first_name: "First Name",
    last_name: "Last Name",
    phone: "Phone Number",
    origin_state: "State of Origin",
    address: "Residential Address",
    perm_address: "Permanent Address",
    city: "City of Residence",
    state: "State of Residence",
    country: "Country of Residence",
    birth_date: "Date of Birth",
    gender: "Gender",
    church: "Church",
    joined_at: "When did you join the ministry?",
    invited_by: "Who invited you to the ministry?",
    first_min_arm: "First ministry arm I joined",
    current_min_arm: "Current ministry arm",
    current_offices: "Current ministry office(s)",
    previous_offices: "Previous ministry office(s)",
    suspension_record: "Suspension record (if any)",
    wfs_graduation_year: "Word Foundation School graduation year",
    enrolled_in_wfs: "Enrolled in W.F.S?",
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <h2 className="text-2xl font-bold mb-5">Profile Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start">
               <div className="relative group" ref={profilePictureRef}>
              {/* https://tlbc-platform-api.onrender.com/media/${profileData.profile_picture */}
                <img
                  src={
                    profileData.profile_picture
                    ? `${profileData.profile_picture}`
                    : Image
                  }
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover cursor-pointer"
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

<div className="mt-4 sm:mt-0 sm:ml-6">
                <h3 className="text-xl font-semibold">{`${
                  formData.first_name || ""
                } ${formData.last_name || ""}`}</h3>
                {/* <p>{formData.role || ""}</p> */}
                <p>{formData.email || ""}</p>
              </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
       
       {Object.keys(fieldLabels).map(key => 
                  key !== "profile_picture" && key !== "email" && renderField(key, fieldLabels[key])
                )}                
                
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
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out"
                  disabled={updating}
                >
                    Change Password
                  </button>
                </div>

              </form>
              {showChangePassword && <ChangePassword />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
