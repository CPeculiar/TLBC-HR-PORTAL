import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, X, Trash2 } from 'lucide-react';

const ChurchManagement = () => {
   // Separate loading states for different actions
   const [loading, setLoading] = useState(false);
   const [loadingZones, setLoadingZones] = useState(false);
   const [loadingChurches, setLoadingChurches] = useState(false);
   const [loadingAddZone, setLoadingAddZone] = useState(false);
   const [loadingAddChurch, setLoadingAddChurch] = useState(false);
   const [loadingEditZone, setLoadingEditZone] = useState(false);
   const [loadingEditChurch, setLoadingEditChurch] = useState(false);
   const [loadingDeleteZone, setLoadingDeleteZone] = useState(false);
   const [loadingDeleteChurch, setLoadingDeleteChurch] = useState(false);
 
   // Separate success and error messages for different sections
   const [zonesSuccessMessage, setZonesSuccessMessage] = useState(null);
   const [churchesSuccessMessage, setChurchesSuccessMessage] = useState(null);
   const [zonesErrorMessage, setZonesErrorMessage] = useState(null);
   const [churchesErrorMessage, setChurchesErrorMessage] = useState(null);
   const [addZoneSuccessMessage, setAddZoneSuccessMessage] = useState(null);
   const [addChurchSuccessMessage, setAddChurchSuccessMessage] = useState(null);
   const [addZoneErrorMessage, setAddZoneErrorMessage] = useState(null);
   const [addChurchErrorMessage, setAddChurchErrorMessage] = useState(null);
   const [editZoneSuccessMessage, setEditZoneSuccessMessage] = useState(null);
   const [editChurchSuccessMessage, setEditChurchSuccessMessage] = useState(null);
   const [editZoneErrorMessage, setEditZoneErrorMessage] = useState(null);
   const [editChurchErrorMessage, setEditChurchErrorMessage] = useState(null);
   const [deleteZoneSuccessMessage, setDeleteZoneSuccessMessage] = useState(null);
   const [deleteChurchSuccessMessage, setDeleteChurchSuccessMessage] = useState(null);
   const [deleteZoneErrorMessage, setDeleteZoneErrorMessage] = useState(null);
   const [deleteChurchErrorMessage, setDeleteChurchErrorMessage] = useState(null);
 
   // Other existing states remain the same
   const [zones, setZones] = useState([]);
   const [churches, setChurches] = useState([]);
   const [zoneName, setZoneName] = useState('');
   const [churchName, setChurchName] = useState('');
   const [zoneSlug, setZoneSlug] = useState('');
   const [selectedZone, setSelectedZone] = useState('');
   const [selectedChurch, setSelectedChurch] = useState('');
   const [editZoneName, setEditZoneName] = useState('');
   const [editChurchName, setEditChurchName] = useState('');
   const [deleteZoneSlug, setDeleteZoneSlug] = useState('');
   const [deleteChurchSlug, setDeleteChurchSlug] = useState('');
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
 
   // Fetch zones on component load
  useEffect(() => {
    const fetchInitialZones = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/churches/`);
        setZones(response.data.results); // Save zones silently
        setChurches(response.data.results); // Save Churches silently
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
       { message: zonesErrorMessage, setter: setZonesErrorMessage },
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
     zonesErrorMessage, 
     addZoneSuccessMessage, 
     addZoneErrorMessage,
     editZoneSuccessMessage,
     editZoneErrorMessage,
     deleteZoneSuccessMessage,
     deleteZoneErrorMessage
   ]);


  // Fetch Church
  const fetchZones = async (url = `${API_BASE_URL}/churches/`) => {
    setLoadingZones(true);
    setZonesSuccessMessage(null);
    setZonesErrorMessage(null);

    setLoadingChurches(true);
    setChurchesSuccessMessage(null);
    setChurchesErrorMessage(null);
    try {
     const response = await axios.get(`${API_BASE_URL}/churches/`);
      setZones(response.data.results);
      setZonesSuccessMessage('Zones retrieved successfully');
      
      setChurches(response.data.results);
      setChurchesSuccessMessage('List of Churches retrieved successfully');
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
      const response = await axios.get(`${API_BASE_URL}/churches/${slug}/`);
      setZoneChurches(response.data);
      setShowChurchesModal(true);
    } catch (err) {
      setError('Failed to fetch churches');
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
        name: zoneName,
        zone: zoneSlug
      });
      
      setAddZoneSuccessMessage('New zone successfully added');
      setZoneName('');
      // Optionally refresh zone list
      fetchZones();
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
        name: editZoneName,
        zone: zoneSlug
      });
      
      setEditZoneSuccessMessage('Zone updated successfully');
      setSelectedZone('');
      setEditZoneName('');
      fetchZones();
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

  // Handle Next Page
  const handleNextPage = () => {
    if (pagination.next) {
      fetchZones(pagination.next);
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }
  };

  // Handle Previous Page
  const handlePrevPage = () => {
    if (pagination.previous) {
      fetchZones(pagination.previous);
      setPagination(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1
      }));
    }
  };



  return (
    <div className="container mx-auto px-4 py-6">
    <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
      {/* Get Zone List Section */}
      {/* <div className="border-b border-gray-200 p-4 dark:border-strokedark"> */}
      <div className="border-gray-200 p-4 dark:border-strokedark">
        {/* <h3 className="text-lg font-semibold text-black dark:text-white">Get Zone List</h3> */}
        {/* <button
          onClick={fetchZones}
          disabled={loadingZones}
          className="mt-4 w-full rounded bg-primary px-4 py-3 text-white transition-colors duration-300 hover:bg-opacity-90 disabled:bg-opacity-50 sm:max-w-xs"
        >
          {loadingZones ? 'Loading...' : 'Get the List of Zones'}
        </button> */}
        {zonesSuccessMessage && (
            <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-600">
              {zonesSuccessMessage}
            </div>
          )}
          {zonesErrorMessage && (
            <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
              {zonesErrorMessage}
            </div>
          )}
      </div>


          {/* Zone List Section */}
          {zones.length > 0 && (
          <div className="border-b border-gray-200 p-4 dark:border-strokedark">
            <h3 className="text-xl text-center font-semibold text-black dark:text-white">List of Zones</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-left dark:bg-meta-4">
                    <th className="px-4 py-2">Our Zones</th>
                    <th className="px-4 py-2">View</th>
                  </tr>
                </thead>
                <tbody>
                {zones.map((zone) => (
                    <tr key={zone.slug} className=" dark:border-strokedark">
                      <td className="px-4 py-3">{zone.name}</td>
                      <td className="px-4 py-3">
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
          </div>
        )}

 {/* Pagination Section */}
 {zones.length > 0 && (
          <div className="flex flex-col items-center justify-between p-4 sm:flex-row">
            <span className="mb-2 text-sm text-gray-600 dark:text-gray-300 sm:mb-0">
              Total Zones: {zones.length} of {pagination.count}
            </span>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
              <button
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-red-600"
                onClick={() => setZones([])}
              >
                Close
              </button>
              
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-300 ${
                  pagination.currentPage === 1 || loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                }`}
                onClick={handlePrevPage}
                disabled={!pagination.previous || loading}
              >
                Previous
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-300 ${
                  !pagination.next || loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-dark'
                }`}
                onClick={handleNextPage}
                disabled={!pagination.next || loading}
              >
                Next
              </button>
            </div>
          </div>
        )}


        {/* Add New Zone Section */}
        <div className="border-b border-stroke p-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Add New Zone</h3>
          <form onSubmit={handleAddZone} className="mt-4">
            <div className="mb-4">
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Enter Name of the new Zone"
                required
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loadingAddZone}
              className="w-full flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
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

      

        {/* Edit Zone Section */}
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


        {/* Delete Zone Section */}
        <div className="p-4">
          <h3 className="font-medium text-black dark:text-white">Delete Zone</h3>
          <form className="mt-4">
            <div className="mb-4">
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
            </div>
            <button
              type="button"
              onClick={initiateDeleteZone}
              disabled={loadingDeleteZone || !deleteZoneSlug}
              className="w-full flex justify-center rounded bg-red-500 p-3 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50"
            >
              {loadingDeleteZone ? 'Deleting...' : 'Delete Zone'}
            </button>
             {/* Error and Success Messages */}
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
          </form>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Confirm Zone Deletion
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the zone "{deleteZoneSlug}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="rounded px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-meta-4"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteZone}
                className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Churches Modal */}
      {showChurchesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Churches in this Zone
              </h3>
              <button 
                onClick={() => setShowChurchesModal(false)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300"
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
      )}

    </div>
  );
};

export default ChurchManagement;