import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Eye, Trash2, X, Loader2, Calendar, User, FileText, Headphones as HeadphonesIcon, Video as VideoIcon, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

// Protected Media Component to prevent downloads
const ProtectedMedia = ({ type, source, title }) => {
  const mediaRef = useRef(null);
  
  // Prevent right-click context menu
  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };
  
  // Prevent keyboard shortcuts for saving
  const preventKeyboardShortcuts = (e) => {
    // Prevent Ctrl+S, Command+S, Ctrl+Shift+S, etc.
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }
  };
  
  // Prevent drag events which could be used to save
  const preventDrag = (e) => {
    e.preventDefault();
    return false;
  };
  
  useEffect(() => {
    // Add event listeners to prevent downloads
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Add event listeners to the media element when it's available
    if (mediaRef.current) {
      mediaRef.current.addEventListener('dragstart', preventDrag);
      mediaRef.current.addEventListener('contextmenu', preventContextMenu);
    }
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('contextmenu', preventContextMenu);
      
      if (mediaRef.current) {
        mediaRef.current.removeEventListener('dragstart', preventDrag);
        mediaRef.current.removeEventListener('contextmenu', preventContextMenu);
      }
    };
  }, []);
  
  return (
    <div className="protected-media-wrapper">
      {type === 'audio' ? (
        <audio 
          ref={mediaRef}
          src={source} 
          controls 
          controlsList="nodownload nofullscreen noremoteplayback" 
          onContextMenu={preventContextMenu}
          onDragStart={preventDrag}
          className="w-full"
          title={title}
        >
          Your browser does not support the audio element.
        </audio>
      ) : (
        <video 
          ref={mediaRef}
          src={source} 
          controls 
          controlsList="nodownload nofullscreen noremoteplayback" 
          onContextMenu={preventContextMenu}
          onDragStart={preventDrag}
          className="w-full"
          title={title}
          playsInline
        >
          Your browser does not support the video element.
        </video>
      )}
      <style jsx>{`
        .protected-media-wrapper {
          position: relative;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        
        .protected-media-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

const AdminMessageList = () => {
  const [messages, setMessages] = useState(null);
  const [messagesWithDetails, setMessagesWithDetails] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent downloads from the page
  useEffect(() => {
    const preventDownload = (e) => {
      // Prevent Ctrl+S, Command+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('keydown', preventDownload);
    return () => document.removeEventListener('keydown', preventDownload);
  }, []);

  const fetchMessages = async (url = 'https://tlbc-platform-api.onrender.com/api/sermons/list/?limit=15') => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(url, { withCredentials: true });
      setMessages(response.data);

      // After getting the basic list, fetch details for each message
      if (response.data?.results?.length > 0) {
        await fetchAllMessageDetails(response.data.results);
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch messages';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // errorMessage = `Server error: ${error.response.status}`;
        errorMessage = `Failed: ${error.response?.data?.detail}` || 'Failed to fetch message details';
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error: No response from server';
      }
      displayError(errorMessage);
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllMessageDetails = async (messagesList) => {
    setIsLoadingDetails(true);
    try {
      const detailsPromises = messagesList.map(message => 
        axios.get(
          `https://tlbc-platform-api.onrender.com/api/sermons/detail/${message.id}/`,
          { withCredentials: true }
        )
      );
      
      const responses = await Promise.all(detailsPromises);
      const messagesWithDetailsData = responses.map(response => response.data);
      setMessagesWithDetails(messagesWithDetailsData);
    } catch (error) {
      setError('Failed to fetch message details');
      console.error('Error fetching message details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Add this to handle the highlight parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');
    
    if (highlightId && messagesWithDetails.length > 0) {
      const highlightedMessage = messagesWithDetails.find(msg => msg.id === highlightId);
      if (highlightedMessage) {
        // Scroll to the highlighted message
        const element = document.getElementById(`message-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: add a visual highlight effect
          element.classList.add('highlight-pulse');
          setTimeout(() => element.classList.remove('highlight-pulse'), 2000);
        }
      }
    } else {
      // Restore scroll position if returning from media player
      try {
        const lastPosition = sessionStorage.getItem('lastScrollPosition');
        if (lastPosition) {
          window.scrollTo(0, parseInt(lastPosition));
          sessionStorage.removeItem('lastScrollPosition');
        }
      } catch (error) {
        console.error('Failed to restore scroll position:', error);
      }
    }
  }, [messagesWithDetails, location.search]);

  const handleViewMessage = async (id) => {
     // First check if we already have the details for this message
     const existingMessage = messagesWithDetails.find(msg => msg.id === id);
    
     if (existingMessage) {
       setSelectedMessage(existingMessage);
       setIsViewModalOpen(true);
       return;
     }

      // If not, fetch the details
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `https://tlbc-platform-api.onrender.com/api/sermons/detail/${id}/`,
        { withCredentials: true }
      );
      setSelectedMessage(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      setError('Failed to fetch message details');
      console.error('Error fetching message details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchMessage = () => {
    if (selectedMessage?.file) {
      // Save current state to sessionStorage as a lightweight alternative to context
      try {
        sessionStorage.setItem('lastViewedMessageId', selectedMessage.id);
        sessionStorage.setItem('lastScrollPosition', window.scrollY.toString());
      } catch (error) {
        console.error('Failed to save state to sessionStorage:', error);
      }
      
      const params = new URLSearchParams({
        source: selectedMessage.file,
        title: selectedMessage.title || 'Untitled Message',
        speaker: selectedMessage.speaker || 'Unknown Speaker',
        type: selectedMessage.type || 'unknown',
        messageId: selectedMessage.id,
        disableDownload: 'true',
        protectedMode: 'true' // New parameter to enable protected mode
      });
      
      navigate(`/media-player?${params.toString()}`);
    } else {
      setError('Media file not available');
      clearMessagesAfterTimeout();
    }
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    
    setIsDeleting(true);
    setError('');
    try {
      await axios.delete(
        `https://tlbc-platform-api.onrender.com/api/sermons/delete/${messageToDelete.id}/`,
        { withCredentials: true }
      );
      setSuccess(`Message "${messageToDelete.title}" has been deleted successfully`);
      setIsDeleteModalOpen(false);
      fetchMessages();
      navigate('/messagelist');
    } catch (error) {
      setError('Failed to delete message');
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
      clearMessagesAfterTimeout();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const clearMessagesAfterTimeout = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  // Helper function to get the type for a message
  const getMessageType = (id) => {
    const message = messagesWithDetails.find(msg => msg.id === id);
    return message?.type ? message.type.charAt(0).toUpperCase() + message.type.slice(1) : 'Loading...';
  };
  
  // Helper function to get the type icon
  const getTypeIcon = (id) => {
    const message = messagesWithDetails.find(msg => msg.id === id);
    if (!message) return <Loader2 className="w-4 h-4 animate-spin" />;
    
    const type = message.type ? message.type.toLowerCase() : '';
    if (type === 'audio') {
      return <HeadphonesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />;
    } else if (type === 'video') {
      return <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />;
    }
    return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
  };

  // Determine if we're still loading any content
  const isContentLoading = isLoading || isLoadingDetails;

  // Handle pagination
  const handlePreviousPage = () => {
    if (messages?.previous) {
      fetchMessages(messages.previous);
    }
  };

  const handleNextPage = () => {
    if (messages?.next) {
      fetchMessages(messages.next);
    }
  };

  const displayError = (message, duration = 5000) => {
    setError(message);
    setTimeout(() => {
      setError('');
    }, duration);
  };

  return (
    <>
      <Breadcrumb pageName="Message Library" />

      <div className="p-2 sm:p-4 md:p-6 2xl:p-10 bg-gray-50 dark:bg-boxdark min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark overflow-hidden">
            <div className="border-b border-stroke py-4 px-4 sm:px-6 dark:border-strokedark flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <HeadphonesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-semibold text-black dark:text-white text-lg sm:text-xl md:text-2xl">
                  Message Library
                </h3>
              </div>
              <div className="flex w-full md:w-auto">
                <button
                  onClick={() => fetchMessages()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center gap-2 shadow-sm"
                  disabled={isContentLoading}
                >
                  {isContentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Refresh Messages'
                  )}
                </button>
              </div>
            </div>

            {/* Improved error message container to prevent overflow */}
            <div className="px-4 sm:px-6 mt-4">
              {error && (
                <Alert variant="destructive" className="max-w-full">
                  <AlertDescription className="text-red-500 dark:font-bold text-sm break-words">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-100 text-green-800 max-w-full">
                  <AlertDescription className="text-sm break-words">{success}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {isContentLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : messages?.results?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {messages.results.map((message) => (
                    <div
                      id={`message-${message.id}`}
                      key={message.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(message.id)}
                          <span className="font-medium text-xs sm:text-sm text-gray-600 dark:text-gray-300 capitalize">
                            {getMessageType(message.id)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate ml-2 text-right" style={{ minWidth: '80px' }}>
                          {formatDate(message.date)}
                        </span>
                      </div>
                      
                      <div className="p-3 sm:p-4 flex-grow">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 line-clamp-2" title={message.title}>
                          {message.title || "Untitled Message"}
                        </h3>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                          <User size={14} className="min-w-[14px] mr-1" />
                          <p className="text-xs sm:text-sm truncate" title={message.speaker}>{message.speaker || "Unknown Speaker"}</p>
                        </div>
                      </div>
                      
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex space-x-2">
                        <button
                          onClick={() => handleViewMessage(message.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteClick(message)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1 text-sm"
                          aria-label="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Messages Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">There are no messages available at the moment.</p>
                  <button
                    onClick={() => fetchMessages()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Refresh Messages
                  </button>
                </div>
              )}

              {messages && !isContentLoading && messages.results.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 border-t pt-4 sm:pt-6 gap-4 sm:gap-0">
                  <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing {messages.results.length} messages
                  </div>
                  <div className="flex space-x-3 w-full sm:w-auto justify-center sm:justify-end order-1 sm:order-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!messages?.previous || isContentLoading}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md flex items-center gap-1 ${
                        messages?.previous && !isContentLoading
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!messages?.next || isContentLoading}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md flex items-center gap-1 ${
                        messages?.next && !isContentLoading
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Message Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-w-[95vw] sm:w-full overflow-hidden bg-white p-0">
      {selectedMessage && (
            <>
              {/* Banner at the top with message type */}
              <div className={`w-full h-10 ${selectedMessage.type === 'audio' ? 'bg-purple-600' : 'bg-red-600'} flex items-center justify-center`}>
                <span className="text-white font-medium text-xs sm:text-sm uppercase tracking-wider flex items-center">
                  {selectedMessage.type === 'audio' ? (
                    <>
                      <HeadphonesIcon className="mr-2 h-4 w-4" /> AUDIO MESSAGE
                    </>
                  ) : (
                    <>
                      <VideoIcon className="mr-2 h-4 w-4" /> VIDEO MESSAGE
                    </>
                  )}
                </span>
              </div>
              
              {/* Header with title and close button */}
              <div className="w-full flex items-center justify-between px-4 sm:px-6 pt-4 pb-2">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 line-clamp-2 pr-2">{selectedMessage.title || "Untitled Message"}</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 rounded-full bg-gray-100 p-1 flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-4 sm:px-6 pb-6 space-y-4 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
                <div className="flex items-center text-gray-700">
                  <User className="mr-2 h-4 w-4 flex-shrink-0" />
                  <p className="text-sm font-medium break-words">{selectedMessage.speaker || "Unknown Speaker"}</p>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{formatDate(selectedMessage.date) || "No date available"}</p>
                </div>

                <div className="pt-2 pb-4">
                  <h4 className="font-bold text-sm text-gray-700 mb-2">Description:</h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-sm text-gray-700 leading-relaxed">
                    {selectedMessage.description || "No description available for this message."}
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleWatchMessage}
                    disabled={!selectedMessage.file}
                    className={`px-4 sm:px-5 py-2 sm:py-3 flex-1 ${
                      !selectedMessage.file 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : selectedMessage.type === 'audio' 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-red-600 hover:bg-red-700'
                    } text-white text-sm rounded-md transition-colors flex items-center gap-2 font-medium justify-center`}
                  >
                    <Play size={18} />
                    {selectedMessage.type === 'audio' ? 'Listen Now' : 'Watch Now'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleDeleteClick(selectedMessage);
                    }}
                    className="px-4 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center gap-2 font-medium justify-center"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[92vw] overflow-hidden bg-white p-0">
          <div className="bg-red-600 w-full h-10 flex items-center justify-center">
            <span className="text-white font-medium text-xs sm:text-sm uppercase tracking-wider flex items-center">
              <Trash2 className="mr-2 h-4 w-4" /> CONFIRM DELETE
            </span>
          </div>
          
          <div className="p-4 sm:p-6">
            {messageToDelete && (
              <div className="space-y-4">
                <p className="text-gray-800 text-sm sm:text-base">
                  Are you sure you want to delete the message "<span className="font-semibold">{messageToDelete.title}</span>"?
                </p>
                <p className="text-red-600 text-sm font-medium">This action cannot be undone.</p>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminMessageList;