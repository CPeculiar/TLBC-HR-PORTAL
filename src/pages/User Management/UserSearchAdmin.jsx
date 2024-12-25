import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Eye, X, Search, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import User from '../../images/user/user-09.png'
import UserProfileCard from '../community/UserProfileCard';

const UserSearchAdmin = ({  deleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);  // Track modal visibility
  const [deleting, setDeleting] = useState(false); // State to track deleting status
  const [deleteSuccess, setDeleteSuccess] = useState(false); 
  const [deletionMessage, setDeletionMessage] = useState(''); // State to track success or error message
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [userToDelete, setUserToDelete] = useState(null); // State to track which user is being deleted
  
  const navigate = useNavigate();

  const primaryColor = '#3c50e0';
  const secondaryColor = '#4d0099';
  const textColor = '#333';
  const borderColor = '#ccc';
  const backgroundColor = '#f5f5f5';


  const fetchUsers = async (page) => {
    // Reset previous error
    setError(null);
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/");
        return;
      }


      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/users/?page=${page}&s=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      const data = response.data;
      
  // Safely handle potentially undefined data
  setUsers(data.results || []);
  setTotalPages(data.count ? Math.ceil(data.count / data.limit) : 1);
  setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      setUsers([]); // Ensure users is an empty array on error
      setTotalPages(1);
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchUsers(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      fetchUsers(currentPage + 1);
    }
  };

  // New method to clear search results
  const clearSearchResults = () => {
    setSearchTerm('');
    setUsers([]);
    setCurrentPage(1);
    setTotalPages(1);
  };

  const showProfileCard = () => {
    // show the profileCard
    
    showProfileCard
  };

  const handleDelete = async () => {
    setDeleting(true); // Set deleting state to true
    setDeletionMessage('');

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.delete(
        `https://tlbc-platform-api.onrender.com/api/users/${userToDelete.email}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

     setMessageType('success');
      setDeletionMessage('User deleted successfully');
      setDeleteSuccess(true);
      
      // Set timeout to close modal and refresh data
      setTimeout(() => {
        setConfirmDelete(false);
        setDeletionMessage('');
        setDeleteSuccess(false);
        fetchUsers(currentPage);
      }, 2000);

    } catch (error) {
      setMessageType('error');
      if (error.response?.data?.detail) {
        setDeletionMessage(error.response.data.detail);
      } else {
        setDeletionMessage('An error occurred while deleting the user');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (user) => {
    // Edit action is just a placeholder for now
    console.log('Edit user:', user);
  };
  
   // Render error message if fetch fails
   if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-red-500">Error: {error}</p>
        <p>Please contact the system administrator</p>
      </div>
    );
  }

  return (
    <>
    <Breadcrumb pageName="Admin User Search"  className="text-black dark:text-white" />

    <div
     className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 bg-white dark:bg-boxdark"
      style={{ backgroundColor }}
    >
      {/* Search Container */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-strokedark p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch space-y-4 sm:space-y-0 sm:space-x-4">
           {/* Search Input - Full width on mobile, flexible on larger screens */}
          <div className="flex-grow w-full">
            <input
              type="text"
              placeholder="Search by name"
              className="w-full rounded-md border border-gray-300 dark:border-form-strokedark px-3 py-2 text-sm text-black dark:text-white 
                focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 
                dark:bg-form-input dark:focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                color: 'white', 
                borderColor, 
                minHeight: '42px' // Ensure adequate touch target on mobile
              }}
            />
          </div>
          
          {/* Search Button - Full width on mobile, auto on larger screens */}
          <div className="w-full sm:w-auto">
            <button
                className={`w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors duration-300 disabled:opacity-50 ${
                searchTerm.trim() === '' ? 'bg-gray-400' : 'bg-primary'
              }`}
              onClick={handleSearch}
              disabled={searchTerm.trim() === '' || isLoading}
              style={{ 
                backgroundColor: searchTerm.trim() === '' ? '#ccc' : primaryColor,
                minHeight: '42px' // Match input height
              }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Advanced Search Button - Full width on mobile */}
        <div>
          <button
             className="w-full rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors duration-300 bg-primary"
            onClick={() => navigate("/AdvancedUserSearchPage")}
          >
            Advanced Search
          </button>
        </div>
      </div>

      {/* Results Table with Responsive Design */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm border border-gray-200 dark:border-strokedark mt-6 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-4 text-black dark:text-white">Loading...</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] divide-y divide-gray-200 dark:divide-strokedark">
              <thead>
                <tr>
                  {['Profile', 'Username', 'Name', 'Phone', 'Email', 'Gender', 'Church', 'View', 'Edit', 'Delete'].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 bg-primary text-white text-left text-xs font-medium uppercase tracking-wider dark:text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && searchTerm.trim() !== '' ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-3 text-center text-red-500"
                      style={{ color: 'red' }}
                    >
                      {searchTerm ? 'No results found' : ''}
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 dark:hover:bg-strokedark transition-colors duration-300"
                      style={{ backgroundColor: 'white', color: textColor }}
                    >
                      <td className="px-4 py-3">
                        <img
                          src={user.profile_picture || User}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-black">{user.username}</td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-black">{user.first_name} {user.last_name}</td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-black whitespace-nowrap">{user.phone_number}</td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-black">{user.email}</td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-black">{user.gender}</td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-black">{user.church || 'N/A'}</td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-black">      
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-blue-900"
                        >
                          <Eye size={18}/>
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">
                          <a
                            href="#"
                            onClick={() => handleEdit(user)}
                            className="text-sm text-primary hover:text-secondary transition-all"
                            >
                            <Edit size={18} />
                          </a>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setConfirmDelete(true);
                            }}
                            className="text-white bg-red-500 hover:bg-red-900 px-4 py-2 rounded"
                          >
                            Delete
                          </button>
                        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination with Responsive Design */}
      {users.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
          <span className="text-sm text-gray-600 dark:text-white">
            Total Users: {users.length} of {`${totalPages * users.length}`}
          </span>
          <div className="flex space-x-2">
          {/* Clear button added */}
          <button
              className="rounded-md px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-900 transition-colors duration-300 flex items-center"
              onClick={clearSearchResults}
            >
         Close
        </button>
        
            <button
              className={`rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors duration-300 ${
                currentPage === 1 || isLoading ? 'bg-gray-400' : 'bg-primary'
              }`}
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isLoading}
              style={{ backgroundColor: currentPage === 1 || isLoading ? '#ccc' : primaryColor }}
            >
            {/* <ChevronLeft size={18} /> */}
              Previous
            </button>
            <button
               className={`rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors duration-300 ${
                currentPage === totalPages || isLoading ? 'bg-gray-400' : 'bg-primary'
              }`}
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
              style={{ backgroundColor: currentPage === totalPages || isLoading ? '#ccc' : primaryColor }}
            >
              Next
            </button>
          </div>
        </div>
      )} 
    </div>

    {/* Confirm Delete Modal */}
    {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            {!deleteSuccess && (
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeletionMessage('');
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                <X size={18} />
              </button>
            )}
            
            {!deleteSuccess && !deleting && (
              <>
                <h3 className="text-xl font-semibold">Confirm Deletion</h3>
                <p className="my-4">Are you sure you want to delete this user?</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeletionMessage('');
                    }}
                    className="bg-gray-500 text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-900"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {deleting && (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Deleting User</h3>
                <div className="text-center text-sm text-gray-500">Deleting...</div>
              </div>
            )}

            {deleteSuccess && (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Success</h3>
                <div className="text-green-600">
                  {deletionMessage}
                </div>
              </div>
            )}

            {!deleteSuccess && !deleting && messageType === 'error' && deletionMessage && (
              <div className="mt-4 text-center text-sm text-red-600">
                {deletionMessage}
              </div>
            )}
          </div>
        </div>
      )}
      
    {selectedUser && (
      <UserProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />
    )}
  </>
  );
};

export default UserSearchAdmin;