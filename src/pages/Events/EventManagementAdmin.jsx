import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Mail, User2, Edit, Trash2 } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { db } from '../../js/services/firebaseConfig';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

function AdminEventManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      
      const eventsRef = collection(db, "events");
      const q = query(eventsRef);
      
      const querySnapshot = await getDocs(q);
      
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({
          id: doc.id,
          ...doc.data(),
          Conductor: `Conductor: ${doc.data().conductor}`,
          Contact: doc.data().contact,
          Email: doc.data().email,
          image: doc.data().imageURL
        });
      });
      
       // Get current date (without time) for comparing with event dates
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       
       // Sort events by date - upcoming events first (closest to today first)
       // Then past events (most recent first)
       eventsData.sort((a, b) => {
         if (!a.eventDate || !b.eventDate) return 0;
         
         const dateA = a.eventDate.toDate ? a.eventDate.toDate() : new Date(a.eventDate);
         const dateB = b.eventDate.toDate ? b.eventDate.toDate() : new Date(b.eventDate);
         
         // Check if both events are in the future or both are in the past
         const aIsFuture = dateA >= today;
         const bIsFuture = dateB >= today;
         
         // If one is future and one is past, future events come first
         if (aIsFuture && !bIsFuture) return -1;
         if (!aIsFuture && bIsFuture) return 1;
         
         // If both are future events, closest date comes first (ascending)
         if (aIsFuture && bIsFuture) {
           return dateA - dateB;
         }
         
         // If both are past events, most recent comes first (descending)
         return dateB - dateA;
       });
       
       setEvents(eventsData);
     } catch (error) {
       console.error("Error fetching events:", error);
     } finally {
       setLoading(false);
     }
   };

  const handleAddEvent = () => {
    navigate('/admineventupload');
  };

  const handleEditEvent = (id) => {
    navigate(`/admineditevent/${id}`);
  };

  const handleDeleteEvent = async () => {
    if (!deleteId) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, "events", deleteId));
      
      // Update local state to remove the deleted event
      setEvents(events.filter(event => event.id !== deleteId));
      
      setDeleteId(null);
      setShowDeleteDialog(false);
      setDeletingEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (event) => {
    setDeleteId(event.id);
    setDeletingEvent(event);
    setShowDeleteDialog(true);
  };

  const calculateStatus = (event) => {
    if (!event.eventDate) return { text: 'Unknown', color: 'text-gray-500' };
    
    const eventDate = event.eventDate.toDate ? event.eventDate.toDate() : new Date(event.eventDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    if (eventDate < currentDate) {
      return { text: 'Past', color: 'text-red-500' };
    } else if (eventDate.toDateString() === currentDate.toDateString()) {
      return { text: 'Today', color: 'text-green-500' };
    } else {
      return { text: 'Upcoming', color: 'text-blue-500' };
    }
  };

  return (
    <>
      <Breadcrumb pageName="Manage Events" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-stroke py-4 px-4 sm:px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-xl text-black dark:text-white mb-2 sm:mb-0">
                Event Management
              </h3>
              
              <button
                onClick={handleAddEvent}
                className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 w-full sm:w-auto"
              >
                Add New Event
              </button>
            </div>

            <div className="p-4 sm:p-6.5">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-6">
                  {events.map((event) => {
                    const status = calculateStatus(event);
                    
                    return (
                      <div key={event.id} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-boxdark rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                        <div className="absolute top-2 right-2 flex space-x-2 z-10">
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            title="Edit Event"
                          >
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(event)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="Delete Event"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>

                        
                        <div className="md:w-1/2 w-full">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '400px' }}
                          />
                        </div>

                        <div className="md:w-1/2 p-4 sm:p-6 w-full">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                            <h3 className="text-lg sm:text-2xl font-semibold text-black dark:text-white break-words">
                              {event.title}
                            </h3>
                            <span className={`px-0 py-0 rounded-full text-sm md:px-2 md:py-6 font-medium ${status.color} inline-block`}>
                              {status.text} event
                            </span>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500">
                              <User2 className="w-5 h-5 mr-1 flex-shrink-0" />
                              <span className="break-all">{event.conductor || 'No conductor specified'}</span>
                            </div>
                            <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500 break-all">
                              <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span className="break-all">{event.date || 'No date specified'}</span>
                            </div>
                            <div className="flex flex-wrap items-center text-body break-words text-sm sm:text-base text-gray-500">
                              <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span className="break-all">{event.time || 'No time specified'}</span>
                            </div>
                            <div className="flex flex-wrap items-center text-body break-words text-sm sm:text-base text-gray-500">
                              <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span className="break-all">{event.location || 'No location specified'}</span>
                            </div>
                            <div className="flex flex-wrap items-center text-body break-words text-sm sm:text-base">
                              <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span className="break-all">{event.Contact || 'No contact specified'}</span>
                            </div>
                            <div className="flex items-center text-body text-sm sm:text-base break-all">
                              <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span className="break-all">{event.Email || 'No email specified'}</span>
                            </div>
                          </div>

                          <div className="flex items-center text-body">
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 break-words">
                              Created on: {event.createdAt?.toDate().toLocaleString() || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-xl">
                    No events found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <AlertDialogContent className="w-full max-w-md mx-auto p-4 sm:p-6 rounded-lg">
    <AlertDialogHeader className="space-y-2">
      <AlertDialogTitle className="text-lg sm:text-xl font-semibold">
        Are you sure you want to delete this event?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-sm sm:text-base">
        {deletingEvent && (
          <div className="mt-2">
            <p className="font-medium break-words">{deletingEvent.title}</p>
            <p className="text-sm">{deletingEvent.date} at {deletingEvent.time}</p>
          </div>
        )}
        <p className="mt-4 text-red-500 text-sm sm:text-base">This action cannot be undone.</p>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 mt-6">
      <AlertDialogCancel className="mt-2 sm:mt-0 w-full sm:w-auto">Cancel</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleDeleteEvent}
        className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </>
  );
}


export default AdminEventManagement;