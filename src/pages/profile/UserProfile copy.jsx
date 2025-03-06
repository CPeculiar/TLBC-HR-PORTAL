import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../Services/authService";
import Image from "../../assets/images/TLBC_LOGO_removebg.png";
import ChangePassword from "../../pages/Authentication/ChangePassword";



const ProfileSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState({});
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);

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
        setFormData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChangePassword = () => {
    navigate("/changepassword");
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

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      const formDataToSend = new FormData();

      // const updatedFields = {};

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== profileData[key] && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
          // updatedFields[key] = formData[key];
        }
      });

      if (profilePicture) {
        formDataToSend.append("profile_picture", profilePicture);
      }

      const response = await axios.patch(
        "https://api.thelordsbrethrenchurch.org/api/user/",
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
      setFormData(response.data);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  // Helper function to get display name from slug
  const getChurchDisplayName = (slug) => {
    return Object.keys(churchOptions).find(key => churchOptions[key] === slug) || slug;
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
  
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <h2 className="text-2xl font-bold mb-5">Profile Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-6">
              {/* https://api.thelordsbrethrenchurch.org/media/${profileData.profile_picture */}
                <img
                  src={
                    profileData.profile_picture
                      ? `https://api.thelordsbrethrenchurch.org/api/user/${profileData.profile_picture}`
                      : Image
                  }
                  alt="Profile"
                  className="w-28 h-24 rounded-full mr-4 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Image;
                  }} // Fallback to default image on error
                />
                <h3 className="text-xl font-semibold">{`${
                  formData.first_name || ""
                } ${formData.last_name || ""}`}</h3>
                <p>{formData.role || ""}</p>
              </div>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2">
                  <label className="block mb-2">Profile Picture:</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full p-2 border rounded"
                  />
                </div>
                {Object.entries(formData).map(
                  ([key, value]) =>
                    key !== "profile_picture" &&
                    key !== "email" && 
                    key !== "church" && (
                      <div key={key}>
                        <label className="block mb-2 capitalize">
                          {key.replace("_", " ")}:
                        </label>
                        <input
                          type="text"
                          name={key}
                          value={value || ""}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    )
                )}
                <div>
                  <label className="block mb-2 capitalize">Church:</label>
                  <select
                    name="church"
                    value={getChurchDisplayName(formData.church)}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="" disabled>Select a church</option>
                    {Object.keys(churchOptions).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  </div>
                <div className="md:col-span-2 flex justify-between">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Update Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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

  );
};

export default ProfileSettings
