import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, X, Trash2, Menu, ChevronLeft, ChevronRight, Plus, Edit, RefreshCw } from 'lucide-react';

const ChurchManagement = () => {
  // States for Church Management
  const [loading, setLoading] = useState(false);
  const [loadingChurches, setLoadingChurches] = useState(false);
  const [loadingAddChurch, setLoadingAddChurch] = useState(false);
  const [loadingEditChurch, setLoadingEditChurch] = useState(false);
  const [loadingDeleteChurch, setLoadingDeleteChurch] = useState(false);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('list');
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
      setLoading(true);
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
        setChurchesErrorMessage('Failed to load data. Please try again.');
      } finally {
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
        setLoadingAddChurch(false);
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
        setLoadingEditChurch(false);
        return;
      }

      if (!selectedZoneData) {
        setEditChurchErrorMessage('Please select a zone');
        setLoadingEditChurch(false);
        return;
      }

      await axios.put(`${API_BASE_URL}/churches/${selectedChurchData.slug}/`, {
        name: editChurchName,
        zone: selectedZoneData.slug
      });
      
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
        setLoadingDeleteChurch(false);
        return;
      }

      await axios.delete(`${API_BASE_URL}/churches/${selectedChurchData.slug}/`);
      
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
      setLoadingChurches(true);
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
      } finally {
        setLoadingChurches(false);
      }
    }
  };

  const handlePrevPage = async () => {
    if (pagination.previous) {
      setLoadingChurches(true);
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
      } finally {
        setLoadingChurches(false);
      }
    }
  };

  // Mobile Menu Toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-boxdark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-primary font-medium dark:text-white">Loading church data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Church Management
          </h1>
          <button 
            onClick={toggleMobileMenu} 
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-white text-primary shadow-sm dark:bg-meta-4 dark:text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-75 z-50 overflow-hidden mt-20">
            <div className="absolute inset-0 overflow-y-auto bg-white dark:bg-boxdark">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
                  <button 
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-meta-4 text-gray-600 dark:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <nav className="space-y-3">
                  <button 
                    onClick={() => handleSectionChange('list')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeSection === 'list' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-800 dark:bg-meta-4 dark:text-white'
                    }`}
                  >
                    <Eye size={20} className="mr-3" />
                    <span className="font-medium">Church List</span>
                  </button>
                  
                  <button 
                    onClick={() => handleSectionChange('add')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeSection === 'add' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-800 dark:bg-meta-4 dark:text-white'
                    }`}
                  >
                    <Plus size={20} className="mr-3" />
                    <span className="font-medium">Add Church</span>
                  </button>
                  
                  <button 
                    onClick={() => handleSectionChange('edit')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeSection === 'edit' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-800 dark:bg-meta-4 dark:text-white'
                    }`}
                  >
                    <Edit size={20} className="mr-3" />
                    <span className="font-medium">Edit Church</span>
                  </button>
                  
                  <button 
                    onClick={() => handleSectionChange('delete')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      activeSection === 'delete' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-800 dark:bg-meta-4 dark:text-white'
                    }`}
                  >
                    <Trash2 size={20} className="mr-3" />
                    <span className="font-medium">Delete Church</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-6">
          {/* Sidebar for Desktop */}
          <div className="hidden md:block md:col-span-3 lg:col-span-2">
            <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm sticky top-6">
              <div className="py-4 px-2">
                <h3 className="px-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-4">Navigation</h3>
                <nav className="space-y-2">
                  <button 
                    onClick={() => handleSectionChange('list')}
                    className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                      activeSection === 'list' 
                        ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-meta-4'
                    }`}
                  >
                    <Eye size={18} className="mr-3" />
                    <span>Church List</span>
                  </button>
                  
                  <button 
                    onClick={() => handleSectionChange('add')}
                    className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                      activeSection === 'add' 
                        ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-meta-4'
                    }`}
                  >
                    <Plus size={18} className="mr-3" />
                    <span>Add Church</span>
                  </button>
                  
                  <button 
                    onClick={() => handleSectionChange('edit')}
                    className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                      activeSection === 'edit' 
                        ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-meta-4'
                    }`}
                  >
                    <Edit size={18} className="mr-3" />
                    <span>Edit Church</span>
                  </button>
                  
                  <button 
                    onClick={() => handleSectionChange('delete')}
                    className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                      activeSection === 'delete' 
                        ? 'bg-primary bg-opacity-10 text-primary font-medium' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-meta-4'
                    }`}
                  >
                    <Trash2 size={18} className="mr-3" />
                    <span>Delete Church</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9 lg:col-span-10">
            {/* Church List Section */}
            {activeSection === 'list' && (
              <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Church Directory</h2>
                    <button 
                      onClick={() => {
                        // Refresh church list
                        const fetchChurches = async () => {
                          setLoadingChurches(true);
                          try {
                            const response = await axios.get(`${API_BASE_URL}/churches/`);
                            setChurches(response.data.results);
                            setPagination({
                              count: response.data.count,
                              next: response.data.next,
                              previous: response.data.previous,
                              currentPage: 1,
                            });
                            setSuccessMessageWithTimeout('Churches refreshed', setChurchesSuccessMessage);
                          } catch (error) {
                            setChurchesErrorMessage('Failed to refresh church list');
                          } finally {
                            setLoadingChurches(false);
                          }
                        };
                        fetchChurches();
                      }}
                      className="flex items-center p-2 rounded-lg text-primary hover:bg-gray-100 dark:hover:bg-meta-4"
                    >
                      <RefreshCw size={18} className={loadingChurches ? "animate-spin" : ""} />
                    </button>
                  </div>

                  {/* Church List Table */}
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-meta-4">
                        <tr>
                          <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">
                            Church Name
                          </th>
                          <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">
                            Zone
                          </th>
                          <th scope="col" className="px-4 py-3.5 text-center text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-boxdark">
                        {churches.length > 0 ? (
                          churches.map((church) => (
                            <tr key={church.slug} className="hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors">
                              <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-white">
                                {church.name}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-white">
                                {church.zone}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-center">
                                <button 
                                  onClick={() => handleViewChurchDetails(church.slug)} 
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                              No churches found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {churches.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {churches.length} of {pagination.count} churches
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={handlePrevPage} 
                          disabled={!pagination.previous || loadingChurches}
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-boxdark dark:text-white dark:border-gray-600 dark:hover:bg-meta-4"
                        >
                          <ChevronLeft size={16} className="mr-1" />
                          Previous
                        </button>
                        <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-white">
                          Page {pagination.currentPage} of {Math.ceil(pagination.count / 10) || 1}
                        </span>
                        <button 
                          onClick={handleNextPage} 
                          disabled={!pagination.next || loadingChurches}
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-boxdark dark:text-white dark:border-gray-600 dark:hover:bg-meta-4"
                        >
                          Next
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Success/Error Messages */}
                  {churchesSuccessMessage && (
                    <div className="mt-4 p-3 rounded-md bg-green-50 text-green-700 text-sm dark:bg-green-900/20 dark:text-green-400">
                      {churchesSuccessMessage}
                    </div>
                  )}
                  {churchesErrorMessage && (
                    <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                      {churchesErrorMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Church Section */}
            {activeSection === 'add' && (
              <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Add New Church</h2>
                  
                  <form onSubmit={handleAddChurch} className="space-y-6">
                    <div>
                      <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Church Name
                      </label>
                      <input
                        id="churchName"
                        type="text"
                        value={churchName}
                        onChange={(e) => setChurchName(e.target.value)}
                        placeholder="Enter church name"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400 dark:border-gray-600 dark:bg-boxdark dark:text-white dark:placeholder-gray-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="zoneSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Church Zone
                      </label>
                      <select
                        id="zoneSelect"
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:border-gray-600 dark:bg-boxdark dark:text-white"
                      >
                        <option value="" disabled>Select a zone</option>
                        {zones.map((zone) => (
                          <option key={zone.slug} value={zone.name}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={loadingAddChurch}
                        className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingAddChurch ? (
                          <>
                            <RefreshCw size={18} className="animate-spin mr-2" />
                            Adding Church...
                          </>
                        ) : (
                          <>
                            <Plus size={18} className="mr-2" />
                            Add New Church
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Success/Error Messages */}
                    {addChurchSuccessMessage && (
                      <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm dark:bg-green-900/20 dark:text-green-400">
                        {addChurchSuccessMessage}
                      </div>
                    )}
                    {addChurchErrorMessage && (
                      <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                        {addChurchErrorMessage}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Edit Church Section */}
            {activeSection === 'edit' && (
              <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Edit Church</h2>
                  
                  <form onSubmit={handleEditChurch} className="space-y-6">
                    <div>
                      <label htmlFor="selectChurch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Church to Edit
                      </label>
                      <select
                        id="selectChurch"
                        value={selectedChurch}
                        onChange={(e) => {
                          const church = churches.find(c => c.name === e.target.value);
                          setSelectedChurch(e.target.value);
                          if (church) {
                            setEditChurchName(church.name);
                            setSelectedZone(church.zone);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:border-gray-600 dark:bg-boxdark dark:text-white"
                      >
                        <option value="">Select a church</option>
                        {churches.map((church) => (
                          <option key={church.slug} value={church.name}>
                            {church.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedChurch && (
                      <>
                        <div>
                          <label htmlFor="editChurchName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Church Name
                          </label>
                          <input
                            id="editChurchName"
                            type="text"
                            value={editChurchName}
                            onChange={(e) => setEditChurchName(e.target.value)}
                            placeholder="New church name"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400 dark:border-gray-600 dark:bg-boxdark dark:text-white dark:placeholder-gray-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="editZoneSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Zone
                          </label>
                          <select
                            id="editZoneSelect"
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:border-gray-600 dark:bg-boxdark dark:text-white"
                          >
                            <option value="" disabled>Select a zone</option>
                            {zones.map((zone) => (
                              <option key={zone.slug} value={zone.name}>
                                {zone.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <button
                            type="submit"
                            disabled={loadingEditChurch}
                            className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {loadingEditChurch ? (
                              <>
                                <RefreshCw size={18} className="animate-spin mr-2" />
                                Updating Church...
                              </>
                            ) : (
                              <>
                                <Edit size={18} className="mr-2" />
                                Update Church
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                    
                    {/* Success/Error Messages */}
                    {editChurchSuccessMessage && (
                      <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm dark:bg-green-900/20 dark:text-green-400">
                        {editChurchSuccessMessage}
                      </div>
                    )}
                    {editChurchErrorMessage && (
                      <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                        {editChurchErrorMessage}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Delete Church Section */}
            {activeSection === 'delete' && (
              <div className="bg-white dark:bg-boxdark rounded-lg shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Delete Church</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="deleteChurchSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Church to Delete
                      </label>
                      <select
                        id="deleteChurchSelect"
                        value={deleteChurchSlug}
                        onChange={(e) => setDeleteChurchSlug(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:border-gray-600 dark:bg-boxdark dark:text-white"
                      >
                        <option value="">Select a church</option>
                        {churches.map((church) => (
                          <option key={church.slug} value={church.name}>
                            {church.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <button
                        onClick={initiateDeleteChurch}
                        disabled={!deleteChurchSlug || loadingDeleteChurch}
                        className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingDeleteChurch ? (
                          <>
                            <RefreshCw size={18} className="animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={18} className="mr-2" />
                            Delete Church
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Success/Error Messages */}
                    {deleteChurchSuccessMessage && (
                      <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm dark:bg-green-900/20 dark:text-green-400">
                        {deleteChurchSuccessMessage}
                      </div>
                    )}
                    {deleteChurchErrorMessage && (
                      <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                        {deleteChurchErrorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Church Details Modal */}
      {showChurchDetailsModal && selectedChurchDetails && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto rounded-lg shadow-lg overflow-hidden">
            <div className="bg-white dark:bg-boxdark max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Church Details
                </h3>
                <button
                  onClick={() => setShowChurchDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Church Name</p>
                    <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                      {selectedChurchDetails.name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Zone</p>
                    <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                      {selectedChurchDetails.zone}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowChurchDetailsModal(false)}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-gray-600 dark:bg-meta-4 dark:text-white dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm mx-auto rounded-lg shadow-lg overflow-hidden">
            <div className="bg-white dark:bg-boxdark">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  Confirm Delete
                </h3>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Are you sure?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You are about to delete this church. This action cannot be undone.
                </p>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:border-gray-600 dark:bg-meta-4 dark:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmDeleteChurch}
                  disabled={loadingDeleteChurch}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingDeleteChurch ? (
                    <>
                      <RefreshCw size={16} className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
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