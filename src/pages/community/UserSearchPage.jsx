import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import User from '../../images/user/user-09.png'
import UserProfileCard from './UserProfileCard';

const UserSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const showProfileCard = () => {
    // show the profileCard
    
    showProfileCard
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

<Breadcrumb pageName="Search Members" />

    <div
    className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6"
    style={{ backgroundColor }}
  >
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search by name"
          className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ color: textColor, borderColor }}
        />
        <button
          className={`ml-4 rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors duration-300 disabled:opacity-50 ${
            searchTerm.trim() === '' ? 'bg-gray-400' : 'bg-primary'
          }`}
          onClick={handleSearch}
          disabled={searchTerm.trim() === '' || isLoading}
          style={{ backgroundColor: searchTerm.trim() === '' ? '#ccc' : primaryColor }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <button
        className={`rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors duration-300 bg-primary`}
        onClick={() => navigate("/AdvancedUserSearchPage")}
      >
        Advanced Search
      </button>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-x-auto">
      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <table className="w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {['Profile', 'Name', 'Phone', 'Email', 'Gender', 'Church', 'Action'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 bg-primary text-white  text-left text-xs font-medium uppercase tracking-wider dark:text-white"
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
                  colSpan={7}
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
                  className="hover:bg-gray-100 transition-colors duration-300"
                  style={{ backgroundColor: 'white', color: textColor }}
                >
                  <td className="px-4 py-3">
                    <img
                      src={user.profile_picture || User}
                      alt="Image"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">{user.first_name} {user.last_name}</td>
                  <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white whitespace-nowrap">{user.phone_number}</td>
                  <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">{user.email}</td>
                  <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">{user.gender}</td>
                  <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">{user.church || 'N/A'}</td>
                  <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">      
                  <button
                   onClick={() => setSelectedUser(user)}
                    className="mt-4 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  >
                    <Eye size={18} />
                  </button>
                </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>

    {users.length > 0 && (
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Total Users: {users.length} of {`${totalPages * users.length}`}
        </span>
        <div className="flex space-x-2">
          <button
            className={`rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-secondary transition-colors duration-300 ${
              currentPage === 1 || isLoading ? 'bg-gray-400' : 'bg-primary'
            }`}
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
            style={{ backgroundColor: currentPage === 1 || isLoading ? '#ccc' : primaryColor }}
          >
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

  {selectedUser && (
      <UserProfileCard user={selectedUser} onClose={() => setSelectedUser(null)} />
    )}

  </>
  );
};

export default UserSearchPage;