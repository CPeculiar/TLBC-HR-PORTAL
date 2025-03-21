import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, User2 } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { handleAddToCalendar } from './handleAddToCalendar';
import { db } from '../../js/services/firebaseConfig';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';

function WorkersMeeting() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkersMeetings();
  }, []);

  const fetchWorkersMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current date at midnight for accurate comparison
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      console.log("Fetching Workers Meetings...");
      
      // Query all events first for debugging
      const eventsRef = collection(db, "events");
      const q = query(eventsRef);
      
      const querySnapshot = await getDocs(q);
      
      console.log(`Total events found: ${querySnapshot.size}`);
      
      // Filter in JavaScript for Workers Meeting events
      const eventsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Event type: ${data.eventType}`);
        
        // Check if this is a Workers Meeting
        if (data.eventType === "Workers Meeting") {
          // Check if event date is in the future or today
          const eventDate = data.eventDate ? data.eventDate.toDate() : new Date(data.date);
          
          if (eventDate >= currentDate) {
            eventsData.push({
              id: doc.id,
              ...data,
              // Format data to match your component expectations
              Conductor: `Conductor: ${data.conductor}`,
              Contact: data.contact,
              Email: data.email,
              image: data.imageURL
            });
          }
        }
      });
      
      // Sort events by date
      eventsData.sort((a, b) => {
        const dateA = a.eventDate ? a.eventDate.toDate() : new Date(a.date);
        const dateB = b.eventDate ? b.eventDate.toDate() : new Date(b.date);
        return dateA - dateB;
      });
      
      console.log(`Filtered Workers Meetings: ${eventsData.length}`);
      
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching workers meetings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Workers Meetings" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex justify-between items-center border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-xl text-black dark:text-white">
                Workers Meetings
              </h3>     
            </div>

            <div className="p-6.5">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 dark:text-red-400 text-xl">
                    Error loading meetings: {error}
                  </p>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-6">
                  {events.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row gap-6 bg-white dark:bg-boxdark rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
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
                          {/* Add Join Meeting button */}
                          {event.meetingLink && (
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded bg-blue-600 py-3 px-6 text-center font-medium text-white hover:bg-blue-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                              </svg>
                              Join Meeting
                            </a>
                          )}

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

export default WorkersMeeting;