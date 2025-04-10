import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import CoverOne from '../images/cover/cover-01.png';
import userSix from '../images/user/user-06.png';
import UserIcon from '../images/user/user-14.png';

const Profiles = () => {
  const navigate = useNavigate();
  const profilePictureRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    profile_picture: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    church: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('Access token not found. Please login first.');
          navigate('/');
          return;
        }

        const response = await axios.get(
          'https://tlbc-platform-api.onrender.com/api/user/',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          },
        );

        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        alert('Failed to fetch profile data');
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
  }, [navigate]);

  const handleClickOutside = (event) => {
    if (
      profilePictureRef.current &&
      !profilePictureRef.current.contains(event.target)
    ) {
      setShowImageOptions(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      if (file.size > maxSize) {
        alert('File size should be less than 5MB');
        return;
      }

      await uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    setUpdating(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Access token not found. Please login first.');
        navigate('/');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('profile_picture', file);

      const response = await axios.patch(
        'https://tlbc-platform-api.onrender.com/api/user/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        },
      );

      // Update profile data with new profile picture
      const timestamp = new Date().getTime();
      setProfileData((prev) => ({
        ...prev,
        profile_picture: `${response.data.profile_picture}?t=${timestamp}`,
      }));

      alert('Profile picture updated successfully');
      setShowImageOptions(false);
    } catch (error) {
      console.error('Error uploading profile picture:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);

        if (error.response.data.profile_picture) {
          alert(error.response.data.profile_picture[0]);
        } else {
          alert('Failed to upload profile picture');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        alert('An error occurred while uploading profile picture');
      }
    } finally {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          <img
            src={CoverOne}
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          />
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2">
              <img
                src={profileData.profile_picture || UserIcon}
                alt="profile"
                className="h-32 w-32 rounded-full object-cover sm:h-44 sm:w-40"
                onClick={handleImageClick}
              />

              <label
                htmlFor="profile"
                className="absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              >
                <svg
                  className="fill-current"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z"
                    fill=""
                  />
                </svg>

                <input
                  type="file"
                  name="profile"
                  id="profile"
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {`${profileData.first_name} ${profileData.last_name}`}
            </h3>
            <p className="font-medium">
              {profileData.email || 'your email address'}
            </p>

            <div className="mx-auto mt-4.5 mb-5.5 grid max-w-94 grid-cols-3 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
              <div className="flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="block  text-gray-800"> Church:</span>
                <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
                  {' '}
                  {profileData.church || 'N/A'}
                </span>
              </div>

              <div className="flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <span className="block  text-gray-800">Gender:</span>
                <span className="text-sm font-bold text-gray-600">
                  {profileData.gender}
                </span>
              </div>

              <div className="flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <span className="block text-gray-800">DOB:</span>
                <span className="text-sm font-bold text-gray-600">
                  {profileData.birth_date
                    ? new Date(profileData.birth_date).toLocaleDateString(
                        'en-US',
                        {
                          day: 'numeric',
                          month: 'long',
                        },
                      )
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className="mx-auto max-w-180">
              <h4 className="font-semibold text-black dark:text-white">
                About Me
              </h4>
              <p className="text-gray-600">
                <div>
                  {profileData.bio ? (
                    <span>{profileData.bio}</span>
                  ) : (
                    <>
                      <p>
                        {/* I reside at { user.address || 'I reside in an undisclosed location'}. */}

                        {profileData.address
                          ? `I reside at ${profileData.address}.`
                          : profileData.country
                            ? 'I stay in Nigeria.'
                            : 'I reside in Nigeria.'}
                      </p>
                      <p>
                        I joined the ministry on{' '}
                        {profileData.joined_at || 'sometime ago'} and was
                        invited by{' '}
                      </p>

                      <p>{profileData.invited_by || 'a member'}</p>

                      <p>
                        {/* I reside at { user.address || 'I reside in an undisclosed location'}. */}

                        {profileData.current_offices
                          ? `I currently hold these offices: ${profileData.current_offices}.`
                          : ''}
                      </p>

                      <p>
                        Feel free to reach me on{' '}
                        {profileData.phone_number ? (
                          <a href={`tel:${profileData.phone_number}`}>
                            {profileData.phone_number}
                          </a>
                        ) : (
                          'N/A'
                        )}
                        .
                      </p>
                    </>
                  )}
                </div>
              </p>
            </div>

            {/* Social Links - With Specific Icons */}
            <div className="mt-6.5">
              <h4 className="mb-3.5 font-medium text-black dark:text-white">
                Follow me on
              </h4>
              <div className="flex items-center justify-center gap-3.5">
              {profileData.facebook_link && (
                <Link
                  to={profileData.facebook_link}
                  target="_blank"
                  className="hover:text-primary"
                  aria-label="social-icon facebook"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_30_966)">
                      <path
                        d="M12.8333 12.375H15.125L16.0416 8.70838H12.8333V6.87504C12.8333 5.93088 12.8333 5.04171 14.6666 5.04171H16.0416V1.96171C15.7428 1.92229 14.6144 1.83337 13.4227 1.83337C10.934 1.83337 9.16663 3.35229 9.16663 6.14171V8.70838H6.41663V12.375H9.16663V20.1667H12.8333V12.375Z"
                        fill="#1877F2"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_30_966">
                        <rect width="22" height="22" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </Link>
              )}
    {profileData.twitter_link && (
      <Link
        to={profileData.twitter_link}
                  target="_blank"
                  className="hover:text-primary"
                  aria-label="social-icon twitter"
                >
                  <svg
                    className="fill-current"
                    width="23"
                    height="22"
                    viewBox="0 0 23 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_30_970)">
                      <path
                        d="M20.9813 5.18472C20.2815 5.49427 19.5393 5.69757 18.7795 5.78789C19.5804 5.30887 20.1798 4.55498 20.4661 3.66672C19.7145 4.11405 18.8904 4.42755 18.0315 4.59714C17.4545 3.97984 16.6898 3.57044 15.8562 3.43259C15.0225 3.29474 14.1667 3.43617 13.4218 3.83489C12.6768 4.2336 12.0845 4.86726 11.7368 5.63736C11.3891 6.40746 11.3056 7.27085 11.4993 8.0933C9.97497 8.0169 8.48376 7.62078 7.12247 6.93066C5.76118 6.24054 4.56024 5.27185 3.59762 4.08747C3.25689 4.67272 3.07783 5.33801 3.07879 6.01522C3.07879 7.34439 3.75529 8.51864 4.78379 9.20614C4.17513 9.18697 3.57987 9.0226 3.04762 8.72672V8.77439C3.04781 9.65961 3.35413 10.5175 3.91465 11.2027C4.47517 11.8878 5.2554 12.3581 6.12304 12.5336C5.55802 12.6868 4.96557 12.7093 4.39054 12.5996C4.63517 13.3616 5.11196 14.028 5.75417 14.5055C6.39637 14.983 7.17182 15.2477 7.97196 15.2626C7.17673 15.8871 6.2662 16.3488 5.29243 16.6212C4.31866 16.8936 3.30074 16.9714 2.29688 16.8502C4.04926 17.9772 6.08921 18.5755 8.17271 18.5735C15.2246 18.5735 19.081 12.7316 19.081 7.66522C19.081 7.50022 19.0765 7.33339 19.0691 7.17022C19.8197 6.62771 20.4676 5.95566 20.9822 5.18564L20.9813 5.18472Z"
                        fill="#000000"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_30_970">
                        <rect
                          width="22"
                          height="22"
                          fill="white"
                          transform="translate(0.666138)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </Link>
              )}
    {profileData.instagram_link && (
      <Link
        to={profileData.instagram_link}
                  target="_blank"
                  className="hover:text-primary"
                  aria-label="social-icon instagram"
                >
                  <svg
                    className="fill-current"
                    width="23"
                    height="22"
                    viewBox="0 0 23 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_30_974)">
                      <path
                        d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                        fill="url(#instagramGradient)"
                      />
                      <defs>
                        <linearGradient
                          id="instagramGradient"
                          x1="50%"
                          y1="0%"
                          x2="50%"
                          y2="100%"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#F9D200" />
                          <stop offset="30%" stopColor="#F14C4C" />
                          <stop offset="50%" stopColor="#C13584" />
                          <stop offset="70%" stopColor="#8A3AB9" />
                          <stop offset="100%" stopColor="#4C68D7" />
                        </linearGradient>
                      </defs>
                    </g>
                    <defs>
                      <clipPath id="clip0_30_974">
                        <rect
                          width="22"
                          height="22"
                          fill="white"
                          transform="translate(0.333862)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </Link>
              )}
    {profileData.youtube_link && (
      <Link
        to={profileData.youtube_link}
                  target="_blank"
                  className="hover:text-primary"
                  aria-label="social-icon youtube"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path
                      fill="#FF0000"
                      d="M23.498 6.186a3.02 3.02 0 0 0-2.122-2.126C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.515A3.02 3.02 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.02 3.02 0 0 0 2.122 2.126c1.871.515 9.376.515 9.376.515s7.505 0 9.376-.515a3.02 3.02 0 0 0 2.122-2.126C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                    />
                    <polygon
                      fill="#FFFFFF"
                      points="9.75 15.02 15.5 12 9.75 8.98"
                    />
                  </svg>
                </Link>
              )}
    {profileData.tiktok_link && (
      <Link
        to={profileData.tiktok_link}
                  target="_blank"
                  className="hover:text-primary"
                  aria-label="social-icon tiktok"
                >
                  <svg
                    className="fill-current"
                    width="23"
                    height="22"
                    viewBox="0 0 23 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_30_982)">
                      <path
                        d="M16.6 5.82a4.38 4.38 0 0 1-1.05 2.62 4.63 4.63 0 0 1-2.7 1.4v4.64c0 2.61-1.91 5.12-5.16 5.12A5.24 5.24 0 0 1 2 14.2a5.24 5.24 0 0 1 5.16-5.23h1.05v2.62H7.16a2.62 2.62 0 0 0-2.62 2.61c0 1.44 1.18 2.62 2.62 2.62s2.62-1.18 2.62-2.62V2h2.62a4.38 4.38 0 0 0 4.4-4.18v2a4.38 4.38 0 0 1-1.05 2.62z"
                        fill="#000000"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_30_982">
                        <rect
                          width="22"
                          height="22"
                          fill="white"
                          transform="translate(0.666138)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </Link>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profiles;
