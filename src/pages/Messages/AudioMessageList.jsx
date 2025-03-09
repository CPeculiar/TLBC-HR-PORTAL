import React, { useState, useEffect } from 'react';
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

const AudioMessageList = () => {
  const [messages, setMessages] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async (url = 'https://tlbc-platform-api.onrender.com/api/sermons/list/audio/?limit=12') => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(url, { withCredentials: true });
      setMessages(response.data);
    } catch (error) {
      setError('Failed to fetch audio messages');
      console.error('Error fetching audio messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleViewMessage = async (id) => {
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
      // Redirect to /messagelist
      window.location.href = '/messagelist';
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

  return (
    <>
      <Breadcrumb pageName="Audio Messages" />

      <div className="px-2 sm:px-4 md:px-6 2xl:px-10 py-4">
        <div className="mx-auto max-w-full">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark dark:text-white">
            <div className="border-b border-stroke py-4 px-3 sm:px-6.5 dark:border-strokedark flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-medium text-black dark:text-white text-lg sm:text-xl">
                Audio Messages List
              </h3>
              <div className="flex w-full md:w-auto">
                <button
                  onClick={() => fetchMessages()}
                  className="px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    'Refresh Messages'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mx-3 sm:mx-6 mt-4 max-w-full overflow-hidden">
                <AlertDescription className="text-red-500 dark:font-bold text-sm sm:text-base break-words">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-100 text-green-800 mx-3 sm:mx-6 mt-4 max-w-full overflow-hidden">
                <AlertDescription className="text-sm sm:text-base break-words">{success}</AlertDescription>
              </Alert>
            )}

            <div className="p-3 sm:p-4 md:p-6.5">
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse text-sm sm:text-base">
                  <thead>
                    <tr className="bg-gray/5 dark:bg-gray/5 text-center">
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Title</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Speaker</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Date</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">View</th>
                      <th className="border px-2 py-2 sm:px-4 sm:py-3">Delete</th>
                    </tr>
                  </thead>
                  {messages?.results?.length > 0 ? (
                    <tbody>
                      {messages.results.map((message) => (
                        <tr
                          key={message.id}
                          className="border-b hover:bg-gray/90 dark:hover:bg-gray/10 text-center"
                        >
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm md:text-base break-words max-w-xs">
                            {message.title}
                          </td>
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm md:text-base">
                            {message.speaker}
                          </td>
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm md:text-base">
                            {formatDate(message.date)}
                          </td>
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-center">
                            <button
                              onClick={() => handleViewMessage(message.id)}
                              className="p-1 sm:p-2 text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="View message"
                            >
                              <Eye size={16} className="sm:w-5 sm:h-5" />
                            </button>
                          </td>
                          <td className="border px-2 py-2 sm:px-4 sm:py-3 text-center">
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
                          colSpan="5"
                          className="text-center py-4 text-black/70 dark:text-white text-xs sm:text-sm md:text-base"
                        >
                          {isLoading
                            ? 'Loading messages...'
                            : 'No messages found. Click the "Refresh Messages" button to fetch messages.'}
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>

              {messages && (
                <div className="flex justify-between mt-4 sm:mt-6">
                  <button
                    onClick={() => messages?.previous && fetchMessages(messages.previous)}
                    disabled={!messages?.previous}
                    className={`px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md ${
                      messages?.previous
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => messages?.next && fetchMessages(messages.next)}
                    disabled={!messages?.next}
                    className={`px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md ${
                      messages?.next
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
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto">
          {/* Header with title and close button */}
          <div className="w-full flex items-center justify-between px-3 sm:px-4 border-b pb-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Message Details</h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="hover:text-black-2 dark:text-black/60 dark:hover:text-black/90"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {selectedMessage && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Title:</h4>
                <p className="text-base sm:text-lg dark:text-black break-words">{selectedMessage.title}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Preached by:</h4>
                <p className="text-sm sm:text-base dark:text-black">{selectedMessage.speaker}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Date:</h4>
                <p className="text-sm sm:text-base dark:text-black">{formatDate(selectedMessage.date)}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Type:</h4>
                <p className="text-sm sm:text-base dark:text-black capitalize">{selectedMessage.type}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base">Description:</h4>
                <p className="text-sm sm:text-base dark:text-black break-words">
                  {selectedMessage.description || "No description available"}
                </p>
              </div>

              <div className="flex justify-end pt-3 sm:pt-4">
                <button
                  onClick={handleDownloadMessage}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 sm:gap-2"
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
        <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] mx-auto">
          <div className="w-full flex items-center justify-between px-3 sm:px-4 border-b pb-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Confirm Delete</h2>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="hover:text-black-2 dark:text-black/60 dark:hover:text-black/90"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {messageToDelete && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base dark:text-black break-words">
                Are you sure you want to delete the message "{messageToDelete.title}"?
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray/95 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 sm:gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
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

export default AudioMessageList;