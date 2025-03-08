import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage  } from "../../js/services/firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../js/services/FBAuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Registration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
    email: "",
    // profilePicture: null,
  });

  // const handleChange = (e) => {
  //   const { name, value, files } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: files ? files[0] : value,
  //   });
  // };

  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    //First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    }

    //Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Phone validation (allowing for international numbers)
    const phoneRegex = /^\+?[0-9\s\-()]+$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.username) {
      newErrors.username = "Username is required";
    }

    if (!profilePicture) {
      newErrors.profilePicture = "Profile picture is required";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setError((prevErrors) => ({ ...prevErrors, profilePicture: "" }));
    }
  };

  const handleProfilePictureUpload = async (file) => {
    if (!file) return null;
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const fileExtension = file.name.split('.').pop();
      const fileName = `${user.uid}/${Date.now()}.${fileExtension}`; // Add timestamp to prevent conflicts
      const storageRef = ref(storage, `profilePictures/${fileName}`);
      
      console.log('Attempting to upload file:', fileName);
      
      const metadata = {
        contentType: file.type,
      };
  
      const uploadTask = uploadBytes(storageRef, file, metadata);
      
      const snapshot = await uploadTask;
      console.log('Upload successful:', snapshot);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.code === 'storage/unauthorized') {
        throw new Error('User is not authorized to upload files. Please check Firebase Storage rules.');
      }
      throw error;
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

 const handleSubmit = async (event) => {
    event.preventDefault();
    setError({});
    setIsLoading(true);

    try {
      console.log("Starting user registration...");

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      let profilePictureUrl = "";
      if (profilePicture) {
        try {
          profilePictureUrl = await handleProfilePictureUpload(profilePicture);
        } catch (uploadError) {
          console.error('Failed to upload profile picture:', uploadError);
          // Continue with registration even if picture upload fails
        }
      }

      await addDoc(collection(db, "users"), {
        
        
      
        
        profilePicture: profilePictureURL,
      });

        // Prepare user data for Firestore
        const userData = {
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          profilePictureUrl,
  
          profilePictureStatus: profilePictureUrl === "pending" ? "failed" : "uploaded",
          createdAt: new Date().toISOString()
        };
        console.log("Storing user data in Firestore...");
  
        // Store additional user data in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        
        // Update the current user in the auth context
        // setCurrentUser(userCredential.user);
        setCurrentUser({
          ...userCredential.user,
          ...userData
        });
  
         // If profile picture upload failed, show a warning to the user
      if (profilePictureUrl === "pending") {
        alert("Your account was created successfully, but there was an issue uploading your profile picture. You can try uploading it again from your profile settings.");
      }
  
        console.log("Registration successful, redirecting to dashboard...");
        alert("User registered successfully!");
        navigate("/");
      } catch (error) {
        console.error("Error during registration:", error);
        const errorMessage = error.code ? error.code : error.message;
        setError({ form: `Registration failed: ${errorMessage}` });
      } finally {
        setIsLoading(false);
      }
    };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
    <div className="max-w-4xl w-full bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center text-yellow-500 mb-6">Registration Form</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div> <label htmlFor="username" className="block text-gray-700"> Username </label>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required value={formData.username}
        className="form-control w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />      
        </div>
        
        <div> <label htmlFor="firstName" className="block text-gray-700"> First Name </label>
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required value={formData.firstName}
        className="form-control w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />      
        </div>

        <div> <label htmlFor="lastName" className="block text-gray-700"> Last Name </label>
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required value={formData.lastName}
        className="form-control w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />      
        </div>

        <div> <label htmlFor="password" className="block text-gray-700"> Password </label>
        <div className="relative">
        <input  type={passwordVisible ? "text" : "password"} name="password" placeholder="Enter your Password" onChange={handleChange} required 
         className="form-control w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
         value={formData.password}  style={{ paddingRight: '40px' }}   />
         <div className="input-group-append position-absolute end-0 top-50 translate-middle-y" style={{ zIndex: 10, paddingRight: '10px' }}>
                  <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                        onClick={togglePasswordVisibility}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={passwordVisible ? faEyeSlash : faEye}
                          style={{ color: '#6c757d' }}
                        />
                      </button>
                    </div>
                    </div>
                  {error.password && <span className="text-red-500 text-sm">{error.password}</span>}
                </div>

        <div> <label htmlFor="phone" className="block text-gray-700"> Phone </label>
        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required value={formData.phone}
        className="form-control w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />      
        </div>

        <div> <label htmlFor="email" className="block text-gray-700"> Email Address </label>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required value={formData.email}
        className="form-control w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />      
        </div>

        <div> <label htmlFor="profilePicture" className="block text-gray-700"> Profile Picture</label>
        <input type="file" name="profilePicture" onChange={handleProfilePictureChange} accept="image/*" required
        className="form-control w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />      
        </div>

        <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-3 rounded-md font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 hover:bg-yellow-600"
                    style={{ height: '3em', backgroundColor: isHovered ? '#cc8a00' : '#ffc107', 
                    color: isHovered ? "white" : "black", fontSize: "1.1em", fontWeight: "bolder", 
                    border: 'none', transition: 'background-color 0.3s', cursor: 'pointer'  }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>
                  </div>
                  </form>
    </div>
    </div>
  );
};

export default Registration;
