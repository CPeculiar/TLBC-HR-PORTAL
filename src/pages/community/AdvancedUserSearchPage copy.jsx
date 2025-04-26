import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Eye, X, PlusCircle, Trash2, Search, Filter, Mail } from "lucide-react";
import UserIcon from '../../images/user/user-14.png';
import UserProfileCard from './UserProfileCard';
import UserProfileCardAdmin from '../User Management/UserProfileCardAdmin';

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Uganda", "Egypt", "Ethiopia", "Morocco",
  "South Africa", "Senegal", "Ivory Coast", "Cameroon", "Rwanda", "Zambia", 
  "United States", "United Kingdom", "Canada", "Australia", "Switzerland",
  "Germany", "France", "Italy", "Spain", "Norway", "Argentina", "England"
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
    const [isUsernameSearch, setIsUsernameSearch] = useState(false);
    const navigate = useNavigate();
    const [churches, setChurches] = useState([]);
    const [zones, setZones] = useState([]);

     // URLs for pagination
     const [nextPageUrl, setNextPageUrl] = useState(null);
     const [previousPageUrl, setPreviousPageUrl] = useState(null);
     const [totalCount, setTotalCount] = useState(0);


 // Fetch churches and zones on component mount
 useEffect(() => {
  const fetchChurchesAndZones = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
          const [churchResponse, zoneResponse] = await Promise.all([
              axios.get('https://tlbc-platform-api.onrender.com/api/churches/', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                  params: { limit: 50 }
              }),
              axios.get('https://tlbc-platform-api.onrender.com/api/zones/', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                  params: { limit: 30 }
              })
          ]);

          setChurches(churchResponse.data.results.map(church => ({
              name: church.name,
              slug: church.slug
          })));

          setZones(zoneResponse.data.results.map(zone => ({
              name: zone.name,
              slug: zone.slug
          })));
      } catch (error) {
          console.error('Error fetching churches and zones:', error);
      }
  };

  fetchChurchesAndZones();
}, []);

  // Available search field options
  const SEARCH_FIELDS = [
    { key: 'username', label: 'Username', type: 'username' }, 
    { key: 'phone_number', label: 'Phone Number', type: 'tel' },
    { key: 'church', label: 'Church', type: 'select', options: churches.map(church => church.name) },
    { key: 'zone', label: 'Zone', type: 'select', options: zones.map(zone => zone.name) },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    { key: 'invited_by', label: 'Invited By', type: 'text' },
    { key: 'origin_state', label: 'State of Origin', type: 'select', options: STATES },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'state', label: 'State of Residence', type: 'select', options: STATES },
    { key: 'country', label: 'Country', type: 'select', options: COUNTRIES },
    { key: 'birth_date_after', label: 'DOB After', type: 'date' },
    { key: 'birth_date_before', label: 'DOB Before', type: 'date' },
    { key: 'enrolled_in_wfs', label: 'Enrollment in Word Foundation Sschool', type: 'boolean' },
    { key: 's', label: 'Name', type: 'text' },
    { key: 'wfs_graduation_year_max', label: 'WFS Graduation Year (Max.)', type: 'number' },
    { key: 'wfs_graduation_year_min', label: 'WFS Graduation Year (Min.)', type: 'number' },
    { key: 'tlsom_graduation_year_max', label: 'TLOSOM Graduation Year (Max.)', type: 'number' },
    { key: 'tlsom_graduation_year_min', label: 'TOLOSOM Graduation Year (Min.)', type: 'number' },
    { key: 'wts_graduation_year_max', label: 'WTS Graduation Year (Max.)', type: 'number' },
    { key: 'wts_graduation_year_min', label: 'WTS Graduation Year (Min.)', type: 'number' }
  ];

  // Fetch users based on search parametersl
  const fetchUsers = async (pageUrl = null, params = {}) => {
    setError(null);
    setIsLoading(true);
    setIsUsernameSearch(false);

try {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate("/");
      return;
  }
 
// Check if we're searching by username
const usernameField = searchFields.find(field => field.key === 'username');
if (usernameField && usernameField.value) {
    setIsUsernameSearch(true);
    // Make the specific username API call
    const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/users/${usernameField.value}/`,
        {
            headers: { Authorization: `Bearer ${accessToken}` }
        }
    );
    setUsers([response.data]); // Set as array with single user
    setTotalPages(1);
    setNextPageUrl(null);
    setPreviousPageUrl(null);
    setTotalCount(1);
    // Automatically show the profile card for username search
    setSelectedUser(response.data);
} else {
    // Make the regular search API call
    const url = pageUrl || 'https://tlbc-platform-api.onrender.com/api/users/';
    const config = {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: pageUrl ? {} : params // Only include params if it's not a pagination URL
    };

    const response = await axios.get(url, config);
    const data = response.data;

     setUsers(data.results || []);
     setTotalCount(data.count || 0);
     setTotalPages(data.count ? Math.ceil(data.count / data.limit) : 1);
     setNextPageUrl(data.next);
     setPreviousPageUrl(data.previous);

      // Update current page based on URL if available
      if (pageUrl) {
       const pageMatch = pageUrl.match(/page=(\d+)/);
       if (pageMatch && pageMatch[1]) {
           setCurrentPage(parseInt(pageMatch[1]));
       }
   } else {
       setCurrentPage(1);
   }
   }
     setIsLoading(false);
   } catch (error) {
     console.error('Error fetching users:', error);

     setUsers([]);
     setTotalPages(1);
     setIsLoading(false);
     setNextPageUrl(null);
     setPreviousPageUrl(null);
     setTotalCount(0);
   }
 };
     
          // Update the pagination handlers
    const handlePrevPage = () => {
      if (previousPageUrl) {
        fetchUsers(previousPageUrl);
        setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (nextPageUrl) {
      fetchUsers(nextPageUrl);
      setCurrentPage(prev => prev + 1);
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
    fetchUsers(null, searchParams); // Pass null as pageUrl to indicate a new search
};

  // Get all users
  const handleGetAllUsers = () => {
    setCurrentPage(1);
    fetchUsers();
};

      // Clear search results
      const clearSearchResults = () => {
        setSearchFields([]);
        setUsers([]);
        setCurrentPage(1);
        setTotalPages(1);
        setNextPageUrl(null);
        setPreviousPageUrl(null);
        setTotalCount(0);
    };

    // Handler for viewing user details
    const handleViewUser = (user) => {
        setSelectedUser(user);
    };

    // Handler for closing profile cards
    const handleCloseProfile = () => {
        setSelectedUser(null);
        setIsUsernameSearch(false);
    };

  // Render error message
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
        {/* Close button */}
        <button 
          onClick={() => setError(null)} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            <h2 className="text-2xl font-bold mb-4">Error Occurred</h2>
            <p className="text-lg mb-6">{error || "An unexpected error occurred. Please contact support for assistance."}</p>
          </div>
        
          <h3 className="text-xl font-semibold mb-4">Contact Support</h3>

      <div className="flex flex-col space-y-4 px-2 sm:px-4">
            <button 
              onClick={() => window.open("https://wa.me/2348064430141", "_blank")}
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg w-full"
              aria-label="Contact via WhatsApp"
            >
              <WhatsAppIcon className="mr-1 w-10 md:mr-3 md:w-auto" />
              <span className="font-medium text-base sm:text-lg">Send a Message on WhatsApp</span>
            </button>
            
            <button 
              onClick={() => window.open("mailto:support@thelordsbrethrenchurch.org", "_blank")}
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg w-full"
              aria-label="Contact via Email"
            >
              <Mail className="mr-3" size={24} />
              <span className="font-medium text-base sm:text-lg">Send an Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

  // Render dynamic search fields
  const renderSearchField = (field, index) => {
    return (
      <div key={index} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2 text-black dark:text-black">
      {/* Field Selection Dropdown - Improved Responsiveness */}
      <div className="w-full sm:w-1/3 relative">
          <select
              className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm pr-8 text-black dark:text-black"
              value={field.key}
              onChange={(e) => updateSearchField(index, e.target.value, '')}
          >
              <option value="" className="text-gray-500 w-8 dark:text-black">Search by</option>
              {SEARCH_FIELDS.filter(
                  searchField => !searchFields.some(f => f.key === searchField.key)
              ).map((searchField) => (
                  <option key={searchField.key} value={searchField.key} className="text-sm dark:text-black">
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
            case 'username':
                        return (
                            <input
                                type="text"
                                placeholder="Enter username"
                                className="w-full sm:flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm dark:text-black"
                                value={field.value}
                                onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                            />
                        );
            case 'select':
              return (
                <div className="w-full sm:flex-grow relative">
                <select
                 className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm pr-8 text-black dark:text-white"
                 value={field.value}
                  onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                >
                 <option value="" className="text-gray-500 dark:text-white">
                      Select {fieldConfig.label}
                    </option>
                  {fieldConfig.options.map((option) => (
                    <option key={option} value={option} className="text-sm dark:text-white">{option}</option>
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
                className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm pr-8 text-black dark:text-white"
                value={field.value}
                onChange={(e) => updateSearchField(index, field.key, e.target.value)}
                >
                   <option value="" className="text-gray-500 dark:text-black">
                      Select {fieldConfig.label}
                    </option>
                    <option value="true" className="text-sm dark:text-white">True</option>
                    <option value="false" className="text-sm dark:text-white">False</option>
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
                  className="w-full sm:flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm dark:text-white"
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
      <Breadcrumb pageName="Advanced Member Search"  className="text-black dark:text-white"  />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm border border-stroke dark:border-strokedark p-4 sm:p-6 space-y-4">
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
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm border border-stroke dark:border-strokedark mt-6 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-4 text-black dark:text-white">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-form-strokedark">
              <thead>
                <tr>
                  {['Profile', 'Username', 'Name', 'Phone', 'Email', 'Gender', 'Church', 'Action'].map((header) => (
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
                      className="hover:bg-gray-100 dark:hover:bg-form-input transition-colors duration-300"
                    >
                      <td className="px-2 sm:px-4 py-3">
                        <img
                          src={user.profile_picture || UserIcon }
                          alt="Profile"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                        {user.username}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm whitespace-nowrap text-black dark:text-white">
                        {user.phone_number || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                        {user.email || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                        {user.gender || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-black dark:text-white">
                        {user.church || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-3">      
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex justify-center rounded bg-primary text-white p-2 sm:p-3 hover:bg-opacity-90"
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
                <span className="text-xs sm:text-sm text-gray-600 dark:text-white">
                    {/* Show total count from API response */}
                    {totalCount > 0 ? `Showing ${users.length} of ${totalCount} total users` : `Total Users: ${users.length}`}
                    {currentPage > 1 && totalPages > 1 && ` | Page ${currentPage} of ${totalPages}`}
                </span>
                <div className="flex space-x-2">
                    {/* Clear/Close button */}
                    <button
                        className="rounded-md px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300 flex items-center"
                        onClick={clearSearchResults}
                        disabled={users.length === 0}
                    >
                        Close
                    </button>
                    
                    {/* Only show pagination buttons if we have results */}
                    {users.length > 0 && (
                        <>
                            <button
                                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white 
                                    ${!previousPageUrl 
                                        ? 'bg-primary/50 cursor-not-allowed dark:bg-form-input' 
                                        : 'bg-primary hover:bg-opacity-90'}`}
                                onClick={handlePrevPage}
                                disabled={!previousPageUrl || isLoading}
                            >
                                Previous
                            </button>
                            <button
                                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white 
                                    ${!nextPageUrl 
                                        ? 'bg-primary/50 cursor-not-allowed dark:bg-form-input' 
                                        : 'bg-primary hover:bg-opacity-90'}`}
                                onClick={handleNextPage}
                                disabled={!nextPageUrl || isLoading}
                            >
                                Next
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}

      </div>

      {selectedUser && !isUsernameSearch && (
        <UserProfileCard 
          user={selectedUser} 
          // onClose={() => setSelectedUser(null)} 
          onClose={handleCloseProfile}
        />
      )}

            {selectedUser && isUsernameSearch && (
                <UserProfileCardAdmin 
                    user={selectedUser} 
                    onClose={handleCloseProfile}
                />
            )}
    </>
  );
};

// Custom WhatsApp Icon component
const WhatsAppIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="white"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default AdvancedUserSearchPage;