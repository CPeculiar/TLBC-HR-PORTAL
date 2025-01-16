import React, { useState, useEffect } from 'react';
import { format, parseISO, isFuture, isToday, setYear } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import ProfilePic from '../../../public/user/blackmanprofilepic.jpg';


const TableOne = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isUpcomingBirthday = (birthDate) => {
    try {
      const today = new Date();
      const birthday = parseISO(birthDate);
      
      // Set birthday to current year for comparison
      let birthdayThisYear = setYear(birthday, today.getFullYear());

      // If the birthday has passed, move it to the next year
    if (birthdayThisYear < today && !isToday(birthdayThisYear)) {
      return false;
    }
      
      // If this year's birthday has passed, check next year's birthday
      if (birthdayThisYear < today) {
        const birthdayNextYear = setYear(birthday, today.getFullYear() + 1);
        return isFuture(birthdayNextYear);
      }
      
      // Check if the birthday is today or in the future
      return isToday(birthdayThisYear) || isFuture(birthdayThisYear);
    } catch (error) {
      console.error('Error checking birthday:', error);
      return false;
    }
  };


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
          'https://tlbc-platform-api.onrender.com/api/users/?limit=500',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        // Filter users with birthdays and sort them
        const usersWithBirthdays = response.data.results
        .filter(user => user.birth_date && isUpcomingBirthday(user.birth_date))
        .sort((a, b) => {
          const today = new Date();
          const dateA = parseISO(a.birth_date);
          const dateB = parseISO(b.birth_date);
          
          // Set both dates to current year for comparison
          const birthdayA = setYear(dateA, today.getFullYear());
          const birthdayB = setYear(dateB, today.getFullYear());
          
          // If birthday has passed this year, set to next year
          if (birthdayA < today) setYear(birthdayA, today.getFullYear() + 1);
          if (birthdayB < today) setYear(birthdayB, today.getFullYear() + 1);
          
          return birthdayA.getTime() - birthdayB.getTime();
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
    const today = new Date();
    const birthday = setYear(date, today.getFullYear());
    
    if (isToday(birthday)) {
      return "Today!";
    }
    return format(date, 'MMM dd');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const getBirthdayStyle = (dateString) => {
  try {
    const date = parseISO(dateString);
    const today = new Date();
    const birthday = setYear(date, today.getFullYear());
    
    if (isToday(birthday)) {
      return "text-red-500 font-bold";
    }
    return "text-green-500";
  } catch {
    return "text-gray-500";
  }
};

if (loading) {
  return (
    <Card className="w-full">
      <CardContent className="p-8 text-center">
        Loading birthdays...
      </CardContent>
    </Card>
  );
}

if (error) {
  return (
    <Card className="w-full">
      <CardContent className="p-8 text-center text-red-500">
        {error}
      </CardContent>
    </Card>
  );
}

  return (
    <Card className="w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    <CardHeader>
    <CardTitle className="text-xl font-semibold">Upcoming Birthdays</CardTitle>
    </CardHeader>
    <CardContent className="p-0">

      {/* Desktop Table */}
      <div className="hidden md:block dark:text-white">
          <div className="grid grid-cols-4 bg-gray-100 dark:bg-gray/10 font-bold dark:text-white">
            <div className="p-4">
              <h5 className="text-sm font-medium">Name</h5>
            </div>
            <div className="p-4">
              <h5 className="text-sm font-medium">Phone</h5>
            </div>
            <div className="p-4">
              <h5 className="text-sm font-medium">Church</h5>
            </div>
            <div className="p-4">
              <h5 className="text-sm font-medium">Birthday</h5>
            </div>
          </div>

       <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user, key) => (
          <div className="grid grid-cols-4 hover:bg-gray-50 dark:hover:bg-gray-800/50" key={key}>
                <div className="p-4 flex items-center gap-3">
                  <div className="flex-shrink-0">
                <img 
                  src={user.profile_picture } 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                  />
              </div>
              <p className="truncate">{`${user.first_name} ${user.last_name}`}</p>
             </div>

             <div className="p-4 truncate">{user.phone_number || 'N/A'}</div>
                <div className="p-4 truncate">{user.church || 'N/A'}</div>
                <div className={`p-4 ${getBirthdayStyle(user.birth_date)}`}>
                  {formatBirthDate(user.birth_date)}
                </div>
              </div>
        ))}
      </div>
      </div>

      {/* Mobile Table */}
      {/* <div className="block md:hidden">
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
      </div> */}

      <div className="block md:hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user, key) => (
              <div key={key} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.profile_picture }
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{`${user.first_name} ${user.last_name}`}</p>
                    <p className={getBirthdayStyle(user.birth_date)}>
                      {formatBirthDate(user.birth_date)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="truncate">{user.phone_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Church</p>
                    <p className="truncate">{user.church || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>



      {users.length === 0 && !loading && !error && (
        <div className="text-center p-8 text-gray-500">
          No birthdays found in the system
        </div>
      )}
      </CardContent>
      </Card>
  );
};

export default TableOne;