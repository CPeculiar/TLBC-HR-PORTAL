import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const AssignPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupPermissions, setGroupPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  // Helper function to extract error message
  const extractErrorMessage = (err) => {
    return err.response?.data?.detail || 'An unexpected error occurred';
  };

  // Fetch all permissions
  const fetchPermissions = async () => {
    try {
      const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/permissions/');
      setPermissions(response.data);
    } catch (err) {
      setError(error.response?.data?.detail || error.response?.data?.church?.[0] || err.response?.data?.detail || 'Failed to fetch permissions');
    }
  };

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get('https://api.thelordsbrethrenchurch.org/api/groups/');
      setGroups(response.data.results);
      await Promise.all(response.data.results.map(group => fetchGroupPermissions(group.name)));
    } catch (err) {
      // setError('Failed to fetch groups');
      setError(error.response?.data?.detail || error.response?.data?.church?.[0] || err.response?.data?.detail || 'Failed to fetch groups');
    }
  };

  // Fetch permissions for a specific group
  const fetchGroupPermissions = async (groupName) => {
    try {
      const response = await axios.get(`https://api.thelordsbrethrenchurch.org/api/groups/${groupName}/`);
      setGroupPermissions(prev => ({
        ...prev,
        [groupName]: response.data.permissions.map(p => p.codename)
      }));
    } catch (err) {
      console.error(`Failed to fetch permissions for group ${groupName}`);
      setError(error.response?.data?.detail || error.response?.data?.church?.[0] || err.response?.data?.detail || `Failed to fetch permissions for group ${groupName}`);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = async (groupName, permissionCode) => {
    if (updating) return;
    setUpdating(true);
    
    const hasPermission = groupPermissions[groupName]?.includes(permissionCode);
    const requestBody = hasPermission 
      ? { remove_permissions: [permissionCode] }
      : { add_permissions: [permissionCode] };

    try {
      await axios.put(
        `https://api.thelordsbrethrenchurch.org/api/groups/${groupName}/`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      // Update local state
      await fetchGroupPermissions(groupName);
      
      setSuccessMessage(`Permission ${hasPermission ? 'removed from' : 'added to'} ${groupName}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(`Failed to update permission for ${groupName}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchPermissions();
      await fetchGroups();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Loading permissions..</div>
      </div>
    );
  }

  return (
    <>
    <Breadcrumb pageName="Permission Management" className="text-black dark:text-white" />

    <div className="p-4 md:p-6 2xl:p-10">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke p-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Assign Permissions</h3>
        </div>

        {(error || successMessage) && (
          <div className={`m-4 ${
            error 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-green-100 border border-green-400 text-green-700'
          } px-4 py-3 rounded relative`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error || successMessage}</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Groups
                </th>
                {permissions.map(permission => (
                  <th key={permission.codename} className="py-4 px-4 font-medium text-black dark:text-white">
                    {permission.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.name} className="border-b border-[#eee] dark:border-strokedark">
                  <td className="py-5 px-4">
                    <p className="text-black dark:text-white">{group.name}</p>
                  </td>
                  {permissions.map(permission => (
                    <td key={`${group.name}-${permission.codename}`} className="py-5 px-4 text-center">
                      <button
                        onClick={() => handlePermissionToggle(group.name, permission.codename)}
                        disabled={updating}
                        className="transition-colors duration-200"
                      >
                        <CheckCircle2 
                          className={`h-5 w-5 ${
                            groupPermissions[group.name]?.includes(permission.codename)
                              ? 'text-green-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    </>
  );
};

export default AssignPermissions;