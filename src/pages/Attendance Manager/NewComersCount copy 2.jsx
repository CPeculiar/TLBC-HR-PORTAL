import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import { Search, Eye, CheckCircle, X, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from "../../components/ui/alert";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb'; 

const NewComersCount = () => {
    const location = useLocation();
    const refCode = location.state?.refCode || location.pathname.split('/returningNewcomers/')[1];
  
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [detailedProfile, setDetailedProfile] = useState(null);
  
    // State for newcomers search
    const [searchParams, setSearchParams] = useState({ name: "" });
    const [noResults, setNoResults] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const [newcomersList, setNewcomersList] = useState({ 
        results: [], 
        next: null, 
        previous: null,
        count: 0,
        limit: 10
    });
    
    const showAlert = (message, type) => {
      setAlert({ show: true, message, type });
      setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
    };
  
    const fetchDetailedProfile = async (newcomer) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
              console.error("Access token not found");
              alert("Access token not found");
              navigate('/');
              return;
            }

            setIsLoading(true);
            const response = await axios.get(
                `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/newcomers/${newcomer.slug}/admin/`,
                {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                }
            );
            setDetailedProfile(response.data);
            setSelectedProfile(newcomer);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            showAlert(error.response?.data?.message || "Error fetching profile details", "error");
        }
    };

    // Function to handle pagination
    const handlePagination = async (url) => {
        if (!url) return;
        
        try {
            setIsLoading(true);
            const response = await axios.get(url);
            setNewcomersList(response.data);
            setNoResults(response.data.results.length === 0);
        } catch (error) {
            showAlert(error.response?.data?.message || "Error fetching data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to clear results
    const handleClear = () => {
        setNewcomersList({ 
            results: [], 
            next: null, 
            previous: null,
            count: 0,
            limit: 10
        });
        setSearchParams({ name: "" });
        setNoResults(false);
    };

    // Newcomers search
    const searchNewcomers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.error("Access token not found");
          alert("Access token not found");
          navigate('/');
          return;
        }

        setIsLoading(true);
        const response = await axios.get(
          `https://tlbc-platform-api.onrender.com/api/attendance/${refCode}/newcomers/search/`,
          {
            params: {
              s: searchParams.name,
              ref_code: refCode
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        setNewcomersList(response.data);
        setNoResults(response.data.results.length === 0);
      } catch (error) {
        showAlert(error.response?.data?.message || "Error searching newcomers", "error");
        setNoResults(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Create a reference to the profile card element
    const profileCardRef = useRef(null);
    
    // Function to handle profile clicks in the results table
    const handleProfileClick = (newcomer) => {
        fetchDetailedProfile(newcomer);
    };

    const ProfileModal = ({ newcomer }) => {
        if (!detailedProfile) return null;
        
        // Prevent body scroll when modal is open
        useEffect(() => {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'auto';
            };
        }, []);

        // Ref for the displayed profile image
        const displayedImageRef = useRef(null);
        // State to store the cached profile image
        const [cachedImage, setCachedImage] = useState(null);
        
        // Cache the profile image as soon as we have a profile
        useEffect(() => {
            const cacheProfileImage = async () => {
                if (detailedProfile.profile_picture) {
                    try {
                        const accessToken = localStorage.getItem("accessToken");
                        
                        // Try to fetch the image with authorization
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        
                        // Add timestamp to prevent caching issues
                        const timestamp = new Date().getTime();
                        const imageUrl = `${detailedProfile.profile_picture}?t=${timestamp}`;
                        
                        img.src = imageUrl;
                        
                        // Wait for the image to load
                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                            // Set a timeout in case the image takes too long
                            setTimeout(resolve, 3000);
                        });
                        
                        // Create a canvas to draw and cache the image
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        // Get the data URL
                        const cachedImageUrl = canvas.toDataURL('image/png');
                        setCachedImage(cachedImageUrl);
                        
                        // Also set it in session storage for backup
                        sessionStorage.setItem('cached_profile_image', cachedImageUrl);
                        
                        // If we have a display element, apply the cached image
                        if (displayedImageRef.current) {
                            displayedImageRef.current.src = cachedImageUrl;
                        }
                    } catch (err) {
                        console.error("Failed to cache image:", err);
                        // Create fallback with initials
                        createInitialsFallback();
                    }
                } else {
                    // No profile picture, create fallback
                    createInitialsFallback();
                }
            };
            
            cacheProfileImage();
        }, [detailedProfile.profile_picture]);
        
        // Function to create a canvas with initials as fallback
        const createInitialsFallback = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw text
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const initials = `${detailedProfile.first_name.charAt(0)}${detailedProfile.last_name.charAt(0)}`;
            ctx.fillText(initials, canvas.width/2, canvas.height/2);
            
            // Save as data URL
            const fallbackImage = canvas.toDataURL('image/png');
            setCachedImage(fallbackImage);
            sessionStorage.setItem('cached_profile_image', fallbackImage);
            
            // Apply to displayed image if it exists
            if (displayedImageRef.current) {
                displayedImageRef.current.src = fallbackImage;
            }
        };

        // Improved download function with better image handling
        const handleDownload = async () => {
            try {
                setIsLoading(true);
                showAlert("Preparing download...", "success");
                
                if (!profileCardRef.current) {
                    throw new Error("Profile card element not found");
                }
                
                // Get the cached image or fallback
                const profileImageSource = cachedImage || 
                                           sessionStorage.getItem('cached_profile_image') ||
                                           null;
                
                // Create a clone for capture
                const clone = profileCardRef.current.cloneNode(true);
                
                // Apply inline styles to ensure proper rendering
                applyStylesToClone(clone);
                
                // If we have a cached image, make sure it's used in the clone
                if (profileImageSource) {
                    const imgElements = clone.querySelectorAll('img.profile-image');
                    imgElements.forEach(img => {
                        img.src = profileImageSource;
                        img.crossOrigin = 'anonymous';
                    });
                    
                    // Also handle any img elements that might be using the original URL
                    const allImages = clone.querySelectorAll('img');
                    allImages.forEach(img => {
                        if (img.src.includes(detailedProfile.profile_picture)) {
                            img.src = profileImageSource;
                            img.crossOrigin = 'anonymous';
                        }
                    });
                }
                
                // Add clone to the document outside the viewport
                document.body.appendChild(clone);
                clone.style.position = 'absolute';
                clone.style.left = '-9999px';
                clone.style.top = '0';
                clone.style.width = '1000px'; // Fixed width for better quality
                clone.style.transform = 'none';
                
                // Wait for any async operations to complete
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Capture with html2canvas with optimized settings
                const canvas = await html2canvas(clone, {
                    scale: 2, // Higher scale for better quality
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                    imageTimeout: 5000,
                    removeContainer: true,
                    foreignObjectRendering: false // More compatible approach
                });
                
                // Remove the clone
                document.body.removeChild(clone);
                
                // Convert to image and trigger download
                const image = canvas.toDataURL("image/png", 1.0);
                const link = document.createElement("a");
                link.href = image;
                link.download = `${detailedProfile.first_name}_${detailedProfile.last_name}_profile.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showAlert("Profile downloaded successfully", "success");
            } catch (error) {
                console.error("Download error:", error);
                showAlert("Failed to download profile: " + error.message, "error");
            } finally {
                setIsLoading(false);
            }
        };
        
        // Helper function to apply necessary styles to clone for accurate rendering
        const applyStylesToClone = (clone) => {
            // Make sure all elements have their computed styles applied inline
            const allElements = clone.querySelectorAll('*');
            allElements.forEach(el => {
                // Apply key styles that might affect layout
                el.style.maxHeight = 'none';
                el.style.overflow = 'visible';
            });
            
            // Ensure the clone itself has the right styling
            clone.style.maxHeight = 'none';
            clone.style.height = 'auto';
            clone.style.overflow = 'visible';
            clone.style.backgroundColor = '#ffffff';
            
            // Make sure tables have proper width
            const tables = clone.querySelectorAll('table');
            tables.forEach(table => {
                table.style.width = '100%';
                table.style.tableLayout = 'fixed';
            });
        };

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] overflow-y-auto pt-16 sm:pt-20 md:pt-16 md:pl-16 lg:pl-64">
                <div className="min-h-screen w-full flex items-center justify-center py-4 px-2 sm:px-4">
                    {/* Modal container with improved positioning */}
                    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden my-4"> 
                        <Card className="relative">
                            {/* Alert Section */}
                            {alert.show && (
                                <Alert className={`absolute top-0 mt-4 left-0 right-0 z-20 mx-4 ${alert.type === "success" ? "bg-green-500 text-white" : "bg-red-200 text-red-900"}`}>
                                    <AlertDescription className="text-sm sm:text-base">
                                        {alert.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Control Buttons */}
                            <div className="sticky top-0 left-0 right-0 z-20 flex justify-end items-center p-3 bg-white/95 dark:bg-gray-800/95 border-b border-gray-100 dark:border-gray-700">
                                {/* Download Button */}
                                <button 
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={isLoading}
                                    className="text-white bg-blue-600 hover:bg-blue-700 transition-colors p-2 rounded-full shadow-md flex items-center justify-center mr-3"
                                    title="Download Profile"
                                >
                                    <Download className="h-5 w-5" />
                                </button>
                                
                                {/* Close Button */}
                                <button 
                                    onClick={() => {
                                        setSelectedProfile(null);
                                        setDetailedProfile(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full bg-white/80 dark:bg-gray-700 shadow-md"
                                    title="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                          {/* Profile Card Content - Referenced for downloading */}
                          <div ref={profileCardRef} data-profile-card className="flex flex-col md:flex-row">
                                {/* Left Column - Profile Image */}
                                <div className="w-full md:w-1/3 bg-gradient-to-b from-blue-500 to-blue-700 p-4 sm:p-6 flex flex-col items-center justify-start">
                                    <div className="relative mb-4 w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        {detailedProfile.profile_picture || cachedImage ? (
                                            <img 
                                                ref={displayedImageRef}
                                                src={cachedImage || detailedProfile.profile_picture} 
                                                alt={`${detailedProfile.first_name} ${detailedProfile.last_name}`} 
                                                className="w-full h-full object-cover profile-image"
                                                onError={(e) => {
                                                    // Fallback to initials if image fails
                                                    const target = e.target;
                                                    const parent = target.parentNode;
                                                    const text = document.createElement('div');
                                                    text.className = "w-full h-full bg-gray-200 flex items-center justify-center";
                                                    text.innerHTML = `<span class="text-2xl sm:text-3xl font-bold text-gray-400">
                                                        ${detailedProfile.first_name.charAt(0)}${detailedProfile.last_name.charAt(0)}
                                                    </span>`;
                                                    parent.replaceChild(text, target);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-2xl sm:text-3xl font-bold text-gray-400">
                                                    {detailedProfile.first_name.charAt(0)}{detailedProfile.last_name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h2 className="text-xl sm:text-2xl font-bold text-white text-center mt-2">
                                        {`${detailedProfile.first_name} ${detailedProfile.last_name}`}
                                    </h2>

                                    <div className="mt-4 text-white space-y-2 w-full">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                                                {detailedProfile.occupation || "Member"}
                                            </span>
                                        </div>
                                        
                                        {detailedProfile.want_to_be_member && (
                                            <div className="flex items-center justify-center gap-2 mt-4">
                                                <CheckCircle className="h-5 w-5 text-green-300" />
                                                <span className="text-sm">Interested in Membership</span>
                                            </div>
                                        )}
                                        
                                        <div className="pt-6 pb-2">
                                            <h3 className="text-lg font-semibold border-b border-blue-400 pb-2 mb-3">Contact Info</h3>
                                            <div className="space-y-3 text-sm">
                                                <p className="flex items-center gap-2 break-words">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="break-all">{detailedProfile.email}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span>{detailedProfile.phone_number}</span>
                                                </p>
                                                <p className="flex items-start gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="break-words">{detailedProfile.address}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Column - Profile Details */}
                                <div className="w-full md:w-2/3 p-4 sm:p-6 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
                                    <CardHeader className="px-0 pt-0">
                                        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2">
                                            Profile Information
                                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                (First visit: {detailedProfile.first_visit_date})
                                            </span>
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="px-0 space-y-6 sm:space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg border-b border-gray-200 pb-2">
                                                    Personal Information
                                                </h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                                                        <p className="font-medium">{detailedProfile.gender}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Birth Date</p>
                                                        <p className="font-medium">{detailedProfile.birth_date}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Marital Status</p>
                                                        <p className="font-medium">{detailedProfile.marital_status}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Occupation</p>
                                                        <p className="font-medium">{detailedProfile.occupation || "Not specified"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg border-b border-gray-200 pb-2">
                                                    Church Information
                                                </h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Invited By</p>
                                                        <p className="font-medium">{detailedProfile.invited_by}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Interested Department</p>
                                                        <p className="font-medium">{detailedProfile.interested_department}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Membership Interest</p>
                                                        <p className="font-medium flex items-center gap-2">
                                                            {detailedProfile.want_to_be_member ? (
                                                                <>
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    <span>Yes</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <X className="h-4 w-4 text-red-500" />
                                                                    <span>No</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attendance Events Table */}
                                        <div>
                                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg border-b border-gray-200 pb-2 mb-4">
                                                Attendance History 
                                                <span className="font-normal text-gray-500 ml-2">
                                                    (Attended {detailedProfile.attendances.count} {detailedProfile.attendances.count === 1 ? "meeting" : "meetings"})
                                                </span>
                                            </h3>
                                            
                                            {detailedProfile.attendances.events.length > 0 ? (
                                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                                            <tr>
                                                                <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Program</th>
                                                                <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Name</th>
                                                                <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Venue</th>
                                                                <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                                            {detailedProfile.attendances.events.map((event, index) => (
                                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{event.program}</td>
                                                                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{event.name}</td>
                                                                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{event.venue}</td>
                                                                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{event.date}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    No attendance records yet
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <Breadcrumb pageName="New Comers" className="text-black dark:text-white" />
            
            <div className="space-y-6">
                {/* Alert Section */}
                {alert.show && (
                    <Alert className={`w-full ${alert.type === "success" ? "bg-green-500 text-white" : "bg-red-200 text-red-900"}`}>
                        <AlertDescription className="text-sm sm:text-base">
                            {alert.message}
                        </AlertDescription>
                    </Alert>
                )}

               {/* Newcomers Search Section */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search
                </h3>
            </div>
            <div className="p-4 sm:p-6">
                <div className="space-y-4">
                <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter Name
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Search by name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={searchParams.name}
                        onChange={(e) => setSearchParams({ name: e.target.value })}
                    />
                    <button
                        onClick={searchNewcomers}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </button>
                    </div>
                </div>
            
                                        {/* No Results Message */}
            {noResults && (
                <div className="mt-4 rounded-md bg-gray-100 p-4 text-center dark:bg-gray-700">
                <p className="text-red-500 dark:text-red-300">No results found</p>
                </div>
            )}
            
            {/* Results Table */}
            {newcomersList.results.length > 0 && (
                <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="min-w-full divide-y divide-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                        {['Name', 'Email', 'Phone', 'Profile'].map((header) => (
                            <th 
                            key={header}
                            className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-white"
                            >
                            {header}
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {newcomersList.results.map((newcomer, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                            {`${newcomer.first_name} ${newcomer.last_name}`}
                            </td>
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-300 max-w-[120px] truncate">
                            {newcomer.email}
                            </td>
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                            {newcomer.phone_number}
                            </td>
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm">
                            <button 
                                onClick={() => handleProfileClick(newcomer)}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                            >
                                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            )}
            </div>
            
                   {/* Pagination Controls */}
                {newcomersList.results.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                        onClick={() => handlePagination(newcomersList.previous)}
                        disabled={!newcomersList.previous || isLoading}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePagination(newcomersList.next)}
                        disabled={!newcomersList.next || isLoading}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-500 text-center w-full sm:w-auto my-2 sm:my-0">
                    Showing {newcomersList.results.length} of {newcomersList.count} results
                    </div>
                    
                    <button
                    onClick={handleClear}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors w-full sm:w-auto"
                    >
                    Clear Results
                    </button>
                </div>
                )}
            </div>
            </div>
                    </div>
            
                    {/* Profile Modal */}
                    {selectedProfile && detailedProfile && <ProfileModal newcomer={selectedProfile} />}
                </div>
            );
            };
            
            export default NewComersCount;