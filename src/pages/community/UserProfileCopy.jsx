import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { XCircle } from 'lucide-react';
import UserMale from '../../images/user/user-12.png'
import UserFemale from '../../images/user/user-02.png'

const UserProfileCard = ({ user, onClose }) => {
  const primaryColor = '#3c50e0';
  const secondaryColor = '#4d0099';
  const textColor = '#333';
  const borderColor = '#ccc';
  const backgroundColor = '#f5f5f5';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <Card className="w-full max-w-4xl">
        <div className="absolute top-2 right-2 cursor-pointer" onClick={onClose}>
          <XCircle size={24} color={textColor} />
        </div>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-6">
            <img
              src={
                user.profile_picture || 
                
                (user.gender === 'Male' ? UserMale : UserFemale )
                
                }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Phone:</span>{' '}
              {user.phone_number}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Gender:</span>{' '}
              {user.gender}
            </p>
            {/* <p>
              <span className="font-medium" style={{ color: primaryColor }}>Birth Date:</span>{' '}
              {user.birth_date ? `${user.birth_date.slice(0, 5)}` : 'N/A'}
            </p> */}
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Address:</span>{' '}
              {user.address || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>City:</span>{' '}
              {user.city || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>State:</span>{' '}
              {user.state || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Church:</span>{' '}
              {user.church || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Joined At:</span>{' '}
              {user.joined_at || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Current Ministry Arm:</span>{' '}
              {user.current_min_arm || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Current Ministry Offices:</span>{' '}
              {user.current_offices || 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-100 px-6 py-4 flex justify-end space-x-4">
        <button
          className="rounded-md px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-opacity-90 transition-colors duration-300"
          onClick={onClose}
        >
          Close
        </button>
      </CardFooter>
    </Card>
    </div>
  );
};

export default UserProfileCard;





/*
MAIN PROFILE CARD

  import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { XCircle } from 'lucide-react';
import UserMale from '../../images/user/user-12.png'
import UserFemale from '../../images/user/user-02.png'

const UserProfileCard = ({ user, onClose }) => {
  const primaryColor = '#3c50e0';
  const secondaryColor = '#4d0099';
  const textColor = '#333';
  const borderColor = '#ccc';
  const backgroundColor = '#f5f5f5';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <Card className="w-full max-w-4xl">
      <div className="absolute top-2 right-2 cursor-pointer" onClick={onClose}>
        <XCircle size={24} color={textColor} />
      </div>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
        <img
              src={
                user.profile_picture || 
                
                (user.gender === 'Male' ? UserMale : UserFemale )
                
                }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-gray-600 mb-4">{user.email}</p>
          <div className="space-y-2">
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Phone:</span>{' '}
              {user.phone_number}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Gender:</span>{' '}
              {user.gender}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Birth Date:</span>{' '}
             cc
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Address:</span>{' '}
              {user.address || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>City:</span>{' '}
              {user.city || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>State:</span>{' '}
              {user.state || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Church:</span>{' '}
              {user.church || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Joined At:</span>{' '}
              {user.joined_at || 'N/A'}
            </p>
            <p>
              <span className="font-medium" style={{ color: primaryColor }}>Current Ministry Arm:</span>{' '}
              {user.current_min_arm || 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-100 px-6 py-4 flex justify-end space-x-4">
        <button
          className="rounded-md px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-opacity-90 transition-colors duration-300"
          onClick={onClose}
        >
          Close
        </button>
      </CardFooter>
    </Card>
  </div>
  );
};

export default UserProfileCard;
  
  
  
  
  
  */