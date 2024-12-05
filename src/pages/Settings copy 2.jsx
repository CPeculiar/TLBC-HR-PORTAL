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
  // const navigate = useNavigate();
  const location = useLocation();
  // const [profileData, setProfileData] = useState({});
  const [showChangePassword, setShowChangePassword] = useState(false);
  // const [formData, setFormData] = useState({});
  // const [loading, setLoading] = useState(true);
  // const [updating, setUpdating] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef(null);
  const profilePictureRef = useRef(null);
  
  // const [formData, setFormData] = useState({
  //   first_name: 'Devid',
  //   last_name: 'Jhon',
  //   email: 'devidjond45@gmail.com',
  //   phone: '+990 3343 7865',
  //   username: 'devidjhon24',
  //   bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere fermentum urna, eu condimentum mauris tempus ut. Donec fermentum blandit aliquet.',
  //   profile_picture: null,
  // });

  const [profileData, setProfileData] = useState({
    profile_picture: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    groups: [],
    birth_date: null,
    gender: '',
    phone_number: '',
    origin_state: '',
    address: '',
    perm_address: '',
    city: '',
    state: '',
    country: '',
    church: '',
    joined_at: null,
    invited_by: null,
    first_min_arm: null,
    current_min_arm: null,
    current_offices: null,
    previous_offices: null,
    suspension_record: null,
    wfs_graduation_year: 0,
    enrolled_in_wfs: false
  });

  const [formData, setFormData] = useState({
    ...profileData
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

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

  
  
  const handleClickOutside = (event) => {
    if (profilePictureRef.current && !profilePictureRef.current.contains(event.target)) {
      setShowImageOptions(false);
    }
  };

//   must i list all the data in the formData?

// is there not a way to render the data without listing all the data in the userData

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


  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <>

<div className="mx-auto max-w-270">
<Breadcrumb pageName="Settings" />

<div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-blue-500"
            value={`${profileData.first_name} ${profileData.last_name}`}
            readOnly
          />  
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Username</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:border-blue-500"
            value={profileData.username}
            readOnly
          />
        </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Email Address
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="email"
              value={profileData.email}
              readOnly
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Phone Number
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.phone_number}
              readOnly
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Gender
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.gender}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Role
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.role}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Church
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.church}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Origin State
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.origin_state}
              readOnly
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Address
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.address || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Permanent Address
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.perm_address || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              City
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.city || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              State
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.state || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Country
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.country || 'N/A'}
              readOnly
            />
          </div>

          
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Birth Date
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.birth_date || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Joined At
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.joined_at || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Invited By
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.invited_by || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              First Ministry Arm
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.first_min_arm || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Current Ministry Arm
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.current_min_arm || 'N/A'}
              readOnly
            />
          </div>


          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Current Offices
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.current_offices || 'N/A'}
              readOnly
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Previous Offices
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.previous_offices || 'N/A'}
              readOnly
            />
          </div>

          
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Suspension Record
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.suspension_record || 'N/A'}
              readOnly
            />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              WFS Graduation Year
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.wfs_graduation_year || 'N/A'}
              readOnly
            />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Enrolled in WFS
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              value={profileData.enrolled_in_wfs ? 'Yes' : 'No'}
              readOnly
            />
          </div>
        </div>
   </div>
   </div>
   </div>
   </div>
    
    </>
  );
};

export default Settings;
