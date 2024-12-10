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
  const [activeSection, setActiveSection] = useState('add');


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
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

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
      
      setAddChurchSuccessMessage('New church successfully added');
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
      
      setEditChurchSuccessMessage('Church updated successfully');
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
      
      setDeleteChurchSuccessMessage('Church deleted successfully');
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

  // Mobile Menu Toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Mobile Section Selection
  const handleMobileSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
     {/* Mobile Menu Toggle */}
     <div className="md:hidden flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Church Management</h2>
        <button 
          onClick={toggleMobileMenu} 
          className="text-primary"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <button 
              onClick={toggleMobileMenu} 
              className="absolute top-4 right-4"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-6 mt-10">Sections</h2>
            <div className="space-y-4">
              <button 
                onClick={() => handleMobileSectionChange('add')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'add' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black'
                }`}
              >
                Add New Church
              </button>
              <button 
                onClick={() => handleMobileSectionChange('edit')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'edit' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black'
                }`}
              >
                Edit Church
              </button>
              <button 
                onClick={() => handleMobileSectionChange('delete')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'delete' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black'
                }`}
              >
                Delete Church
              </button>
              <button 
                onClick={() => handleMobileSectionChange('list')}
                className={`w-full p-3 text-left rounded ${
                  activeSection === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-black'
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
        <div className="hidden md:block col-span-1 bg-gray-100 p-4 rounded-lg h-fit">
          <h3 className="text-lg font-semibold mb-4">Sections</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveSection('add')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'add' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200'
              }`}
            >
              Add New Church
            </button>
            <button 
              onClick={() => setActiveSection('edit')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'edit' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200'
              }`}
            >
              Edit Church
            </button>
            <button 
              onClick={() => setActiveSection('delete')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'delete' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200'
              }`}
            >
              Delete Church
            </button>
            <button 
              onClick={() => setActiveSection('list')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'list' 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-200'
              }`}
            >
              Church List
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-full md:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
            {/* Conditionally Render Sections for Mobile */}
            {(activeSection === 'add' || isMobileMenuOpen === false) && (
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
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      required
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    >
                      <option value="">Select Zone</option>
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
                    className="mt-4 w-full flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
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

        {/* Edit Church Section */}
         {/* Similar changes for Edit and Delete sections */}
         {(activeSection === 'edit' || isMobileMenuOpen === false) && (
              <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Edit Church</h3>
          <form onSubmit={handleEditChurch} className="mt-4">
            <div className="mb-4">
              <select
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
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
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div className="mb-4">
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
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
              className="w-full flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
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
        {(activeSection === 'delete' || isMobileMenuOpen === false) && (
              <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Delete Church</h3>
          <div className="mt-4">
            <select
              value={deleteChurchSlug}
              onChange={(e) => setDeleteChurchSlug(e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
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
              className="mt-4 w-full flex justify-center items-center rounded bg-red-500 p-3 font-medium text-white hover:bg-red-600 disabled:bg-opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
          <div className="relative w-11/12 max-w-sm mx-auto my-6">
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none dark:bg-boxdark">
                <div className="flex items-center justify-center p-5 border-b border-solid rounded-t border-blueGray-200">
                  <h3 className="text-xl font-semibold text-center">Confirm Delete</h3>
                </div>
                <div className="relative flex-auto p-6 text-center">
                  <p>Are you sure you want to delete this church?</p>
                </div>
                <div className="flex items-center justify-center p-6 border-t border-solid rounded-b border-blueGray-200">
                  <button
                    className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                    type="button"
                    onClick={confirmDeleteChurch}
                    disabled={loadingDeleteChurch}
                  >
                    {loadingDeleteChurch ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    className="px-6 py-2 mb-1 ml-1 text-sm font-bold text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                    type="button"
                    onClick={() => setShowDeleteConfirmModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

           {/* Church List Section (continued) */}
           {(activeSection === 'list' || isMobileMenuOpen === false) && (
              <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h3 className="text-xl text-center font-semibold text-black dark:text-white">
                  List of Churches
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-left dark:bg-meta-4">
                        <th className="p-2 sm:px-4 sm:py-2">Church Name</th>
                        <th className="p-2 sm:px-4 sm:py-2">Zone</th>
                        <th className="p-2 sm:px-4 sm:py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {churches.map((church) => (
                        <tr key={church.slug} className="border-b dark:border-strokedark">
                          <td className="p-2 sm:px-4 sm:py-3">{church.name}</td>
                          <td className="p-2 sm:px-4 sm:py-3">{church.zone}</td>
                          <td className="p-2 sm:px-4 sm:py-3">
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
                    className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 w-full sm:w-auto"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {Math.ceil(pagination.count / 10)}
                  </span>
                  <button 
                    onClick={handleNextPage} 
                    disabled={!pagination.next}
                    className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50 w-full sm:w-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
          <div className="relative w-11/12 max-w-3xl mx-auto my-6">
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none dark:bg-boxdark">
                <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                  <h3 className="text-xl font-semibold">Church Details</h3>
                  <button
                    className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
                    onClick={() => setShowChurchDetailsModal(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="relative flex-auto p-6">
                  <p><strong>Name:</strong> {selectedChurchDetails.name}</p>
                  <p><strong>Zone:</strong> {selectedChurchDetails.zone}</p>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                  <button
                    className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-red-500 uppercase outline-none background-transparent focus:outline-none"
                    type="button"
                    onClick={() => setShowChurchDetailsModal(false)}
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