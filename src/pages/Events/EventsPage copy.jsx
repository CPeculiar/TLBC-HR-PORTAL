import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Mail, User2 } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { handleAddToCalendar } from './handleAddToCalendar';

function EventsPage() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "Rethinking the Work Conference 2025",
      date: "Friday, 3rd - Monday 6th January, 2025",
      time: "6:00 PM Arrival",
      location: "God is Faithful (Cotton Mill) Uke, Anambra State.",
      description: "Ministry-wide Conference for every member of TLBC Int'l.",
      image: "/events/RWC2025.jpg",
    },
    {
      id: 2,
      title: "Night of Glory, January 2025 Edition.",
      Conductor: "Conductor: Pastor Chizoba Okeke",
      date: "Friday, January 31, 2025",
      time: "09:00 PM",
      location: "The Lord's Brethren Place, Awka.",
      description: "Ministry-wide Night of Glory, January 2025 Edition.",
      Contact: "09134445037",
      Email: "info@thelordsbrethrenchurch.org",
      image: "/events/NOG-Jan-2025.jpg",
    },
    {
      id: 3,
      title: "Ministers Refreshers Course, February 2025 Edition.",
      Conductor: "Conductor: Pastor Kenechukwu Chukwukelue",
      date: "Saturday, February 08, 2025",
      time: "9:00 PM",
      location: "The Lord's Brethren Place, Awka.",
      description: "Ministry-wide MRC, February 2025 edition.",
      Contact: "09134445037",
      Email: "info@thelordsbrethrenchurch.org",
      image: "/events/MRC-Feb-2025.jpg",
    },
  ];

  const upcomingEvents = useMemo(() => {
    const currentDate = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      currentDate.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= currentDate;
    });
  }, []);

  return (
    <>
      <Breadcrumb pageName="Events" />
      
      <div className="p-4 md:p-6 2xl:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-xl text-black dark:text-white">
                Central Events
              </h3>
            </div>

            <div className="p-6.5">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row gap-6 bg-white dark:bg-boxdark rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="md:w-1/2">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-90 object-cover"
                        />
                      </div>

                      <div className="md:w-1/2 p-6">
                        <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">
                          {event.title}
                        </h3>

                        <div className="space-y-3 mb-6">
                        <div className="flex items-center text-body">
                            <User2 className="w-5 h-5 mr-3" />
                            {event.Conductor}
                          </div>
                          <div className="flex items-center text-body">
                            <Calendar className="w-5 h-5 mr-3" />
                            {event.date}
                          </div>
                          <div className="flex items-center text-body">
                            <Clock className="w-5 h-5 mr-3" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-body">
                            <MapPin className="w-5 h-5 mr-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center text-body">
                            <Phone className="w-5 h-5 mr-3" />
                            {event.Contact}
                          </div>
                          <div className="flex items-center text-body">
                            <Mail className="w-5 h-5 mr-3" />
                            {event.Email}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCalendar(event)}
                          className="inline-flex items-center justify-center rounded bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                        >
                          Add to my Calender
                        </button>
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