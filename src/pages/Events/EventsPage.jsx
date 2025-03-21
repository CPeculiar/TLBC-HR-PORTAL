import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Mail, User2 } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { handleAddToCalendar } from './handleAddToCalendar';
import { db } from '../../js/services/firebaseConfig';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';

function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Set this based on authentication

  useEffect(() => {
    // You would normally check if user is admin here
    // For now, we'll just assume a value
    setIsAdmin(true); // Set to true for testing, in production connect to auth
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Get current date at midnight for accurate comparison
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Query events where eventDate is greater than or equal to current date
      const eventsRef = collection(db, "events");
      const q = query(
        eventsRef,
        where("eventDate", ">=", currentDate),
        orderBy("eventDate", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        // Skip events with the type "Workers Meeting"
        if (doc.data().eventType !== "Workers Meeting") {
          eventsData.push({
            id: doc.id,
            ...doc.data(),
            // Format data to match your component expectations
            Conductor: `Conductor: ${doc.data().conductor}`,
            Contact: doc.data().contact,
            Email: doc.data().email,
            image: doc.data().imageURL
          });
        }
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

  return (
    <>
      <Breadcrumb pageName="Events" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex justify-between items-center border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-xl text-black dark:text-white">
                Central Events
              </h3>     
            </div>

            <div className="p-6.5">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-6">
                  {events.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row gap-6 bg-white dark:bg-boxdark rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex space-x-2 z-10">
                          {/* <button
                            onClick={() => handleEditEvent(event.id)}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            title="Edit Event"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button> */}
                        </div>
                      )}
                      
                      <div className="md:w-1/2">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>

                      <div className="md:w-1/2 p-6">
                        <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">
                          {event.title}
                        </h3>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500">
                          <User2 className="w-5 h-5 mr-1 flex-shrink-0" />
                            {event.Conductor}
                          </div>
                          <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500">
                            <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
                            {event.date}
                          </div>
                          <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500">
                            <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500">
                            <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="break-all">{event.location || 'No location specified'}</span>
                          </div>
                          <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500">
                            <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="break-all">{event.Contact || 'No contact specified'}</span>
                          </div>
                          <div className="flex items-center text-body break-words text-sm sm:text-base text-gray-500 break-all w-full ">
                            <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="break-all">{event.Email || 'No email specified'}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleAddToCalendar(event)}
                            className="inline-flex items-center justify-center rounded bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                          >
                            Add to my Calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-xl">
                    No upcoming events at the moment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventsPage;