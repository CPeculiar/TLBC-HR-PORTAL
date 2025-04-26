import React, { useState, useEffect, useRef } from 'react';
import { X, Download } from 'lucide-react';
import male from '../../../public/user/blackmanprofilepic.jpg';
import female from '../../../public/user/femaleprofilepic.png';

const UserProfileCardAdmin = ({ user, onClose, onDownload, profileCardRef }) => {
  if (!user) return null;
  const [profileImage, setProfileImage] = useState(null);
  const [cachedImage, setCachedImage] = useState(null);
  const imgRef = useRef(null);

  // Handle profile image caching
  useEffect(() => {
    const cacheProfileImage = async () => {
      if (user.profile_picture) {
        try {
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
            console.error("Access token not found for image caching");
            createInitialsFallback();
            return;
          }
          
          // Create a new image element for loading
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          // Add timestamp to prevent caching issues
          const timestamp = new Date().getTime();
          const imageUrl = `${user.profile_picture}?t=${timestamp}`;
          
          // Set up loading handlers
          const imageLoadPromise = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Set a timeout in case the image takes too long
            setTimeout(() => reject(new Error("Image load timeout")), 5000);
          });
          
          // Start loading the image
          img.src = imageUrl;
          
          // Wait for the image to load
          await imageLoadPromise;
          
          // Create a canvas to draw and cache the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          // Get the data URL
          const cachedImageUrl = canvas.toDataURL('image/png');
          setCachedImage(cachedImageUrl);
          setProfileImage(cachedImageUrl);
          
          // Also set it in session storage for backup
          sessionStorage.setItem(`cached_profile_image_${user.email}`, cachedImageUrl);
          
        } catch (err) {
          console.error("Failed to cache image:", err);
          // Try to get from session storage first
          const cachedImg = sessionStorage.getItem(`cached_profile_image_${user.email}`);
          if (cachedImg) {
            setCachedImage(cachedImg);
            setProfileImage(cachedImg);
          } else {
            // Create fallback with initials if no cached version exists
            createInitialsFallback();
          }
        }
      } else {
        // No profile picture, create fallback
        createInitialsFallback();
      }
    };
    
    cacheProfileImage();
  }, [user.profile_picture, user.email]);
  
  // Function to create initials fallback
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
    const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`;
    ctx.fillText(initials, canvas.width/2, canvas.height/2);
    
    // Save as data URL
    const fallbackImage = canvas.toDataURL('image/png');
    setCachedImage(fallbackImage);
    setProfileImage(fallbackImage);
    sessionStorage.setItem(`cached_profile_image_${user.email}`, fallbackImage);
  };

  // Handle image error
  const handleImageError = () => {
    // If image fails to load, use cached version or create initials
    const cachedImg = sessionStorage.getItem(`cached_profile_image_${user.email}`);
    if (cachedImg) {
      setProfileImage(cachedImg);
    } else {
      createInitialsFallback();
    }
  };

  const getDefaultImage = (gender) => {
    if (gender && gender.toLowerCase() === 'male') {
      return male;
    } else if (gender && gender.toLowerCase() === 'female') {
      return female;
    }
    return male; // Default fallback
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto mt-24">
      {/* Main visible profile card */}
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* Controls at the top right */}
        <div className="absolute right-2 top-8 flex space-x-1">
          {/* Download Button */}
          <button 
            onClick={onDownload}
            className="text-primary hover:text-primary-dark"
          >
            <Download size={24} />
          </button>
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header with Profile Picture */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200 dark:border-strokedark">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              <img 
                ref={imgRef}
                src={profileImage || user.profile_picture || getDefaultImage(user.gender)} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">@{user.username}</p>
              <p className="font-semibold mt-1">Role: <span className='text-primary'> {user.role} </span></p>
              {user.groups?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.groups.map(group => (
                    <span key={group} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"> 
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Personal Information</h3>
              <div className="space-y-3">
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={user.phone_number} />
                <InfoRow label="Gender" value={user.gender} />
                <InfoRow label="Birth Date" value={formatDate(user.birth_date)} />
                <InfoRow label="State of Origin" value={user.origin_state} />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Location</h3>
              <div className="space-y-3">
                <InfoRow label="Address" value={user.address} />
                <InfoRow label="Permanent Address" value={user.perm_address} />
                <InfoRow label="City" value={user.city} />
                <InfoRow label="State" value={user.state} />
                <InfoRow label="Country" value={user.country} />
              </div>
            </div>

            {/* Church Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Church Details</h3>
              <div className="space-y-3">
                <InfoRow label="Church" value={user.church} />
                <InfoRow label="Joined Date" value={formatDate(user.joined_at)} />
                <InfoRow label="Invited By" value={user.invited_by} />
                <InfoRow label="First Ministry Arm" value={user.first_min_arm} />
                <InfoRow label="Current Ministry Arm" value={user.current_min_arm} />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Additional Details</h3>
              <div className="space-y-3">
                <InfoRow label="Current Offices" value={user.current_offices} />
                <InfoRow label="Previous Offices" value={user.previous_offices} />
                <InfoRow label="Suspension Record" value={user.suspension_record} />
                <InfoRow label="WFS Graduate" value={user.enrolled_in_wfs ? "Yes" : "No"} />
                <InfoRow label="WFS Graduation Year" value={user.wfs_graduation_year || 'N/A'} />
                <InfoRow label="WTS Graduation Year" value={user.wts_graduation_year || 'N/A'} />
                <InfoRow label="TLSOM Graduation Year" value={user.tlsom_graduation_year || 'N/A'} />
                
                {/* Display Groups */}
                <div className="flex">
                  <span className="text-gray-600 dark:text-gray-400 min-w-[140px]">Groups:</span>
                  <div className="flex flex-wrap">
                    {user.groups?.length > 0 ? (
                      user.groups.map((group, index) => (
                        <span
                          key={index}
                          className="text-black dark:text-white"
                        >
                          {group}
                        </span>
                      ))
                    ) : (
                      <span className="text-black dark:text-white">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden element for download - this will contain the full profile */}
      <div ref={profileCardRef} className="hidden">
        <div className="bg-white p-8 w-[800px]">
          {/* Header with Profile Picture */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={profileImage || user.profile_picture || getDefaultImage(user.gender)} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-600">@{user.username}</p>
              <p className="font-semibold mt-1">Role: <span className='text-primary'> {user.role} </span></p>
              {user.groups?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.groups.map(group => (
                    <span key={group} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"> 
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Personal Information</h3>
              <div className="space-y-3">
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={user.phone_number} />
                <InfoRow label="Gender" value={user.gender} />
                <InfoRow label="Birth Date" value={formatDate(user.birth_date)} />
                <InfoRow label="State of Origin" value={user.origin_state} />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Location</h3>
              <div className="space-y-3">
                <InfoRow label="Address" value={user.address} />
                <InfoRow label="Permanent Address" value={user.perm_address} />
                <InfoRow label="City" value={user.city} />
                <InfoRow label="State" value={user.state} />
                <InfoRow label="Country" value={user.country} />
              </div>
            </div>

            {/* Church Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Church Details</h3>
              <div className="space-y-3">
                <InfoRow label="Church" value={user.church} />
                <InfoRow label="Joined Date" value={formatDate(user.joined_at)} />
                <InfoRow label="Invited By" value={user.invited_by} />
                <InfoRow label="First Ministry Arm" value={user.first_min_arm} />
                <InfoRow label="Current Ministry Arm" value={user.current_min_arm} />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Additional Details</h3>
              <div className="space-y-3">
                <InfoRow label="Current Offices" value={user.current_offices} />
                <InfoRow label="Previous Offices" value={user.previous_offices} />
                <InfoRow label="Suspension Record" value={user.suspension_record} />
                <InfoRow label="WFS Graduate" value={user.enrolled_in_wfs ? "Yes" : "No"} />
                <InfoRow label="WFS Graduation Year" value={user.wfs_graduation_year || 'N/A'} />
                <InfoRow label="WTS Graduation Year" value={user.wts_graduation_year || 'N/A'} />
                <InfoRow label="TLSOM Graduation Year" value={user.tlsom_graduation_year || 'N/A'} />
                
                {/* Display Groups */}
                <div className="flex">
                  <span className="text-gray-600 min-w-[140px]">Groups:</span>
                  <div className="flex flex-wrap">
                    {user.groups?.length > 0 ? (
                      user.groups.map((group, index) => (
                        <span
                          key={index}
                          className="text-black"
                        >
                          {group}
                        </span>
                      ))
                    ) : (
                      <span className="text-black">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
    <span className="text-gray-600 dark:text-gray-400 min-w-[140px]">{label}:</span>
    <span className="text-black dark:text-white">{value || 'N/A'}</span>
  </div>
);

export default UserProfileCardAdmin;