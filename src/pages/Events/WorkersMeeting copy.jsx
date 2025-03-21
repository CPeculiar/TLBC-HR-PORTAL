import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Mail, User2, Video } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { handleAddToCalendar } from './handleAddToCalendar';
import { db } from '../../js/services/firebaseConfig';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';

function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // You would normally check if user is admin here
    setIsAdmin(true); // Set to true for testing, in production connect to auth
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching Workers Meeting events...");
      
      // Get ALL Workers Meeting events without date filter first
      const eventsRef = collection(db, "events");
      const q = query(
        eventsRef,
        where("eventType", "==", "Workers Meeting"),
        orderBy("eventDate", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filter events in JavaScript to ensure today's events are included
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const eventsData = [];
      console.log(`Total Workers Meeting events found: ${querySnapshot.size}`);
      
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        const eventDate = eventData.eventDate?.toDate(); // Convert Firestore timestamp to JS Date
        
        console.log(`Event: ${eventData.title}, Date: ${eventDate}, Type: ${eventData.eventType}`);
        
        // Include the event if the date is today or in the future
        if (eventDate && eventDate >= now) {
          eventsData.push({
            id: doc.id,
            ...eventData,
            // Format data to match component expectations
            Conductor: `Conductor: ${eventData.conductor || 'Not specified'}`,
            Contact: eventData.contact || 'Not available',
            Email: eventData.email || 'Not available',
            image: eventData.imageURL || '/placeholder-image.jpg',
            // Format display date from timestamp
            date: eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          });
        }
      });
      
      console.log(`Filtered events count: ${eventsData.length}`);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (id) => {
    navigate(`/admineditevent/${id}`);
  };

  return (
    <>
      <Breadcrumb pageName="Workers Meetings" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex justify-between items-center border-b border-stroke py-4 px-6 dark:border-strokedark">
              <h3 className="font-medium text-xl text-black dark:text-white">
                Workers Meetings
              </h3>     
            </div>

            <div className="p-4 md:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : events.length > 0 ? (
                <div className="grid gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-boxdark rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex space-x-2 z-10">
                          <button
                            onClick={() => handleEditEvent(event.id)}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            title="Edit Event"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      <div className="md:w-2/5 h-64 md:h-auto">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="md:w-3/5 p-4 md:p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold text-black dark:text-white mb-4 line-clamp-2">
                            {event.title}
                          </h3>

                          <div className="grid gap-3 mb-6">
                            <div className="flex items-start text-body text-sm md:text-base text-gray-600 dark:text-gray-300">
                              <User2 className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary" />
                              <span>{event.Conductor}</span>
                            </div>
                            <div className="flex items-start text-body text-sm md:text-base text-gray-600 dark:text-gray-300">
                              <Calendar className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-start text-body text-sm md:text-base text-gray-600 dark:text-gray-300">
                              <Clock className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-start text-body text-sm md:text-base text-gray-600 dark:text-gray-300">
                              <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary" />
                              <span className="break-words">{event.location || 'No location specified'}</span>
                            </div>
                            <div className="flex items-start text-body text-sm md:text-base text-gray-600 dark:text-gray-300">
                              <Phone className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary" />
                              <span className="break-words">{event.Contact || 'No contact specified'}</span>
                            </div>
                            <div className="flex items-start text-body text-sm md:text-base text-gray-600 dark:text-gray-300">
                              <Mail className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-primary" />
                              <span className="break-words">{event.Email || 'No email specified'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                          {event.meetingLink && (
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded bg-blue-600 py-3 px-4 md:px-6 text-center font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                              <Video className="h-5 w-5 mr-2" />
                              Join Meeting
                            </a>
                          )}

                          <button
                            onClick={() => handleAddToCalendar(event)}
                            className="inline-flex items-center justify-center rounded bg-primary py-3 px-4 md:px-6 text-center font-medium text-white hover:bg-opacity-90 transition-colors"
                          >
                            <Calendar className="h-5 w-5 mr-2" />
                            Add to Calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xl font-medium">
                    No upcoming Workers Meetings
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 mt-2">
                    Check back later for new meeting announcements
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