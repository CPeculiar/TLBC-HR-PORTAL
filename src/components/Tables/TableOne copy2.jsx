import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProfilePic from '../../../public/user/blackmanprofilepic.jpg';


const TableOne = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          alert("Access token not found. Please login first.");
          navigate("/");
          return;
        }

        const response = await axios.get(
          'https://tlbc-platform-api.onrender.com/api/users/',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        // Filter users with birthdays and sort them
        const usersWithBirthdays = response.data.results
          .filter(user => user.birth_date)
          .sort((a, b) => {
            const dateA = new Date(a.birth_date);
            const dateB = new Date(b.birth_date);
            return dateA.getMonth() - dateB.getMonth() || dateA.getDate() - dateB.getDate();
          });
        
        setUsers(usersWithBirthdays);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/");
        } else {
          setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
        }
        setLoading(false);
      }
    };

    fetchUsers();
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
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        All Birthdays
      </h4>

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
              Phone
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Church
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Birthday
            </h5>
          </div>
        </div>

        {users.map((user, key) => (
          <div
            className={`grid grid-cols-4 ${
              key === users.length - 1
                ? ''
                : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <img 
                  src={user.profile_picture || ProfilePic } 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <p className="text-black dark:text-white whitespace-nowrap">
                {`${user.first_name} ${user.last_name}`}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{user.phone_number || 'N/A'}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{user.church || 'N/A'}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3">{formatBirthDate(user.birth_date)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Table */}
      <div className="block sm:hidden overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-2 dark:bg-meta-4">
            <tr>
              <th className="p-2.5 text-left">Name</th>
              <th className="p-2.5 text-left">Phone</th>
              <th className="p-2.5 text-left">Church</th>
              <th className="p-2.5 text-center">Birthday</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, key) => (
              <tr key={key} className="border-b border-stroke dark:border-strokedark">
                <td className="p-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.profile_picture || ProfilePic }
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-black dark:text-white">
                      {`${user.first_name} ${user.last_name}`}
                    </span>
                  </div>
                </td>
                <td className="p-2.5">{user.phone_number || 'N/A'}</td>
                <td className="p-2.5">{user.church || 'N/A'}</td>
                <td className="p-2.5 text-center text-meta-3">
                  {formatBirthDate(user.birth_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && !error && (
        <div className="text-center p-8 text-gray-500">
          No birthdays found in the system
        </div>
      )}
    </div>
  );
};

export default TableOne;