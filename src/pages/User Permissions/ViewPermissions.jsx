import React, { useState } from 'react';
import axios from 'axios';
import { Eye, X } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const ViewPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [currentPage, setCurrentPage] = useState('');

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'https://tlbc-platform-api.onrender.com/api/permissions/',
        { withCredentials: true }
      );
      setPermissions(response.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || error.response?.data?.church?.[0] || 'Failed to fetch permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersByPermission = async (codename, url = `https://tlbc-platform-api.onrender.com/api/permissions/${codename}/users/`) => {
    setIsLoading(true);
    try {
      const response = await axios.get(url, { withCredentials: true });
      setUsersData(response.data);
      setCurrentPage(url);
      setShowUsersModal(true);
    } catch (error) {
      setError('Failed to fetch users for this permission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Permissions View" className="text-black dark:text-white" />

      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
              <h3 className="font-medium text-black dark:text-white">
                View Permissions
              </h3>
              <button
                onClick={fetchPermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh Permissions'}
              </button>
            </div>

            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md mx-6.5">
                {error}
              </div>
            )}

            <div className="p-6.5">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-3 text-left">Permission Name</th>
                      <th className="px-4 py-3 text-center">View Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr 
                        key={permission.codename} 
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-4 py-3">{permission.name}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedPermission(permission);
                              fetchUsersByPermission(permission.codename);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {permissions.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Click 'Refresh Permissions' to load the permissions list
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Modal */}
      {showUsersModal && usersData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Users with "{selectedPermission?.name}" Permission
              </h3>
              <button 
                onClick={() => setShowUsersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">Profile</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Birth Date</th>
                    <th className="px-4 py-2 text-left">Gender</th>
                    <th className="px-4 py-2 text-left">Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.results.map((user, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">
                        {user.profile_picture ? (
                          <img 
                            src={user.profile_picture} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {user.first_name[0]}{user.last_name[0]}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{`${user.first_name} ${user.last_name}`}</td>
                      <td className="px-4 py-2">{user.email || '-'}</td>
                      <td className="px-4 py-2">{user.phone_number || '-'}</td>
                      <td className="px-4 py-2">{user.birth_date || '-'}</td>
                      <td className="px-4 py-2">{user.gender || '-'}</td>
                      <td className="px-4 py-2">
                        {user.groups.length > 0 ? user.groups.join(', ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => usersData.previous && fetchUsersByPermission(selectedPermission.codename, usersData.previous)}
                disabled={!usersData.previous}
                className={`px-4 py-2 rounded-md ${
                  usersData.previous
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => usersData.next && fetchUsersByPermission(selectedPermission.codename, usersData.next)}
                disabled={!usersData.next}
                className={`px-4 py-2 rounded-md ${
                  usersData.next
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewPermissions;