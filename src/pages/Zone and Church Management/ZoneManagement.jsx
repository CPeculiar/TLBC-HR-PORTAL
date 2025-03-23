import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, X, Trash2, Menu, Plus, Edit, RefreshCcw } from 'lucide-react';

const ZoneManagement = () => {
  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAddZone, setLoadingAddZone] = useState(false);
  const [loadingEditZone, setLoadingEditZone] = useState(false);
  const [loadingDeleteZone, setLoadingDeleteZone] = useState(false);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeSection, setActiveSection] = useState('list');
 
  // Messages states
  const [zonesSuccessMessage, setZonesSuccessMessage] = useState(null);
  const [zonesErrorMessage, setZonesErrorMessage] = useState(null);
  const [addZoneSuccessMessage, setAddZoneSuccessMessage] = useState(null);
  const [addZoneErrorMessage, setAddZoneErrorMessage] = useState(null);
  const [editZoneSuccessMessage, setEditZoneSuccessMessage] = useState(null);
  const [editZoneErrorMessage, setEditZoneErrorMessage] = useState(null);
  const [deleteZoneSuccessMessage, setDeleteZoneSuccessMessage] = useState(null);
  const [deleteZoneErrorMessage, setDeleteZoneErrorMessage] = useState(null);
 
  // Other states
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

  // Fetch zones on component load
  useEffect(() => {
    const fetchInitialZones = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/zones/`);
        setZones(response.data.results);
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: 1,
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch initial zones:', error);
        setLoading(false);
      }
    };
    fetchInitialZones();
  }, []);

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
  const fetchZones = async () => {
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
      setZonesErrorMessage('Failed to fetch zone churches');
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
        setEditZoneErrorMessage('Please select a zone');
        setLoadingEditZone(false);
        return;
      }

      await axios.put(`${API_BASE_URL}/zones/${selectedZoneData.slug}/`, {
        name: editZoneName
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
        setDeleteZoneErrorMessage('Please select a zone to delete');
        setLoadingDeleteZone(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header with Mobile Menu Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zone Management</h1>
        <button 
          onClick={toggleMobileMenu} 
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto mt-20">
          <div className="p-4 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Navigation</h2>
              <button 
                onClick={toggleMobileMenu} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => handleSectionChange('list')}
                className={`w-full flex items-center p-4 rounded-lg transition-all ${
                  activeSection === 'list' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <RefreshCcw size={18} className="mr-3" />
                View Zones
              </button>
              <button 
                onClick={() => handleSectionChange('add')}
                className={`w-full flex items-center p-4 rounded-lg transition-all ${
                  activeSection === 'add' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Plus size={18} className="mr-3" />
                Add Zone
              </button>
              <button 
                onClick={() => handleSectionChange('edit')}
                className={`w-full flex items-center p-4 rounded-lg transition-all ${
                  activeSection === 'edit' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Edit size={18} className="mr-3" />
                Edit Zone
              </button>
              <button 
                onClick={() => handleSectionChange('delete')}
                className={`w-full flex items-center p-4 rounded-lg transition-all ${
                  activeSection === 'delete' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Trash2 size={18} className="mr-3" />
                Delete Zone
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 px-2">Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleSectionChange('list')}
                className={`w-full flex items-center p-3 rounded-lg transition-all ${
                  activeSection === 'list' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCcw size={18} className="mr-3" />
                View Zones
              </button>
              <button 
                onClick={() => handleSectionChange('add')}
                className={`w-full flex items-center p-3 rounded-lg transition-all ${
                  activeSection === 'add' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Plus size={18} className="mr-3" />
                Add Zone
              </button>
              <button 
                onClick={() => handleSectionChange('edit')}
                className={`w-full flex items-center p-3 rounded-lg transition-all ${
                  activeSection === 'edit' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Edit size={18} className="mr-3" />
                Edit Zone
              </button>
              <button 
                onClick={() => handleSectionChange('delete')}
                className={`w-full flex items-center p-3 rounded-lg transition-all ${
                  activeSection === 'delete' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Trash2 size={18} className="mr-3" />
                Delete Zone
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-full md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Add Zone Section */}
            {activeSection === 'add' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Zone</h3>
                <form onSubmit={handleAddZone}>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      placeholder="Enter Zone Name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAddZone || !zoneName.trim()}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAddZone ? (
                      <>
                        <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding Zone...
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="mr-2" />
                        Add Zone
                      </>
                    )}
                  </button>
                  {addZoneSuccessMessage && (
                    <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-700 flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {addZoneSuccessMessage}
                    </div>
                  )}
                  {addZoneErrorMessage && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {addZoneErrorMessage}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Edit Zone Section */}
            {activeSection === 'edit' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Zone</h3>
                <form onSubmit={handleEditZone}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Zone to Edit
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => {
                        setSelectedZone(e.target.value);
                        const zone = zones.find(z => z.name === e.target.value);
                        if (zone) setEditZoneName(zone.name);
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
                    >
                      <option value="">Select a zone</option>
                      {zones.map((zone) => (
                        <option key={zone.slug} value={zone.name}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedZone && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Zone Name
                      </label>
                      <input
                        type="text"
                        value={editZoneName}
                        onChange={(e) => setEditZoneName(e.target.value)}
                        placeholder="Enter New Zone Name"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loadingEditZone || !selectedZone || !editZoneName.trim()}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-primary text-white font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingEditZone ? (
                      <>
                        <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating Zone...
                      </>
                    ) : (
                      <>
                        <Edit size={18} className="mr-2" />
                        Update Zone
                      </>
                    )}
                  </button>
                  {editZoneSuccessMessage && (
                    <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-700 flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {editZoneSuccessMessage}
                    </div>
                  )}
                  {editZoneErrorMessage && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {editZoneErrorMessage}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Delete Zone Section */}
            {activeSection === 'delete' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Delete Zone</h3>
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Zone to Delete
                    </label>
                    <select
                      value={deleteZoneSlug}
                      onChange={(e) => setDeleteZoneSlug(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
                    >
                      <option value="">Select a zone</option>
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
                    className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingDeleteZone ? (
                      <>
                        <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting Zone...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} className="mr-2" />
                        Delete Zone
                      </>
                    )}
                  </button>
                  {deleteZoneSuccessMessage && (
                    <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-700 flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {deleteZoneSuccessMessage}
                    </div>
                  )}
                  {deleteZoneErrorMessage && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 flex items-start">
                      <div className="flex-shrink-0 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {deleteZoneErrorMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Zone List Section */}
            {(initialLoad || activeSection === 'list') && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">All Zones</h3>
                  <button 
                    onClick={fetchZones}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <RefreshCcw size={16} className="mr-2" />
                    Refresh
                  </button>
                </div>
                
                {zonesSuccessMessage && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700">
                    {zonesSuccessMessage}
                  </div>
                )}
                
                {zonesErrorMessage && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700">
                    {zonesErrorMessage}
                  </div>
                )}
                
                <div className="bg-white rounded-lg overflow-hidden">
                  {loadingZones ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-primary"></div>
                    </div>
                  ) : zones.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left font-medium text-gray-700 border-b">Zone Name</th>
                            <th className="py-3 px-4 text-center font-medium text-gray-700 border-b">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zones.map((zone) => (
                            <tr key={zone.slug} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-4">{zone.name}</td>
                              <td className="py-3 px-4 text-center">
                                <button 
                                  onClick={() => handleViewZoneChurches(zone.slug)} 
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-primary hover:bg-blue-100 transition-colors mx-1"
                                  title="View Churches"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedZone(zone.name);
                                    setEditZoneName(zone.name);
                                    handleSectionChange('edit');
                                  }} 
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors mx-1"
                                  title="Edit Zone"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setDeleteZoneSlug(zone.name);
                                    handleSectionChange('delete');
                                  }} 
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors mx-1"
                                  title="Delete Zone"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No Zones Found</h3>
                      <p className="text-gray-500 mb-4">Get started by adding your first zone</p>
                      <button 
                        onClick={() => handleSectionChange('add')} 
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
                      >
                        <Plus size={18} className="mr-2" />
                        Add New Zone
                      </button>
                    </div>
                  )}
                  
                  {/* Pagination Controls */}
                  {zones.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 px-4 py-3 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {pagination.currentPage === 1 ? 1 : ((pagination.currentPage - 1) * 10) + 1} - {Math.min(pagination.currentPage * 10, pagination.count)} of {pagination.count} zones
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={handlePrevPage} 
                          disabled={!pagination.previous}
                          className={`px-3 py-2 rounded-md flex items-center ${
                            pagination.previous 
                              ? 'bg-primary text-white hover:bg-opacity-90' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>
                        <button 
                          onClick={handleNextPage} 
                          disabled={!pagination.next}
                          className={`px-3 py-2 rounded-md flex items-center ${
                            pagination.next 
                              ? 'bg-primary text-white hover:bg-opacity-90' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Next
                          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md mx-auto animate-fade-in-up">
            <div className="relative flex flex-col w-full bg-white rounded-xl shadow-2xl dark:bg-gray-800">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
                <button 
                  onClick={cancelDelete}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto mb-4">
                  <Trash2 size={28} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Delete Zone</h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete <span className="font-semibold">{deleteZoneSlug}</span>? All churches in this zone will need to be reassigned. This action cannot be undone.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteZone}
                    disabled={loadingDeleteZone}
                    className="inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900 disabled:opacity-50"
                  >
                    {loadingDeleteZone ? (
                      <>
                        <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Zone'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Churches Modal */}
      {showChurchesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md mx-auto animate-fade-in-up">
            <div className="relative flex flex-col w-full bg-white rounded-xl shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Churches in Zone
                </h3>
                <button 
                  onClick={() => setShowChurchesModal(false)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {zoneChurches.length > 0 ? (
                  <ul className="divide-y divide-gray-200 max-h-[50vh] overflow-y-auto">
                    {zoneChurches.map((church) => (
                      <li 
                        key={church.slug} 
                        className="py-3 flex items-center hover:bg-gray-50 rounded-lg px-2"
                      >
                        <div className="flex-shrink-0 mr-3 w-8 h-8 bg-primary bg-opacity-10 text-primary rounded-full flex items-center justify-center">
                          {church.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{church.name}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Churches Found</h3>
                    <p className="text-gray-500">This zone doesn't have any churches assigned to it yet.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-center p-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowChurchesModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ZoneManagement;