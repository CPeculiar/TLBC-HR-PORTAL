import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Eye, X, PlusCircle, Trash2, Search, Filter } from "lucide-react";
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

const STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", 
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", 
    "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", 
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", 
    "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
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
    { key: 'birth_date_after', label: 'DOB After', type: 'date' },
    { key: 'birth_date_before', label: 'DOB Before', type: 'date' },
    { key: 'church', label: 'Church', type: 'select', options: CHURCHES },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'country', label: 'Country', type: 'select', options: COUNTRIES },
    { key: 'enrolled_in_wfs', label: 'Enrollment in Word Foundation Sschool', type: 'boolean' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    { key: 'invited_by', label: 'Invited By', type: 'text' },
    { key: 'origin_state', label: 'State of Origin', type: 'select', options: STATES },
    { key: 's', label: 'Name', type: 'text' },
    { key: 'state', label: 'State of Residence', type: 'select', options: STATES },
    { key: 'wfs_graduation_year_max', label: 'WFS Graduation Year (Max.)', type: 'number' },
    { key: 'wfs_graduation_year_min', label: 'WFS Graduation Year (Min.)', type: 'number' },
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

      // Clear search results
      const clearSearchResults = () => {
        setSearchFields([]);
        setUsers([]);
        setCurrentPage(1);
        setTotalPages(1);
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
      <div key={index} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
          {/* Field Selection Dropdown - Improved Responsiveness */}
        <div className="w-full sm:w-1/3 relative">
        <select
         className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm pr-8"
         value={field.key}
          onChange={(e) => updateSearchField(index, e.target.value, '')}
        >
           <option value="" className="text-gray-500 w-8">Search by</option>
          {SEARCH_FIELDS.filter(
            searchField => !searchFields.some(f => f.key === searchField.key)
          ).map((searchField) => (
            <option key={searchField.key} value={searchField.key}  className="text-sm">
              {searchField.label}
            </option>
          ))}
        </select>

{/* Custom dropdown chevron */}
<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Value Input - Responsive width */}
        {field.key && (() => {
          const fieldConfig = SEARCH_FIELDS.find(f => f.key === field.key);
          
          switch (fieldConfig.type) {
            case 'select':
              return (
                <div className="w-full sm:flex-grow relative">
                <select
                 className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm pr-8"
                 value={field.value}
                  onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                >
                 <option value="" className="text-gray-500">
                      Select {fieldConfig.label}
                    </option>
                  {fieldConfig.options.map((option) => (
                    <option key={option} value={option} className="text-sm">{option}</option>
                  ))}
                </select>
                {/* Custom dropdown chevron */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              );
            case 'boolean':
              return (
                <div className="w-full sm:flex-grow relative">
                <select
                //   className="w-full sm:flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm pr-8"
                value={field.value}
                onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                >
                   <option value="" className="text-gray-500">
                      Select {fieldConfig.label}
                    </option>
                    <option value="true" className="text-sm">True</option>
                    <option value="false" className="text-sm">False</option>
                  </select>
                  {/* Custom dropdown chevron */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              );
            default:
              return (
                <input
                  type={fieldConfig.type}
                  placeholder={fieldConfig.label}
                  className="w-full sm:flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={field.value}
                  onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                />
              );
          }
        })()}

        {/* Remove Field Button - Positioned consistently */}
        <button 
          onClick={() => removeSearchField(index)}
          className="text-red-500 hover:text-red-700 self-end sm:self-center"
        >
          <Trash2 size={20} />
        </button>
      </div>
    );
  };




  return (
    <>
      <Breadcrumb pageName="Advanced Member Search" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
          <div className="space-y-4">
            {/* Search Fields Container - Responsive Layout */}
            <div className="space-y-2">
              {searchFields.map(renderSearchField)}
            </div>

            {/* Button Group - Responsive Alignment */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={addSearchField}
                className="w-full sm:w-auto flex items-center justify-center rounded-md bg-primary text-white px-4 py-2 hover:bg-opacity-90 space-x-2"
              >
                <PlusCircle size={20} />
                <span>Add Field</span>
              </button>
              
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-2 hover:bg-opacity-90 space-x-2"
                disabled={searchFields.length === 0}
              >
                <Search size={20} />
                <span>Search</span>
              </button>
              
              <button
                onClick={handleGetAllUsers}
                className="w-full sm:w-auto flex items-center justify-center rounded-md bg-secondary text-white px-4 py-2 hover:bg-opacity-90 space-x-2"
              >
                <Filter size={20} />
                <span>Get All Users</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Results Table - Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {['Profile', 'Name', 'Phone', 'Email', 'Gender', 'Church', 'Action'].map((header) => (
                      <th
                        key={header}
                        className="px-2 sm:px-4 py-3 bg-primary text-white text-left text-xs font-medium uppercase tracking-wider"
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
                      >
                        <td className="px-2 sm:px-4 py-3">
                          <img
                            src={user.profile_picture || User}
                            alt="Profile"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                          {user.phone_number || 'N/A'}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {user.email || 'N/A'}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {user.gender || 'N/A'}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          {user.church || 'N/A'}
                        </td>
                        <td className="px-2 sm:px-4 py-3">      
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="flex justify-center rounded bg-primary p-2 sm:p-3 hover:bg-opacity-90"
                          >
                            <Eye size={16} sm:size={18} />
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

        {/* Pagination - Responsive */}
        {users.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
            <span className="text-xs sm:text-sm text-gray-600">
              Total Users: {users.length} of {`${totalPages * users.length}`}
            </span>
            <div className="flex space-x-2">

              {/* Clear button added */}
              <button
                            className="rounded-md px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 flex items-center"
                            onClick={clearSearchResults}
                            disabled={users.length === 0}
                        >
                            <X size={16} className="mr-2" /> Clear
                        </button>
                        
              <button
                className="rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-primary hover:bg-opacity-90 disabled:bg-gray-400"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </button>
              <button
                className="rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-primary hover:bg-opacity-90 disabled:bg-gray-400"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
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