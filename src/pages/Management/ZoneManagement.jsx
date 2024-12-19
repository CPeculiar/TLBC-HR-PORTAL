import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, X, Trash2,  Menu } from 'lucide-react';

const ZoneManagement = () => {
   // Separate loading states for different actions
   
   // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAddZone, setLoadingAddZone] = useState(false);
  const [loadingEditZone, setLoadingEditZone] = useState(false);
  const [loadingDeleteZone, setLoadingDeleteZone] = useState(false);

   // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
 
   // Separate success and error messages for different sections
   const [zonesSuccessMessage, setZonesSuccessMessage] = useState(null);
   const [zonesErrorMessage, setZonesErrorMessage] = useState(null);
   const [addZoneSuccessMessage, setAddZoneSuccessMessage] = useState(null);
   const [addZoneErrorMessage, setAddZoneErrorMessage] = useState(null);
   const [editZoneSuccessMessage, setEditZoneSuccessMessage] = useState(null);
   const [editZoneErrorMessage, setEditZoneErrorMessage] = useState(null);
   const [deleteZoneSuccessMessage, setDeleteZoneSuccessMessage] = useState(null);
   const [deleteZoneErrorMessage, setDeleteZoneErrorMessage] = useState(null);
 
   // Other existing states remain the same
   const [zones, setZones] = useState([]);
   const [zoneName, setZoneName] = useState('');
   const [selectedZone, setSelectedZone] = useState('');
   const [editZoneName, setEditZoneName] = useState('');
   const [deleteZoneSlug, setDeleteZoneSlug] = useState('');
   const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
   const [showChurchesModal, setShowChurchesModal] = useState(false);
   const [zoneChurches, setZoneChurches] = useState([]);
   const [error, setError] = useState('');
   const [pagination, setPagination] = useState({
     currentPage: 1,
     count: 0,
     next: null,
     previous: null
   });

   // API base URL
  const API_BASE_URL = 'https://tlbc-platform-api.onrender.com/api';

  // Helper function to set and auto-clear success message
  const setSuccessMessageWithTimeout = (message, setMessageFn) => {
    setMessageFn(message);
    
    const timeoutId = setTimeout(() => {
      setMessageFn(null);
    }, 5000);

    return timeoutId;
  };
 
   // Fetch zones on component load
  useEffect(() => {
    const fetchInitialZones = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/zones/`);
        setZones(response.data.results); // Save zones silently
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: 1,
        });
      } catch (error) {
        console.error('Failed to fetch initial zones:', error);
      }
    };
    fetchInitialZones();
  }, []); // Runs once on component mount


   // Clear messages after 5 seconds
   useEffect(() => {
     const timeouts = [
       { message: zonesSuccessMessage, setter: setZonesSuccessMessage },
       { message: addZoneSuccessMessage, setter: setAddZoneSuccessMessage },
       { message: addZoneErrorMessage, setter: setAddZoneErrorMessage },
       { message: editZoneSuccessMessage, setter: setEditZoneSuccessMessage },
       { message: editZoneErrorMessage, setter: setEditZoneErrorMessage },
       { message: deleteZoneSuccessMessage, setter: setDeleteZoneSuccessMessage },
       { message: deleteZoneErrorMessage, setter: setDeleteZoneErrorMessage }
     ];
 
     const clearTimeouts = timeouts.map(({ message, setter }) => {
       if (message) {
         return setTimeout(() => setter(null), 5000);
       }
       return null;
     });
 
     return () => {
       clearTimeouts.forEach(timeout => {
         if (timeout) clearTimeout(timeout);
       });
     };
   }, [
     zonesSuccessMessage, 
     addZoneSuccessMessage, 
     addZoneErrorMessage,
     editZoneSuccessMessage,
     editZoneErrorMessage,
     deleteZoneSuccessMessage,
     deleteZoneErrorMessage
   ]);

// Section Selection Handler
const handleSectionChange = (section) => {
    setActiveSection(section);
    setInitialLoad(false);
    setIsMobileMenuOpen(false);
  };

  // Mobile Menu Toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch Zones
  const fetchZones = async (url = `${API_BASE_URL}/zones/`) => {
    setLoadingZones(true);
    setZonesSuccessMessage(null);
    setZonesErrorMessage(null);
    try {
     const response = await axios.get(`${API_BASE_URL}/zones/`);
      setZones(response.data.results);
      setZonesSuccessMessage('Zones retrieved successfully');
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        currentPage: pagination.currentPage
      });
      setLoadingZones(false);
    } catch (err) {
      setZonesErrorMessage('Failed to fetch zones');
      setLoadingZones(false);
    }
  };

  // View Zone Churches
  const handleViewZoneChurches = async (slug) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/zones/${slug}/`);
      setZoneChurches(response.data.churches);
      setShowChurchesModal(true);
    } catch (err) {
      setError('Failed to fetch zone churches');
      setZonesErrorMessage('Failed to fetch zones');
    }
  };

  // Add New Zone
  const handleAddZone = async (e) => {
    e.preventDefault();
    setLoadingAddZone(true);
    setAddZoneSuccessMessage(null);
    setAddZoneErrorMessage(null);

    try {
      await axios.post(`${API_BASE_URL}/zones/`, {
        name: zoneName
      });
      
      setAddZoneSuccessMessage('New zone successfully added');
      setZoneName('');
      // Optionally refresh zone list
      fetchZones();

      const response = await axios.get(`${API_BASE_URL}/zones/`);
      setZones(response.data.results);
    } catch (err) {
        setAddZoneErrorMessage('Failed to add zone. Please try again.');
    } finally {
        setLoadingAddZone(false);
    }
  };

  // Edit Zone
  const handleEditZone = async (e) => {
    e.preventDefault();
    setLoadingEditZone(true);
    setEditZoneSuccessMessage(null);
    setEditZoneErrorMessage(null);

    try {
      // Find the slug of the selected zone
      const selectedZoneData = zones.find(zone => zone.name === selectedZone);
      
      if (!selectedZoneData) {
        setError('Please select a zone');
        return;
      }

      await axios.put(`${API_BASE_URL}/zones/${selectedZoneData.slug}/`, {
        name: editZoneName
      });
      
      setEditZoneSuccessMessage('Zone updated successfully');
      setSelectedZone('');
      setEditZoneName('');
      fetchZones();

      // Refresh zones list
      const response = await axios.get(`${API_BASE_URL}/zones/`);
      setZones(response.data.results);
    } catch (err) {
      setEditZoneErrorMessage('Failed to update zone. Please try again.');
    } finally {
      setLoadingEditZone(false);
    }
  };


  // Initiate Delete Zone
  const initiateDeleteZone = () => {
    if (deleteZoneSlug) {
      setShowDeleteConfirmModal(true);
    }
  };

  // Confirm Delete Zone
  const confirmDeleteZone = async () => {
    setLoadingDeleteZone(true);
    setDeleteZoneErrorMessage('');
    setDeleteZoneSuccessMessage('');

    try {
      // Find the slug of the selected zone
      const selectedZoneData = zones.find(zone => zone.name === deleteZoneSlug);
      
      if (!selectedZoneData) {
        setError('Please select a zone to delete');
        return;
      }

      await axios.delete(`${API_BASE_URL}/zones/${selectedZoneData.slug}/`);
      
      setDeleteZoneSuccessMessage('Zone deleted successfully');
      setDeleteZoneSlug('');
      setShowDeleteConfirmModal(false);
      fetchZones();

      const response = await axios.get(`${API_BASE_URL}/zones/`);
      setZones(response.data.results);
    } catch (err) {
      setDeleteZoneErrorMessage('Failed to delete zone. Please try again.');
    } finally {
      setLoadingDeleteZone(false);
    }
  };

  // Cancel Delete
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setDeleteZoneSlug('');
  };

  // Delete Zone
  const handleDeleteZone = async (e) => {
    e.preventDefault();
    setLoadingDeleteZone(true);
    setDeleteZoneErrorMessage('');
    setDeleteZoneSuccessMessage('');

    try {
      // Find the slug of the selected zone
      const selectedZoneData = zones.find(zone => zone.name === deleteZoneSlug);
      
      if (!selectedZoneData) {
        setError('Please select a zone to delete');
        return;
      }

      await axios.delete(`${API_BASE_URL}/zones/${selectedZoneData.slug}/`);
      
      setDeleteZoneSuccessMessage('Zone deleted successfully');
      setDeleteZoneSlug('');
      fetchZones();
    } catch (err) {
     setDeleteZoneErrorMessage('Failed to delete zone. Please try again.');
    } finally {
      setLoadingDeleteZone(false);
    }
  };

  // Pagination Handlers
  // Handle Next Page
