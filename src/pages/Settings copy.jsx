import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import userThree from '../images/user/user-03.png';
import ChangePassword from "../pages/Authentication/ChangePassword";
import axios from "axios";
import authService from "../js/services/authService";
import { Camera, Loader } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { nigerianStates } from "../utils/nigerianStates";
import LogoIcon from '../images/logo/logo-icon.svg';
import LogoBG from '../assets/images/TLBC_LOGO_removebg.png';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState({});
  const [showChangePassword, setShowChangePassword] = useState(false);
  // const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef(null);
  const profilePictureRef = useRef(null);
  
  const [formData, setFormData] = useState({
    first_name: 'Devid',
    last_name: 'Jhon',
    email: 'devidjond45@gmail.com',
    phone: '+990 3343 7865',
    username: 'devidjhon24',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere fermentum urna, eu condimentum mauris tempus ut. Donec fermentum blandit aliquet.',
    profile_picture: null,
  });


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
        <div key={key} className="col-span-1 mb-5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">{label}:</label>
          <DatePicker
            selected={formData[key]}
            onChange={(date) => handleDateChange(date, key)}
            dateFormat="yyyy-MM-dd"
            className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
           
          />
        </div>
      );
    }

    if (key === "gender") {
      return (
        <div key={key}>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">{label}:</label>
          <select
            name={key}
            value={formData[key] || ""}
            onChange={handleChange}
        className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
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
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">{label}</label>
        <select
            name={key}
            value={getChurchDisplayName(formData[key]) || "" }
            onChange={handleChange}
                className="w-full rounded border border-stroke bg-gray py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
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
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">{label}:</label>
          <select
            name={key}
            value={formData[key] || ""}
            onChange={handleChange}
          className="w-full rounded border border-stroke bg-gray py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
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
           className="w-full rounded border border-stroke bg-gray py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
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
            className="w-full rounded border border-stroke bg-gray py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      );
    }

    <div key={key}>
      <label
        className="mb-3 block text-sm font-medium text-black dark:text-white"
        htmlFor={key}
      >
        {label}
      </label>

    {key === 'bio' ? (
      <div className="relative">
        <span className="absolute left-4.5 top-4">
        </span>
        <textarea
          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          name="bio"
          id="bio"
          rows={6}
          placeholder="Write your bio here"
          defaultValue={formData.bio}
          onChange={handleChange}
        ></textarea>
      </div>
    ) : (
      <input
        className={`w-full rounded border border-stroke bg-gray py-3 ${
          key === 'email'
            ? 'pl-11.5 pr-4.5'
            : 'px-4.5'
        } text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary`}
        type={key === 'phone' ? 'tel' : 'text'}
        name={key}
        id={key}
        placeholder={fieldLabels[key]}
        defaultValue={formData[key]}
        onChange={handleChange}
      />
    )}
    </div>

  



    return (
      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
      <div className="w-full sm:w-1/2">
      <div key={key}>
     
        <label className="mb-3 block text-sm font-medium text-black dark:text-white"  
        htmlFor={key}
        >{label}:
        </label>
        <div className="relative">
        <span className="absolute left-4.5 top-4"></span>
        <input
          type={type}
          name={key}
          id={key}
          value={formData[key] || ""}
          onChange={handleChange}
          placeholder={fieldLabels[key]}
          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          />
          
      </div>
      </div>
      </div>

    
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

    username: 'Username',
    bio: 'Bio',
    profile_picture: 'Profile Picture',
    email: 'Email Address',
  };


  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }



  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      <div className="col-span-1 xl:col-span-3">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                {Object.keys(fieldLabels).map((key) =>
                    key !== 'profile_picture' ? renderField(key, fieldLabels[key]) : null
                  )}
                  </div>
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
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="fullName"
                          id="fullName"
                          placeholder="Devid Jhon"
                          defaultValue="Devid Jhon"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phoneNumber"
                      >
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="+990 3343 7865"
                        defaultValue="+990 3343 7865"
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
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
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="email"
                        name="emailAddress"
                        id="emailAddress"
                        placeholder="devidjond45@gmail.com"
                        defaultValue="devidjond45@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="Username"
                    >
                      Username
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="Username"
                      id="Username"
                      placeholder="devidjhon24"
                      defaultValue="devidjhon24"
                    />
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="Username"
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
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="bio"
                        id="bio"
                        rows={6}
                        placeholder="Write your bio here"
                        defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere fermentum urna, eu condimentum mauris tempus ut. Donec fermentum blandit aliquet."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="submit"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Your Photo
                </h3>
              </div>
              <div className="p-7">
                <form action="#">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full">
                      <img src={userThree} alt="User" />
                    </div>
                    <div>
                      <span className="mb-1.5 text-black dark:text-white">
                        Edit your photo
                      </span>
                      <span className="flex gap-2.5">
                        <button className="text-sm hover:text-primary">
                          Delete
                        </button>
                        <button className="text-sm hover:text-primary">
                          Update
                        </button>
                      </span>
                    </div>
                  </div>

                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                  >
                    <input
                      type="file"
                      accept="image/*"
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

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="submit"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Save
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
