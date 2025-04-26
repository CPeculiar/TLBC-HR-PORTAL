import React, { useEffect, useRef, useState } from 'react';
import { XCircle, Download } from 'lucide-react';
import UserIcon from '../../images/user/user-14.png';
import CoverOne from '../../images/cover/cover-01.png';

// This component doesn't use forwardRef, so we'll create our own card
const UserProfileCard = ({ user, onClose, onDownload, profileCardRef }) => {
  const primaryColor = '#3c50e0';
  const [profileImage, setProfileImage] = useState(null);
  const [cachedImage, setCachedImage] = useState(null);
  const imgRef = useRef(null);
  
  // Enhanced effect to handle and cache the profile image
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

  // Get user initials for fallback
  const getUserInitials = () => {
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 mt-18 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      {/* Create our own card component instead of using the imported Card */}
      <div 
        ref={profileCardRef}
        className="w-full max-w-xl mx-auto my-auto rounded-lg shadow-2xl relative bg-white dark:bg-boxdark"
      >
        {/* Controls Bar */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          {/* Download Button */}
          <button
            onClick={onDownload}
            // className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
            title="Download Profile"
          >
            {/* <Download size={20} /> */}
          </button>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 hover:bg-red-500 text-white transition-colors duration-300"
            title="Close"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Cover Image */}
        <div className="relative h-40 md:h-56 w-full">
          <img
            src={CoverOne}
            alt="profile cover"
            className="w-full h-full object-cover rounded-t-lg rounded-tl-sm rounded-tr-sm object-center"
          />
        </div>

        {/* Profile Content */}
        <div className="p-6 text-center">
          {/* Profile Picture */}
          <div className="relative z-30 mx-auto -mt-22">
            <div className="h-36 w-36 mx-auto rounded-full bg-white/20 p-2 backdrop-blur sm:h-44 sm:w-44 sm:p-3">
              <div className="relative drop-shadow-2">
                {profileImage ? (
                  <img
                    ref={imgRef}
                    src={profileImage}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40 profile-image"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full sm:h-40 sm:w-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-400">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <h3 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : 'Profile Name'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {user.email ? (
              <a
                href={`mailto:${user.email}`}
                className="text-blue-600 hover:underline"
              >
                {user.email}
              </a>
            ) : (
              'your email address'
            )}
          </p>

          {/* Stats */}
          <div className="mx-auto mt-4.5 mb-5.5 grid max-w-94 grid-cols-3 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
            <div className="flex-col items-center justify-center gap-1 border-r border-stroke px-1 dark:border-strokedark xsm:flex-row text-center">
              <span className="block text-gray-800 dark:text-white"> Church:</span>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {' '}
                {user.church || 'N/A'}
              </span>
            </div>
            
            <div className="flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="block text-gray-800 dark:text-white">Gender:</span>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {user.gender}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-gray-800 dark:text-white">DOB:</span>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {user.birth_date
                  ? new Date(user.birth_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* About */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              About Me
            </h4>
            <div className="text-gray-600 dark:text-gray-300">
              {user.bio ? (
                <span>{user.bio}</span>
              ) : (
                <>
                  <div>
                    {user.address
                      ? `I reside at ${user.address}.`
                      : user.country
                        ? 'I stay in Nigeria.'
                        : 'I reside in Nigeria.'}
                  </div>
                  <div>
                    I joined the ministry on{' '}
                    {user.joined_at || 'sometime ago'}, and was invited by{' '}
                    {user.invited_by || 'a member'}
                  </div>

                  <div>
                    {user.current_offices
                      ? `I currently hold these offices: ${user.current_offices}.`
                      : ''}
                  </div>

                  <div>
                    Feel free to reach me on{' '}
                    {user.phone_number ? (
                      <a
                        href={`tel:${user.phone_number}`}
                        className="text-blue-600 underline" 
                      >
                        {user.phone_number}
                      </a>
                    ) : (
                      'N/A'
                    )}
                    .
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Social Links - With Specific Icons */}
          <h4 className="mb-1.5 font-medium text-black dark:text-white">
            Follow me on
          </h4>
          <div className="flex justify-center space-x-4">
            {[
              { 
                name: 'facebook', 
                path: 'M12.8333 12.375H15.125L16.0416 8.70838H12.8333V6.87504C12.8333 5.93088 12.8333 5.04171 14.6666 5.04171H16.0416V1.96171C15.7428 1.92229 14.6144 1.83337 13.4227 1.83337C10.934 1.83337 9.16663 3.35229 9.16663 6.14171V8.70838H6.41663V12.375H9.16663V20.1667H12.8333V12.375Z',
                url: user.facebook_link
              },
              { 
                name: 'twitter', 
                path: 'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z',
                url: user.twitter_link
              },
              { 
                name: 'instagram', 
                path: 'M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
                url: user.instagram_link
              },
              { 
                name: 'tiktok', 
                path: 'M16.6 5.82a4.38 4.38 0 0 1-1.05 2.62 4.63 4.63 0 0 1-2.7 1.4v4.64c0 2.61-1.91 5.12-5.16 5.12A5.24 5.24 0 0 1 2 14.2a5.24 5.24 0 0 1 5.16-5.23h1.05v2.62H7.16a2.62 2.62 0 0 0-2.62 2.61c0 1.44 1.18 2.62 2.62 2.62s2.62-1.18 2.62-2.62V2h2.62a4.38 4.38 0 0 0 4.4-4.18v2a4.38 4.38 0 0 1-1.05 2.62z',
                url: user.tiktok_link
              }
            ].map(({ name, path, url }) => (
              url && (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
                  aria-label={`${name} profile`}
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;