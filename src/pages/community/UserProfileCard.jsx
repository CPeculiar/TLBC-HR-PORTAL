import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../components/ui/card';
import { XCircle } from 'lucide-react';
import UserMale from '../../images/user/user-12.png';
import UserFemale from '../../images/user/user-02.png';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import CoverOne from '../../images/cover/cover-01.png';
import userSix from '../../images/user/user-06.png';
import { Link } from 'react-router-dom';

const UserProfileCard = ({ user, onClose }) => {
  const primaryColor = '#3c50e0';
  const secondaryColor = '#4d0099';
  const textColor = '#3c50e0';
  const borderColor = '#ccc';
  const backgroundColor = '#f5f5f5';

  return (
    <div className="fixed inset-0 z-50 mt-18 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <Card className="w-full max-w-xl mx-auto my-auto rounded-lg shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-red-500"
        >
          <XCircle size={24} />
        </button>

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
                <img
                  src={user.profile_picture || userSix}
                  alt="profile"
                  className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40"
                />
              </div>
            </div>
          </div>

          {/* User Info */}
          <h3 className="mt-2 text-2xl font-bold text-gray-800 mb-2">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : 'Profile Name'}
          </h3>
          <p className="text-gray-600 mb-4">
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
              <span className="block  text-gray-800"> Church:</span>
              <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
                {' '}
                {user.church || 'N/A'}
              </span>
            </div>
            
            <div className="flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
              <span className="block  text-gray-800">Gender:</span>
              <span className="text-sm font-bold text-gray-600">
                {user.gender}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-gray-800">DOB:</span>
              <span className="text-sm font-bold text-gray-600">
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
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              About Me
            </h4>
            <p className="text-gray-600">
              <div>
                {user.bio ? (
                  <span>{user.bio}</span>
                ) : (
                  <>
                    <p>
                      {/* I reside at { user.address || 'I reside in an undisclosed location'}. */}

                      {user.address
                        ? `I reside at ${user.address}.`
                        : user.country
                          ? 'I stay in Nigeria.'
                          : 'I reside in Nigeria.'}
                    </p>
                    <p>
                      I joined the ministry on{' '}
                      {user.joined_at || 'sometime ago'}, and was invited by{' '}
                    </p>

                    <p>
                    {user.invited_by || 'a member'}
                    </p>

                    <p>
                      {/* I reside at { user.address || 'I reside in an undisclosed location'}. */}

                      {user.current_offices
                        ? `I currently hold these offices: ${user.current_offices}.`
                        : ''}
                    </p>

                    <p>
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
                    </p>
                  </>
                )}
              </div>
            </p>
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
    url: 'https://web.facebook.com/thelordsbrethrenchurchintl'
    },
    { 
    name: 'twitter', 
    path: 'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z',
    url: 'https://x.com/ElochukwuTLBC'
     },
    { 
    name: 'instagram', 
    path: 'M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    url: 'https://www.instagram.com/thelordsbrethrenchurchintl'
     },
    { 
    name: 'tiktok', 
    path: 'M16.6 5.82a4.38 4.38 0 0 1-1.05 2.62 4.63 4.63 0 0 1-2.7 1.4v4.64c0 2.61-1.91 5.12-5.16 5.12A5.24 5.24 0 0 1 2 14.2a5.24 5.24 0 0 1 5.16-5.23h1.05v2.62H7.16a2.62 2.62 0 0 0-2.62 2.61c0 1.44 1.18 2.62 2.62 2.62s2.62-1.18 2.62-2.62V2h2.62a4.38 4.38 0 0 0 4.4-4.18v2a4.38 4.38 0 0 1-1.05 2.62z',
    url: 'https://www.tiktok.com/@elochukwutlbc?_t=8s0IAvnfm0T&_r=1'
     }
  ].map(({ name, path, url }) => (
    <a
      key={name}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-blue-500"
      aria-label={`${name} profile`}
    >
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d={path} />
      </svg>
    </a>
  ))}
</div>
<div className="bg-gray-100 px-1 flex justify-end space-x-4">
        <button
          className="rounded-md px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-opacity-90 transition-colors duration-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
        
        </div>

        
       
      </Card>
    </div>
  );
};

export default UserProfileCard;