//   const handleNextPage = () => {
//     if (pagination.next) {
//       fetchZones(pagination.next);
//       setPagination(prev => ({
//         ...prev,
//         currentPage: prev.currentPage + 1
//       }));
//     }
//   };

  // Handle Previous Page
//   const handlePrevPage = () => {
//     if (pagination.previous) {
//       fetchZones(pagination.previous);
//       setPagination(prev => ({
//         ...prev,
//         currentPage: prev.currentPage - 1
//       }));
//     }
//   };


// Pagination Handlers
const handleNextPage = async () => {
    if (pagination.next) {
      try {
        const response = await axios.get(pagination.next);
        setZones(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: pagination.currentPage + 1
        });
      } catch (err) {
        setZonesErrorMessage('Failed to load next page');
      }
    }
  };

  const handlePrevPage = async () => {
    if (pagination.previous) {
      try {
        const response = await axios.get(pagination.previous);
        setZones(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: pagination.currentPage - 1
        });
      } catch (err) {
        setZonesErrorMessage('Failed to load previous page');
      }
    }
  };


  // Mobile Section Selection
  const handleMobileSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
    setInitialLoad(false);
  };

  
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

  return (
    <div className="container mx-auto px-4 py-6">
    {/* Mobile Menu Toggle */}
    <div className="md:hidden flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Zone Management</h2>
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
              Add New Zone
            </button>
            <button 
              onClick={() => handleMobileSectionChange('edit')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'edit' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-black'
              }`}
            >
              Edit Zone
            </button>
            <button 
              onClick={() => handleMobileSectionChange('delete')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'delete' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-black'
              }`}
            >
              Delete Zone
            </button>
            <button 
              onClick={() => handleMobileSectionChange('list')}
              className={`w-full p-3 text-left rounded ${
                activeSection === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-black'
              }`}
            >
              Zone List
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
            onClick={() => handleSectionChange('add')}
            className={`w-full p-3 text-left rounded ${
              activeSection === 'add' 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-200'
            }`}
          >
            Add New Zone
          </button>
          <button 
            onClick={() => handleSectionChange('edit')}
            className={`w-full p-3 text-left rounded ${
              activeSection === 'edit' 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-200'
            }`}
          >
            Edit Zone
          </button>
          <button 
            onClick={() => handleSectionChange('delete')}
            className={`w-full p-3 text-left rounded ${
              activeSection === 'delete' 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-200'
            }`}
          >
            Delete Zone
          </button>
          <button 
            onClick={() => handleSectionChange('list')}
            className={`w-full p-3 text-left rounded ${
              activeSection === 'list' 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-200'
            }`}
          >
            Zone List
          </button>
        </div>
      </div>


 {/* Main Content Area */}
 <div className="col-span-full md:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
            {/* Add Zone Section */}
            {(initialLoad || activeSection === 'add') && (
              <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Add New Zone</h3>
                <form onSubmit={handleAddZone} className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      placeholder="Enter Zone Name"
                      required
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAddZone}
                    className="mt-4 w-full flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                  >
                    {loadingAddZone ? 'Adding...' : 'Add Zone'}
                  </button>
                  {addZoneSuccessMessage && (
                    <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-600">
                      {addZoneSuccessMessage}
                    </div>
                  )}
                  {addZoneErrorMessage && (
                    <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                      {addZoneErrorMessage}
                      </div>
                  )}
                  </form>
                  </div>
            )}

        {/* Edit Zone Section */}
        {(initialLoad || activeSection === 'edit') && (
              <div className="border-b border-stroke p-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Edit Zone</h3>
          <form onSubmit={handleEditZone} className="mt-4">
            <div className="mb-4">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
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
            {selectedZone && (
                <>
              <div className="mb-4">
                <input
                  type="text"
                  value={editZoneName}
                  onChange={(e) => setEditZoneName(e.target.value)}
                  placeholder="Enter New Zone Name"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              </>
            )}
            <button
              type="submit"
              disabled={loadingEditZone || !selectedZone}
              className="w-full flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
            >
              {loadingEditZone ? 'Updating...' : 'Update Zone'}
            </button>
            {editZoneSuccessMessage && (
              <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-600">
                {editZoneSuccessMessage}
              </div>
            )}
            {editZoneErrorMessage && (
              <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                {editZoneErrorMessage}
              </div>
            )}
          </form>
        </div>
        )}


        {/* Delete Zone Section */}
        {(initialLoad || activeSection === 'delete') && (
              <div className="border-b border-stroke p-4 dark:border-strokedark">
             <h3 className="font-medium text-black dark:text-white">Delete Zone</h3>
          <div className="mt-4">
              <select
                value={deleteZoneSlug}
                onChange={(e) => setDeleteZoneSlug(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            >
                <option value="">Select Zone to Delete</option>
                {zones.map((zone) => (
                  <option key={zone.slug} value={zone.name}>
                    {zone.name}
                  </option>
                ))}
              </select>
            <button
              type="button"
              onClick={initiateDeleteZone}
              disabled={loadingDeleteZone || !deleteZoneSlug}
              className="mt-4 w-full flex justify-center items-center rounded bg-red-500 p-3 font-medium text-white hover:bg-red-600 disabled:bg-opacity-50"
            >
             <Trash2 className="mr-2" /> {loadingDeleteZone ? 'Deleting...' : 'Delete Zone'}
            </button>
            {deleteZoneSuccessMessage && (
              <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-600">
                {deleteZoneSuccessMessage}
              </div>
            )}
            {deleteZoneErrorMessage && (
              <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                {deleteZoneErrorMessage}
              </div>
            )}
        </div>
      </div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 p-4">
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative flex flex-col w-full bg-white rounded-lg shadow-xl dark:bg-gray-800">
        {/* Modal Header */}
        <div className="flex items-center justify-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
        </div>

         {/* Modal Content */}
         <div className="p-6 text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete the zone "{deleteZoneSlug}"? 
            </p>
            <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 p-4 border-t dark:border-gray-700">
             <button
                type="button"
                onClick={cancelDelete}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteZone}
                disabled={loadingDeleteZone}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
          >
                 {loadingDeleteZone ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
 
         {/* Church List Section (continued) */}
         {(initialLoad || activeSection === 'list') && (
              <div className="border-b border-gray-200 border-stroke p-4 dark:border-strokedark">
                <h3 className="text-xl text-center font-semibold text-black dark:text-white">
                  List of Zones
                </h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100 text-left dark:bg-meta-4">
                        <th className="p-2 sm:px-4 sm:py-2">Our Zones</th>
                        <th className="p-2 sm:px-4 sm:py-2">View</th>
                      </tr>
                    </thead>
                    <tbody>
                {zones.map((zone) => (
                    <tr key={zone.slug} className="border-b dark:border-strokedark">
                      <td className="p-2 sm:px-4 sm:py-3">{zone.name}</td>
                      <td className="p-2 sm:px-4 sm:py-3">
                        <button 
                          onClick={() => handleViewZoneChurches(zone.slug)} 
                           className="text-primary hover:text-opacity-70"
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


      {/* Churches Modal */}
      {showChurchesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 p-4">
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative flex flex-col w-full bg-white rounded-lg shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Churches in this Zone
              </h3>
              <button 
                onClick={() => setShowChurchesModal(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                >
                <X size={24} />
              </button>
            </div>
 
            {zoneChurches.length > 0 ? (
              <ul className="space-y-2">
                {zoneChurches.map((church) => (
                  <li 
                    key={church.slug} 
                    className="rounded bg-gray-100 p-2 dark:bg-meta-4"
                  >
                    {church.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                No churches found in this zone.
              </p>
            )}
          </div>
        </div>
        </div>
      )}
      </div>
      
    
  )};

export default ZoneManagement;