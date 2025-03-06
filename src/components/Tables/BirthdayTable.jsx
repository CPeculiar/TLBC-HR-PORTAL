import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BirthdayTable = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          alert("Access token not found. Please login first.");
          navigate("/");
          return;
        }

        const response = await axios.get(
          'https://api.thelordsbrethrenchurch.org/api/users/',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        // Filter users with birthdays and sort them by month and day
        const usersWithBirthdays = response.data.results
          .filter(user => user.birth_date)
          .map(user => ({
            ...user,
            // Create a dummy date for sorting that ignores the year
            sortDate: new Date(2000, new Date(user.birth_date).getMonth(), new Date(user.birth_date).getDate())
          }))
          .sort((a, b) => a.sortDate - b.sortDate);
        
        setBirthdays(usersWithBirthdays);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/");
        } else {
          setError('Failed to fetch birthdays: ' + (err.response?.data?.message || err.message));
        }
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [navigate]);

  const formatBirthDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default">
        Loading birthdays...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-8 text-center text-meta-1 shadow-default">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Member Birthdays
        </h4>
        <p className="text-sm text-gray-500">
          {birthdays.length} birthdays
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Name
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Birthday
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Phone
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Church
            </h5>
          </div>
        </div>

        {birthdays.map((user, key) => (
          <div
            className={`grid grid-cols-4 ${
              key === birthdays.length - 1
                ? ''
                : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <img 
                  src={user.profile_picture || '/api/placeholder/40/40'} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <p className="text-black dark:text-white">
                {`${user.first_name} ${user.last_name}`}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3 font-medium">{formatBirthDate(user.birth_date)}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{user.phone_number || 'N/A'}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{user.church || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Table */}
      <div className="block sm:hidden">
        <div className="space-y-4">
          {birthdays.map((user, key) => (
            <div key={key} className="border border-stroke dark:border-strokedark rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={user.profile_picture || '/api/placeholder/40/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-black dark:text-white font-medium">
                    {`${user.first_name} ${user.last_name}`}
                  </p>
                  <p className="text-meta-3 text-sm">
                    {formatBirthDate(user.birth_date)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="text-black dark:text-white">{user.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Church</p>
                  <p className="text-black dark:text-white">{user.church || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {birthdays.length === 0 && !loading && !error && (
        <div className="text-center p-8 text-gray-500">
          No birthdays found
        </div>
      )}
    </div>
  );
};

export default BirthdayTable;