import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Eye, X, Loader2, Calendar, User, FileText, Headphones as HeadphonesIcon, Video as VideoIcon, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const MessageList = () => {
  const [messages, setMessages] = useState(null);
  const [messagesWithDetails, setMessagesWithDetails] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // In MessageList, update the fetchMessages function to handle network errors better
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
      // setError(error.response?.data?.detail || 'Failed to fetch message details');
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
      // setError('Failed to fetch message details');
      setError(error.response?.data?.detail || 'Failed to fetch message details');
      console.error('Error fetching message details:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // setIsPlaying(true);

const handleWatchMessage = () => {
  if (selectedMessage?.file) {
    // Optional: If using context
    // const { setPlaylist, addToRecentlyPlayed } = useMedia();
    // setPlaylist(messagesWithDetails);
    // addToRecentlyPlayed(selectedMessage);
    
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
      disableDownload: 'true'
    });
    
    navigate(`/media-player?${params.toString()}`);
  } else {
    setError('Media file not available');
    clearMessagesAfterTimeout();
  }
};


// In MediaPlayer.jsx, enhance the back navigation
const handleBackToLibrary = () => {
  const messageId = params.get('messageId');
  if (messageId) {
    navigate(`/messagelist?highlight=${messageId}`);
  } else {
    navigate('/messagelist');
  }
};


// Add this to your MessageList useEffect to handle the highlight parameter
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
                    key={message.id}
                    id={`message-${message.id}`}
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
                    
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <button
                        onClick={() => handleViewMessage(message.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm"
                        >
                        <Eye size={16} />
                        View Details
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

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleWatchMessage}
                  disabled={!selectedMessage.file}
                  className={`px-4 sm:px-5 py-2 sm:py-3 ${
                    !selectedMessage.file 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : selectedMessage.type === 'audio' 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-red-600 hover:bg-red-700'
                 } text-white text-sm rounded-md transition-colors flex items-center gap-2 font-medium w-full sm:w-auto justify-center`}
                >
                  <Play size={18} />
                  {selectedMessage.type === 'audio' ? 'Listen Now' : 'Watch Now'}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default MessageList;