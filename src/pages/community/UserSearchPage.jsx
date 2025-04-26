import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Eye, X, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import User from '../../images/user/user-14.png'
import UserProfileCard from './UserProfileCard';

const UserSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // New state for alerts
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  const primaryColor = '#3c50e0';
  const secondaryColor = '#4d0099';
  const textColor = '#333';
  const borderColor = '#ccc';
  const backgroundColor = '#f5f5f5';

  // Create a reference to the profile card element
  const profileCardRef = useRef(null);

  // Show alert function
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

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

  // Method to clear search results
  const clearSearchResults = () => {
    setSearchTerm('');
    setUsers([]);
    setCurrentPage(1);
    setTotalPages(1);
  };

// Replace the existing handleDownloadProfile with this improved version
const handleDownloadProfile = async () => {
  try {
    setIsLoading(true);
    showAlert("Preparing download...", "success");
    
    // Give DOM time to update before attempting to capture
    setTimeout(async () => {
      try {
        if (!profileCardRef.current) {
          throw new Error("Profile card element not found");
        }
        
        // Make sure the element is visible and rendered
        const element = profileCardRef.current;
        
        // Use html2canvas with optimized settings
        const canvas = await html2canvas(element, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDoc, clonedElement) => {
            // Make sure the cloned element is visible
            clonedElement.style.display = 'block';
            clonedElement.style.position = 'relative';
            clonedElement.style.width = '800px'; // Set fixed width
            clonedElement.style.height = 'auto';
            
            // Remove any transform that could affect rendering
            clonedElement.style.transform = 'none';
            
            // Hide the buttons in the cloned element
            const buttons = clonedElement.querySelectorAll('button');
            buttons.forEach(button => {
              button.style.display = 'none';
            });
          }
        });
        
        // Convert to image and trigger download
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.href = image;
        link.download = `${selectedUser.first_name || 'user'}_${selectedUser.last_name || 'profile'}_profile.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert("Profile downloaded successfully", "success");
      } catch (error) {
        console.error("Download error:", error);
        showAlert("Failed to download profile. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    }, 300); // Small delay to ensure the ref is properly set
  } catch (error) {
    console.error("Download error:", error);
    showAlert("Failed to download profile. Please try again.", "error");
    setIsLoading(false);
  }
};
  
  // Helper function to apply necessary styles to clone for accurate rendering
  const applyStylesToClone = (clone) => {
    // Make sure all elements have their computed styles applied inline
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
      // Apply key styles that might affect layout
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
    });
    
    // Ensure the clone itself has the right styling
    clone.style.maxHeight = 'none';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.backgroundColor = '#ffffff';
    
    // Make sure tables have proper width
    const tables = clone.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.tableLayout = 'fixed';
    });
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
      <Breadcrumb pageName="Search Members" className="text-black dark:text-white" />

      {/* Alert Section */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg ${
          alert.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {alert.message}
        </div>
      )}

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
                        className="hover:bg-gray-100 dark:hover:bg-strokedark transition-colors duration-300 dark:bg-black"
                      >
                        <td className="px-4 py-3">
                          <img
                            src={user.profile_picture || User}
                            alt="Profile"
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
                className="rounded-md px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 flex items-center"
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
          onDownload={handleDownloadProfile}
          profileCardRef={profileCardRef}
        />
      )}
    </>
  );
};

export default UserSearchPage;