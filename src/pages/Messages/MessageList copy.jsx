import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, Trash2, X, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const MessageList2 = () => {
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
  const navigate = useNavigate();

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
      setError('Failed to fetch messages');
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
      setError('Failed to fetch message details');
      console.error('Error fetching message details:', error);
    } finally {
      setIsLoading(false);
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

  const handleDownloadMessage = () => {
    if (selectedMessage?.file) {
      window.open(selectedMessage.file, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
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

  return (
    <>
      <Breadcrumb pageName="Message List" />

      <div className="p-2 sm:p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-full">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
            <div className="border-b border-stroke py-3 px-4 sm:py-4 sm:px-6 dark:border-strokedark flex flex-col md:flex-row justify-between items-start md:items-center gap-2 sm:gap-4">
              <h3 className="font-medium text-black dark:text-white text-lg sm:text-xl">
                Message List
              </h3>
              <div className="flex w-full md:w-auto">
                <button
                  onClick={() => fetchMessages()}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center gap-1 sm:gap-2"
                  disabled={isContentLoading}
                >
                  {isContentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="whitespace-nowrap">Fetching...</span>
                    </>
                  ) : (
                    'Refresh Messages'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mx-4 sm:mx-6 mt-3 sm:mt-4 max-w-full overflow-hidden">
                <AlertDescription className="text-red-500 dark:font-bold text-sm sm:text-base truncate">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-100 text-green-800 mx-4 sm:mx-6 mt-3 sm:mt-4 max-w-full overflow-hidden">
                <AlertDescription className="text-sm sm:text-base truncate">{success}</AlertDescription>
              </Alert>
            )}

            <div className="p-2 sm:p-4 md:p-6.5">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse text-sm sm:text-base">
                  <thead>
                    <tr className="bg-gray/5 dark:bg-gray/5 text-center">
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Title</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Speaker</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Date</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Type</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">View</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Delete</th>
                    </tr>
                  </thead>
                  {messages?.results?.length > 0 && !isContentLoading ? (
                    <tbody>
                      {messages.results.map((message) => (
                        <tr
                          key={message.id}
                          className="border-b hover:bg-gray/90 dark:hover:bg-gray/10 text-center"
                        >
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm md:text-base truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                            {message.title}
                          </td>
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm md:text-base truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                            {message.speaker}
                          </td>
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm md:text-base">
                            {formatDate(message.date)}
                          </td>
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 capitalize text-xs sm:text-sm md:text-base">
                            {getMessageType(message.id)}
                          </td>
                          <td className="border px-1 py-2 sm:px-4 sm:py-3 text-center">
                            <button
                              onClick={() => handleViewMessage(message.id)}
                              className="p-1 sm:p-2 text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="View message"
                            >
                              <Eye size={16} className="sm:w-5 sm:h-5" />
                            </button>
                          </td>
                          <td className="border px-1 py-2 sm:px-4 sm:py-3 text-center">
                            <button
                              onClick={() => handleDeleteClick(message)}
                              className="p-1 sm:p-2 text-red-600 hover:text-red-800 transition-colors"
                              aria-label="Delete message"
                            >
                              <Trash2 size={16} className="sm:w-5 sm:h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-black/70 dark:text-white text-sm sm:text-base"
                        >
                          {isContentLoading
                            ? 'Loading messages and details...'
                            : 'No messages found. Click the "Refresh Messages" button to fetch messages.'}
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>

              {messages && !isContentLoading && (
                <div className="flex justify-between mt-4 sm:mt-6">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!messages?.previous || isContentLoading}
                    className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
                      messages?.previous && !isContentLoading
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!messages?.next || isContentLoading}
                    className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
                      messages?.next && !isContentLoading
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Message Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw] overflow-hidden">
          {/* Header with title and close button */}
          <div className="w-full flex items-center justify-between px-3 sm:px-4 border-b pb-2 mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Message Details</h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="hover:text-black-2 dark:text-black/60 dark:hover:text-black/90"
            >
              <X size={24} />
            </button>
          </div>

          {selectedMessage && (
            <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Title:</h4>
                <p className="text-base sm:text-lg dark:text-black break-words">{selectedMessage.title}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Preached by:</h4>
                <p className="dark:text-black text-sm sm:text-base break-words">{selectedMessage.speaker}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Date:</h4>
                <p className="dark:text-black text-sm sm:text-base">{formatDate(selectedMessage.date)}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Type:</h4>
                <p className="dark:text-black capitalize text-sm sm:text-base">{selectedMessage.type}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Description:</h4>
                <p className="dark:text-black text-sm sm:text-base break-words">{selectedMessage.description || "No description available"}</p>
              </div>

              <div className="flex justify-end pt-2 sm:pt-4">
                <button
                  onClick={handleDownloadMessage}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 sm:gap-2"
                >
                  <Download size={16} className="sm:w-5 sm:h-5" />
                  Download
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <div className="w-full flex items-center justify-between px-3 sm:px-4 border-b pb-2 mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Confirm Delete</h2>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="hover:text-black-2 dark:text-black/60 dark:hover:text-black/90"
            >
              <X size={24} />
            </button>
          </div>

          {messageToDelete && (
            <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
              <p className="dark:text-black text-sm sm:text-base">
                Are you sure you want to delete the message "{messageToDelete.title}"?
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 text-xs sm:text-sm rounded-md hover:bg-gray/95 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 sm:gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageList2;