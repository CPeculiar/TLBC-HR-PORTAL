import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../../js/services/authService';
import ClickOutside from '../../components/ClickOutside';
import UserOne from '../../images/user/user-01.png';
import '../../css/style.css'



const DashboardHeader = () => {

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [profilePicture, setProfilePicture] = useState('');
    const navigate = useNavigate();
    const trigger = useRef(null);
    const dropdown = useRef(null);
  
    const fetchProfileData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.error("Access token not found");
          alert("Access token not found");
          navigate('/');
          return;
        }
  
        const response = await axios.get(
          "https://api.thelordsbrethrenchurch.org/api/user/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
  
        setUserInfo(response.data);
        setProfilePicture(response.data.profile_picture);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
  
    useEffect(() => {
      fetchProfileData();
    }, []);
  
    const handleLogout = () => {
      authService.logout().then(() => {
        setDropdownOpen(false);
        navigate('/');
      });
    };
  
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };
  
    useEffect(() => {
      const fetchUserInfo = async () => {
        try {
          const info = await authService.getUserInfo();
          setUserInfo(info);
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
      fetchUserInfo();
    }, []);
  
    const handleMenuItemClick = () => {
      // Close dropdown when any menu item is clicked
      setDropdownOpen(false);
    };
  
    const handleViewProfile = () => {
      setDropdownOpen(false);
      navigate('/profile');
    };
  
    const getNamePrefix = () => {
      const pastorNames = ['Name1', 'Name2'];
      if (pastorNames.includes(userInfo.first_name)) return 'Pastor';
      return userInfo.gender === 'Male' ? 'Bro' : 'Sis';
    };
  
    // const displayName = `${getNamePrefix()} ${userInfo.first_name || ''}`;

    const displayName = userInfo
    ? `${getNamePrefix()} ${userInfo.first_name || ''}`
    : '';
  
    // close on click outside
    useEffect(() => {
      const clickHandler = ({ target }) => {
        if (!dropdown.current) return;
        if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
        setDropdownOpen(false);
      };
      document.addEventListener('click', clickHandler);
      return () => document.removeEventListener('click', clickHandler);
    });
  
    // close if the esc key is pressed
    useEffect(() => {
      const keyHandler = ({ keyCode }) => {
        if (!dropdownOpen || keyCode !== 27) return;
        setDropdownOpen(false);
      };
      document.addEventListener('keydown', keyHandler);
      return () => document.removeEventListener('keydown', keyHandler);
    });

  return (
    <div className="mb-6 p-4 rounded-xl Header-colour ">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">Hello,  {displayName || ''}</h2>
          <p className="text-gray-300">Here is your Dashboard overview.</p>
        </div>
        {/* <div className="w-12 h-12">
          <img 
            src={profilePicture || UserOne}
            onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = UserOne;
                        }}
            alt="User"
            className="w-full h-full"
          />
        </div> */}
      </div>
    </div>
  );
};

export default DashboardHeader;