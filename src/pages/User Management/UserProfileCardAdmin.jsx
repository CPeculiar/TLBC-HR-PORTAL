import React from 'react';
import { X } from 'lucide-react';
import male from '../../../public/user/blackmanprofilepic.jpg';
import female from '../../../public/user/femaleprofilepic.png';


const UserProfileCardAdmin = ({ user, onClose }) => {
  if (!user) return null;


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
      <div className="bg-white dark:bg-boxdark rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <div className="p-6 space-y-6">
          {/* Header with Profile Picture */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200 dark:border-strokedark">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              <img 
               src={user.profile_picture || getDefaultImage(user.gender)} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = getDefaultImage(user.gender);
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">@{user.username}</p>
              <p className=" font-semibold mt-1">Role: <span className='text-primary'> {user.role} </span></p>
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