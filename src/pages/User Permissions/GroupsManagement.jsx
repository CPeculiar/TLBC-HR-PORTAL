import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Trash2, X } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  const fetchGroups = async (url = 'https://tlbc-platform-api.onrender.com/api/groups/') => {
    setIsLoading(true);
    try {
      const response = await axios.get(url, {
        withCredentials: true
      });
      setGroups(response.data);
      setCurrentPage(url);
    } catch (error) {
      setError('Failed to fetch groups');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupDetails = async (name) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/groups/${name}/`,
        { withCredentials: true }
      );
      setGroupDetails(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      setError('Failed to fetch group details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsLoading(true);
    try {
      await axios.delete(
        `https://tlbc-platform-api.onrender.com/api/groups/${selectedGroup}/`,
        { withCredentials: true }
      );
      setSuccessMessage('Group successfully deleted');
      setShowDeleteModal(false);
      fetchGroups(currentPage);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setError('Failed to delete group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Breadcrumb pageName="Group Management" className="text-black dark:text-white" />

    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
            <h3 className="font-medium text-black dark:text-white">
              View Groups
            </h3>
            <button
              onClick={() => fetchGroups()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh Groups'}
            </button>
          </div>

          {successMessage && (
            <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md mx-6.5">
              {successMessage}
            </div>
          )}

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
                    <th className="px-4 py-3 text-left">Group Name</th>
                    <th className="px-4 py-3 text-center">View</th>
                    <th className="px-4 py-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.results?.map((group) => (
                    <tr key={group.name} className="border-b dark:border-gray-700">
                      <td className="px-4 py-3">{group.name}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => fetchGroupDetails(group.name)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedGroup(group.name);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => groups.previous && fetchGroups(groups.previous)}
                disabled={!groups.previous}
                className={`px-4 py-2 rounded-md ${
                  groups.previous
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => groups.next && fetchGroups(groups.next)}
                disabled={!groups.next}
                className={`px-4 py-2 rounded-md ${
                  groups.next
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirm Delete</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">
              Are you sure you want to delete the group "{selectedGroup}"?
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{groupDetails?.name} - Permissions</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">Permission Name</th>
                    <th className="px-4 py-2 text-left">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {groupDetails?.permissions.map((permission) => (
                    <tr key={permission.codename} className="border-b dark:border-gray-700">
                      <td className="px-4 py-2">{permission.name}</td>
                      <td className="px-4 py-2 font-mono text-sm">{permission.codename}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>

    </>
  );
};

export default GroupsManagement;