import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, X, Trash2,  Menu  } from 'lucide-react';

const ChurchManagement = () => {
  // States for Church Management
  const [loading, setLoading] = useState(false);
  const [loadingChurches, setLoadingChurches] = useState(false);
  const [loadingAddChurch, setLoadingAddChurch] = useState(false);
  const [loadingEditChurch, setLoadingEditChurch] = useState(false);
  const [loadingDeleteChurch, setLoadingDeleteChurch] = useState(false);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);


  // Success and Error Messages
  const [churchesSuccessMessage, setChurchesSuccessMessage] = useState(null);
  const [churchesErrorMessage, setChurchesErrorMessage] = useState(null);
  const [addChurchSuccessMessage, setAddChurchSuccessMessage] = useState(null);
  const [addChurchErrorMessage, setAddChurchErrorMessage] = useState(null);
  const [editChurchSuccessMessage, setEditChurchSuccessMessage] = useState(null);
  const [editChurchErrorMessage, setEditChurchErrorMessage] = useState(null);
  const [deleteChurchSuccessMessage, setDeleteChurchSuccessMessage] = useState(null);
  const [deleteChurchErrorMessage, setDeleteChurchErrorMessage] = useState(null);

  // Church Management States
  const [churches, setChurches] = useState([]);
  const [zones, setZones] = useState([]);
  const [churchName, setChurchName] = useState('');
  const [selectedChurch, setSelectedChurch] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [editChurchName, setEditChurchName] = useState('');
  const [deleteChurchSlug, setDeleteChurchSlug] = useState('');
  const [selectedChurchDetails, setSelectedChurchDetails] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showChurchDetailsModal, setShowChurchDetailsModal] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    count: 0,
    next: null,
    previous: null
  });

  // API Base URL
  const API_BASE_URL = 'https://tlbc-platform-api.onrender.com/api';

   // Helper function to set and auto-clear success message
   const setSuccessMessageWithTimeout = (message, setMessageFn) => {
    setMessageFn(message);
    
    // Set a timeout to clear the message after 5 seconds
    const timeoutId = setTimeout(() => {
      setMessageFn(null);
    }, 5000);

    // Return the timeoutId in case you want to clear it manually
    return timeoutId;
  };
  
  // Fetch Zones and Churches on Component Load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Zones
        const zonesResponse = await axios.get(`${API_BASE_URL}/zones/`);
        setZones(zonesResponse.data.results);

        // Fetch Churches
        const churchesResponse = await axios.get(`${API_BASE_URL}/churches/`);
        setChurches(churchesResponse.data.results);
        setPagination({
          count: churchesResponse.data.count,
          next: churchesResponse.data.next,
          previous: churchesResponse.data.previous,
          currentPage: 1,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Section Selection Handler
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setInitialLoad(false);
    setIsMobileMenuOpen(false);
  };

  // Add New Church
  const handleAddChurch = async (e) => {
    e.preventDefault();
    setLoadingAddChurch(true);
    setAddChurchSuccessMessage(null);
    setAddChurchErrorMessage(null);

    try {
      // Find the zone slug for the selected zone
      const selectedZoneData = zones.find(zone => zone.name === selectedZone);
      
      if (!selectedZoneData) {
        setAddChurchErrorMessage('Please select a zone');
        return;
      }

      await axios.post(`${API_BASE_URL}/churches/`, {
        name: churchName,
        zone: selectedZoneData.slug
      });
      
      setSuccessMessageWithTimeout('New church successfully added', setAddChurchSuccessMessage);
      setChurchName('');
      setSelectedZone('');
      
      // Refresh churches list
      const response = await axios.get(`${API_BASE_URL}/churches/`);
      setChurches(response.data.results);
    } catch (err) {
      setAddChurchErrorMessage('Failed to add church. Please try again.');
    } finally {
      setLoadingAddChurch(false);
    }
  };

  // Edit Church
  const handleEditChurch = async (e) => {
    e.preventDefault();
    setLoadingEditChurch(true);
    setEditChurchSuccessMessage(null);
    setEditChurchErrorMessage(null);

    try {
      // Find the selected church's slug
      const selectedChurchData = churches.find(church => church.name === selectedChurch);
      
      // Find the zone slug for the selected zone
      const selectedZoneData = zones.find(zone => zone.name === selectedZone);
      
      if (!selectedChurchData) {
        setEditChurchErrorMessage('Please select a church');
        return;
      }

      if (!selectedZoneData) {
        setEditChurchErrorMessage('Please select a zone');
        return;
      }

      await axios.put(`${API_BASE_URL}/churches/${selectedChurchData.slug}/`, {
        name: editChurchName,
        zone: selectedZoneData.slug
      });
      
      // Use the new timeout function
      setSuccessMessageWithTimeout('Church updated successfully', setEditChurchSuccessMessage);
      setSelectedChurch('');
      setEditChurchName('');
      setSelectedZone('');
      
      // Refresh churches list
      const response = await axios.get(`${API_BASE_URL}/churches/`);
      setChurches(response.data.results);
    } catch (err) {
      setEditChurchErrorMessage('Failed to update church. Please try again.');
    } finally {
      setLoadingEditChurch(false);
    }
  };

  // View Church Details
  const handleViewChurchDetails = async (slug) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/churches/${slug}/`);
      setSelectedChurchDetails(response.data);
      setShowChurchDetailsModal(true);
    } catch (err) {
      setChurchesErrorMessage('Failed to fetch church details');
    }
  };

  // Initiate Delete Church
  const initiateDeleteChurch = () => {
    if (deleteChurchSlug) {
      setShowDeleteConfirmModal(true);
    }
  };

  // Confirm Delete Church
  const confirmDeleteChurch = async () => {
    setLoadingDeleteChurch(true);
    setDeleteChurchErrorMessage('');
    setDeleteChurchSuccessMessage('');

    try {
      // Find the church slug
      const selectedChurchData = churches.find(church => church.name === deleteChurchSlug);
      
      if (!selectedChurchData) {
        setDeleteChurchErrorMessage('Please select a church to delete');
        return;
      }

      await axios.delete(`${API_BASE_URL}/churches/${selectedChurchData.slug}/`);
      
      // Use the new timeout function
      setSuccessMessageWithTimeout('Church deleted successfully', setDeleteChurchSuccessMessage);
      setDeleteChurchSlug('');
      setShowDeleteConfirmModal(false);
      
      // Refresh churches list
      const response = await axios.get(`${API_BASE_URL}/churches/`);
      setChurches(response.data.results);
    } catch (err) {
      setDeleteChurchErrorMessage('Failed to delete church. Please try again.');
    } finally {
      setLoadingDeleteChurch(false);
    }
  };

  // Pagination Handlers
  const handleNextPage = async () => {
    if (pagination.next) {
      try {
        const response = await axios.get(pagination.next);
        setChurches(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: pagination.currentPage + 1
        });
      } catch (err) {
        setChurchesErrorMessage('Failed to load next page');
      }
    }
  };

  const handlePrevPage = async () => {
    if (pagination.previous) {
      try {
        const response = await axios.get(pagination.previous);
        setChurches(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: pagination.currentPage - 1
        });
      } catch (err) {
        setChurchesErrorMessage('Failed to load previous page');
      }
    }
  };

  // Mobile Section Selection
  const handleMobileSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
    setInitialLoad(false);
  };

   // Mobile Menu Toggle
   const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-6">
     {/* Mobile Menu Toggle */}
     <div className="md:hidden flex justify-between items-center mb-4">
     <h2 className="text-xl font-bold text-black dark:text-white">Church Management</h2>
     <button 
          onClick={toggleMobileMenu} 
          className="text-primary dark:text-white"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-boxdark z-50 overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={toggleMobileMenu} 
              className="absolute top-4 right-4 text-black dark:text-white"
              >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6 mt-10 text-black dark:text-white">Sections</h2>
            <div className="space-y-4">
              <button 
                onClick={() => handleMobileSectionChange('add')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'add' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black dark:bg-meta-4 dark:text-white'
                }`}
              >
                Add New Church
              </button>
              <button 
                onClick={() => handleMobileSectionChange('edit')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'add' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black dark:bg-meta-4 dark:text-white'
                }`}
              >
                Edit Church
              </button>
              <button 
                onClick={() => handleMobileSectionChange('delete')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'add' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black dark:bg-meta-4 dark:text-white'
                }`}
              >
                Delete Church
              </button>
              <button 
                onClick={() => handleMobileSectionChange('list')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'add' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black dark:bg-meta-4 dark:text-white'
                }`}
              >
                Church List
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block col-span-1 bg-gray-100 dark:bg-meta-4 p-4 rounded-lg h-fit">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Sections</h3>
          <div className="space-y-2">
            <button 
              onClick={() => handleSectionChange('add')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'add' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-meta-4 text-black dark:text-white'
              }`}
            >
              Add New Church
            </button>
            <button 
              onClick={() => handleSectionChange('edit')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'add' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-meta-4 text-black dark:text-white'
              }`}
            >
              Edit Church
            </button>
            <button 
              onClick={() => handleSectionChange('delete')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'add' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-meta-4 text-black dark:text-white'
              }`}
            >
              Delete Church
            </button>
            <button 
              onClick={() => handleSectionChange('list')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'add' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-meta-4 text-black dark:text-white'
              }`}
            >
              Church List
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-full md:col-span-3">
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Conditionally Render Sections */}
            {(initialLoad || activeSection === 'add') && (
              <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Add New Church</h3>
                       {/* Add Church Form (same as before) */}
                <form onSubmit={handleAddChurch} className="mt-4">
                  {/* Form inputs remain the same */}
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      value={churchName}
                      onChange={(e) => setChurchName(e.target.value)}
                      placeholder="Enter Church Name"
                      required
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      required
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="" disabled>Select Zone</option>
                      {zones.map((zone) => (
                        <option key={zone.slug} value={zone.name}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAddChurch}
                    className="mt-4 w-full flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {loadingAddChurch ? 'Adding...' : 'Add Church'}
                  </button>
            {addChurchSuccessMessage && (
              <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-600">
                {addChurchSuccessMessage}
              </div>
            )}
            {addChurchErrorMessage && (
              <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                {addChurchErrorMessage}
              </div>
            )}
          </form>
        </div>
            )}

         {/* Similar changes for Edit and Delete sections */}
         {(initialLoad || activeSection === 'edit') && (
          <div className="border-b border-stroke p-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Edit Church</h3>
          <form onSubmit={handleEditChurch} className="mt-4">
            <div className="mb-4">
              <select
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                <option value="">Select Church</option>
                {churches.map((church) => (
                  <option key={church.slug} value={church.name}>
                    {church.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedChurch && (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    value={editChurchName}
                    onChange={(e) => setEditChurchName(e.target.value)}
                    placeholder="Enter New Church Name"
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                </div>
                <div className="mb-4">
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                    <option value="">Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone.slug} value={zone.name}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={loadingEditChurch || !selectedChurch}
              className="w-full flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              {loadingEditChurch ? 'Updating...' : 'Update Church'}
            </button>
            {editChurchSuccessMessage && (
              <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-600">
                {editChurchSuccessMessage}
              </div>
            )}
            {editChurchErrorMessage && (
              <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                {editChurchErrorMessage}
              </div>
            )}
          </form>
        </div>
         )}

        {/* Delete Church Section */}
        {(initialLoad || activeSection === 'delete') && (
          <div className="border-b border-stroke p-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Delete Church</h3>
          <div className="mt-4">
            <select
              value={deleteChurchSlug}
              onChange={(e) => setDeleteChurchSlug(e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
              <option value="">Select Church to Delete</option>
              {churches.map((church) => (
                <option key={church.slug} value={church.name}>
                  {church.name}
                </option>
              ))}
            </select>
            <button
              onClick={initiateDeleteChurch}
              disabled={!deleteChurchSlug}
              className="mt-4 w-full flex justify-center items-center rounded bg-red-500 p-3 font-medium text-white hover:bg-red-600 disabled:bg-opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <Trash2 className="mr-2" /> Delete Church
            </button>
            {deleteChurchSuccessMessage && (
              <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-600">
                {deleteChurchSuccessMessage}
              </div>
            )}
            {deleteChurchErrorMessage && (
              <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                {deleteChurchErrorMessage}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative flex flex-col w-full bg-white rounded-lg shadow-xl dark:bg-boxdark">
             {/* Modal Header */}
        <div className="flex items-center justify-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
        </div>

        {/* Modal Content */}
        <div className="p-6 text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 dark:text-white">
              Are you sure you want to delete this church?
            </p>
            <p className="text-xs text-gray-500 mt-2 dark:text-gray-400 dark:text-white">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 p-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={confirmDeleteChurch}
            disabled={loadingDeleteChurch}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
          >
            {loadingDeleteChurch ? 'Deleting...' : 'Confirm Delete'}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirmModal(false)}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

           {/* Church List Section (continued) */}
           {(initialLoad || activeSection === 'list') && (
            <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h3 className="text-xl text-center font-semibold text-black dark:text-white">
                  List of Churches
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-left dark:bg-meta-4">
                        <th className="p-2 sm:px-4 sm:py-2 text-black dark:text-white">Church Name</th>
                        <th className="p-2 sm:px-4 sm:py-2 text-black dark:text-white">Zone</th>
                        <th className="p-2 sm:px-4 sm:py-2 text-black dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-black dark:text-white">
                      {churches.map((church) => (
                        <tr key={church.slug} className="border-b dark:border-strokedark">
                          <td className="p-2 sm:px-4 sm:py-3 text-black dark:text-white">{church.name}</td>
                          <td className="p-2 sm:px-4 sm:py-3 text-black dark:text-white">{church.zone}</td>
                          <td className="p-2 sm:px-4 sm:py-3 text-black dark:text-white">
                            <button 
                              onClick={() => handleViewChurchDetails(church.slug)} 
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Eye size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 space-y-2 sm:space-y-0">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={!pagination.previous}
                    className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 w-full sm:w-auto dark:text-white"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-white">
                    Page {pagination.currentPage} of {Math.ceil(pagination.count / 10)}
                  </span>
                  <button 
                    onClick={handleNextPage} 
                    disabled={!pagination.next}
                    className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 w-full sm:w-auto dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Church Details Modal */}
 {showChurchDetailsModal && selectedChurchDetails && (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative flex flex-col w-full bg-white rounded-lg shadow-xl dark:bg-boxdark max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Church Details</h3>
          <button
            onClick={() => setShowChurchDetailsModal(false)}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Church Name</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {selectedChurchDetails.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Zone</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {selectedChurchDetails.zone}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-4 border-t dark:border-gray-700 space-x-2">
          <button
            onClick={() => setShowChurchDetailsModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white rounded-lg text-red-500 border border-gray-200 hover:bg-red-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      </div>

  );
};

export default ChurchManagement;