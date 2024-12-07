import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Eye, PlusCircle, Trash2 } from "lucide-react";
import User from '../../images/user/user-09.png';
import UserProfileCard from './UserProfileCard';

// Predefined lists for dropdowns
const CHURCHES = [
  "TLBC Awka", "TLBC Ekwulobia", "TLBC Ihiala", "TLBC Nnewi", 
  "TLBC Onitsha", "TLBCM Agulu", "TLBCM COOU Igbariam",
  "TLBCM COOU Uli", "TLBCM FUTO", "TLBCM Mbaukwu",
  "TLBCM Mgbakwu", "TLBCM NAU", "TLBCM Nekede", 
  "TLBCM Oko", "TLBCM Okofia", "TLBCM UNILAG",
  "TLTN Awka", "TLTN Agulu", "TLTN Umuokpu",
];

const ZONES = [
  "Awka Zone", "Ekwulobia Zone", "Nnewi Zone", 
  "Owerri Zone"
];

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Uganda", 
  "South Africa", "United States", "United Kingdom"
];

const AdvancedUserSearchPage = () => {
    const [searchFields, setSearchFields] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

  // Color constants
  const primaryColor = '#3c50e0';
  const secondaryColor = '#4d0099';
  const textColor = '#333';
  const borderColor = '#ccc';
  const backgroundColor = '#f5f5f5';

  // Available search field options
  const SEARCH_FIELDS = [
    { key: 'birth_date_after', label: 'Birth Date After', type: 'date' },
    { key: 'birth_date_before', label: 'Birth Date Before', type: 'date' },
    { key: 'church', label: 'Church', type: 'select', options: CHURCHES },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'country', label: 'Country', type: 'select', options: COUNTRIES },
    { key: 'enrolled_in_wfs', label: 'Enrolled in WFS', type: 'boolean' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    { key: 'invited_by', label: 'Invited By', type: 'text' },
    { key: 'origin_state', label: 'Origin State', type: 'text' },
    { key: 's', label: 'Search Term', type: 'text' },
    { key: 'state', label: 'State', type: 'text' },
    { key: 'wfs_graduation_year_max', label: 'WFS Max Graduation Year', type: 'number' },
    { key: 'wfs_graduation_year_min', label: 'WFS Min Graduation Year', type: 'number' },
    { key: 'zone', label: 'Zone', type: 'select', options: ZONES }
  ];

  // Fetch users based on search parameters
  const fetchUsers = async (page = 1, params = {}) => {
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
        `https://tlbc-platform-api.onrender.com/api/users/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { page, ...params }
        }
      );
      
      const data = response.data;
      setUsers(data.results || []);
      setTotalPages(data.count ? Math.ceil(data.count / data.limit) : 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      setUsers([]);
      setTotalPages(1);
      setIsLoading(false);
    }
  };

 // Add a new search field
 const addSearchField = () => {
    setSearchFields([...searchFields, { 
      key: '', 
      value: '' 
    }]);
  };


   // Remove a search field
   const removeSearchField = (index) => {
    const newFields = searchFields.filter((_, i) => i !== index);
    setSearchFields(newFields);
  };

  // Update a search field
  const updateSearchField = (index, key, value) => {
    const newFields = [...searchFields];
    newFields[index] = { key, value };
    setSearchFields(newFields);
  };

  // Perform search
  const handleSearch = () => {
    const searchParams = searchFields.reduce((acc, field) => {
      if (field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {});

    setCurrentPage(1);
    fetchUsers(1, searchParams);
  };

  // Get all users
  const handleGetAllUsers = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Reuse the last search parameters
      handleSearch();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Reuse the last search parameters
      handleSearch();
    }
  };

  // Render error message
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-red-500">Error: {error}</p>
        <p>Please contact the system administrator</p>
      </div>
    );
  }

  // Render dynamic search fields
  const renderSearchField = (field, index) => {
    return (
      <div key={index} className="flex items-center space-x-2 mb-2">
        {/* Field Selection Dropdown */}
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm w-1/3"
          value={field.key}
          onChange={(e) => updateSearchField(index, e.target.value, '')}
        >
          <option value="">Select Field</option>
          {SEARCH_FIELDS.filter(
            // Filter out already selected fields to prevent duplicate selection
            searchField => !searchFields.some(f => f.key === searchField.key)
          ).map((searchField) => (
            <option key={searchField.key} value={searchField.key}>
              {searchField.label}
            </option>
          ))}
        </select>

        {/* Value Input based on selected field type */}
        {field.key && (() => {
          const fieldConfig = SEARCH_FIELDS.find(f => f.key === field.key);
          
          switch (fieldConfig.type) {
            case 'select':
              return (
                <select
                  className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={field.value}
                  onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                >
                  <option value="">Select {fieldConfig.label}</option>
                  {fieldConfig.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              );
            case 'boolean':
              return (
                <select
                  className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={field.value}
                  onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                >
                  <option value="">Select {fieldConfig.label}</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              );
            default:
              return (
                <input
                  type={fieldConfig.type}
                  placeholder={fieldConfig.label}
                  className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={field.value}
                  onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                />
              );
          }
        })()}

        {/* Remove Field Button */}
        <button 
          onClick={() => removeSearchField(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={20} />
        </button>
      </div>
    );
  };




  return (
    <>
      <Breadcrumb pageName="Advanced Member Search" />

      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6"
        style={{ backgroundColor }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow w-full">
              {searchFields.map(renderSearchField)}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={addSearchField}
                className="rounded-md bg-primary text-white px-4 py-2 flex items-center hover:bg-opacity-90"
              >
                <PlusCircle size={20} className="mr-2" /> Add Field
              </button>
              <button
                onClick={handleSearch}
                className="rounded-md bg-secondary text-white px-4 py-2 hover:bg-opacity-90"
                disabled={searchFields.length === 0}
              >
                Search
              </button>
              <button
                onClick={handleGetAllUsers}
                className="rounded-md bg-green-500 text-white px-4 py-2 hover:bg-opacity-90"
              >
                Get All Users
              </button>
            </div>
          </div>
        </div>

        {/* User Results Table */}
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
                      className="px-4 py-3 bg-primary text-white text-left text-xs font-medium uppercase tracking-wider dark:text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-3 text-center text-red-500"
                    >
                      No results found
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
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white whitespace-nowrap">
                        {user.phone_number || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">
                        {user.email || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">
                        {user.gender || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-left text-xs sm:text-base text-black dark:text-white">
                        {user.church || 'N/A'}
                      </td>
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
        <UserProfileCard 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          />
          )}
        </>
  );
};

export default AdvancedUserSearchPage;