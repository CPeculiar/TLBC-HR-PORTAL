import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

function EventsPage() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "Presidential Appreciation Service",
      date: "Sunday, December 8, 2024",
      time: "8:00 AM — 10:30 AM",
      location: "All TLBC Int'l church expressions",
      description: "Ministry-wide appreciation service for our dear Man of God, Reverend Elochukwu Udegbunam.",
      image: "/events/PresidentialApp.jpg",
    },
    {
      id: 2,
      title: "Thanksgiving Service",
      date: "Sunday, December 15, 2024",
      time: "8:00 AM — 10:30 AM",
      location: "All TLBC Int'l church expressions",
      description: "Ministry-wide Thanksgiving service for the year 2024.",
      image: "/events/Thanksgiving.jpg",
    },
    {
      id: 3,
      title: "Parah 2024",
      date: "Friday, December 20, 2024",
      time: "9:00 PM",
      location: "The Lord's Brethren Place, Awka",
      description: "Ministry-wide Workers Party for the year 2024.",
      image: "/events/Parah.jpg",
    },
    {
      id: 4,
      title: "New Year's Eve Service",
      date: "Tuesday, December 31, 2024",
      time: "9:00 PM",
      location: "The Lord's Brethren Place, Awka",
      description: "Ministry-wide New Year Eve Service for the year 2024.",
      image: "/events/NewYearEve.jpg",
    },
    {
      id: 5,
      title: "Rethinking the Work Conference 2025",
      date: "Friday, 3rd - Monday 6th January, 2025",
      time: "6:00 PM Arrival",
      location: "God is Faithful (Cotton Mill) Uke, Anambra State.",
      description: "Ministry-wide Conference for every member of TLBC Int'l.",
      image: "/events/RWC2025.jpg",
    },
  ];

  const upcomingEvents = useMemo(() => {
    const currentDate = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      currentDate.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate;
    });
  }, []);

  const handleViewDetails = (eventId) => {
    navigate(`/events`);
  };

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
                          className="w-full h-64 object-cover"
                        />
                      </div>

                      <div className="md:w-1/2 p-6">
                        <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">
                          {event.title}
                        </h3>

                        <div className="space-y-3 mb-6">
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
                        </div>

                        <button
                          onClick={() => handleViewDetails(event.id)}
                          className="inline-flex items-center justify-center rounded bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
                        >
                          View Event Details
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