import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import Image from '../../assets/images/MOGooficial.jpg'
import { useNavigate } from 'react-router-dom';



const UsersPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearchOptions, setAdvancedSearchOptions] = useState({
    birth_date_after: '',
    birth_date_before: '',
    church: '',
    city: '',
    country: '',
    enrolled_in_wfs: '',
    gender: '',
    invited_by: '',
    origin_state: '',
    state: '',
    wfs_graduation_year_max: '',
    wfs_graduation_year_min: '',
    zone: '',
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();


  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate('/');
    }

  }, [navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate('/');
        return;
      }
      setIsLoading(true);

      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/users/?s=${searchTerm}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUsers(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10));
      setCurrentPage(1);
      setSearchTerm('');
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate('/');
        return;
      }

      const params = new URLSearchParams();
      Object.entries(advancedSearchOptions).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/users/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUsers(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10));
      setCurrentPage(1);
      setAdvancedSearchOptions({
        birth_date_after: '',
        birth_date_before: '',
        church: '',
        city: '',
        country: '',
        enrolled_in_wfs: '',
        gender: '',
        invited_by: '',
        origin_state: '',
        state: '',
        wfs_graduation_year_max: '',
        wfs_graduation_year_min: '',
        zone: '',
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handlePageChange = async (newPage) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate('/');
        return;
      }

      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/users/?page=${newPage}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUsers(response.data.results);
      setCurrentPage(newPage);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  return (
    <div className="flex h-screen overflow-hidden">


        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-2">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold mb-6">Members</h1>
              </div>
            </div>



            <div className="container mx-auto px-4 py-8">
      

      {/* Basic Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            placeholder="Search by name, mobile or email"
            className="flex-grow p-2 border rounded-l-md dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="bg-purple-600 text-white p-2 rounded-r-md">
            <Search size={22} /> Search
          </button>
        </div>
      </form>

      {/* Advanced Search Toggle */}
      <div className='flex justify-between'>
      <button
        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        className="bg-purple-600 text-white px-4 py-2 rounded-md mb-4"
      >
        {showAdvancedSearch ? 'Hide Advanced Search' : 'Advanced Search'}
      </button>
      <button
        onClick={() => navigate('/usertable')}
        className="bg-purple-600 text-white px-4 py-2 rounded-md mb-4"
      >
        Get all Users info
      </button>
</div>
      {/* Advanced Search Form */}
      {showAdvancedSearch && (
        <form onSubmit={handleAdvancedSearch} className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(advancedSearchOptions).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}
              </label>
              <input
                type={key.includes('date') ? 'date' : key.includes('year') ? 'number' : 'text'}
                id={key}
                name={key}
                value={value}
                onChange={(e) => setAdvancedSearchOptions({ ...advancedSearchOptions, [key]: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}
          <div className="col-span-full">
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-md">
              Search
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.username} onClick={() => setSelectedUser(user)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full mr-3" src="/FamilyExperience.jpg" alt={`${user.first_name} ${user.last_name}`} />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{`${user.first_name} ${user.last_name}`}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{user.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{user.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-300">No records found.</p>
      )}

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
                <X size={24} />
              </button>
            </div>
            <img src="/MOGooficial.jpg" alt={`${selectedUser.first_name} ${selectedUser.last_name}`} className="w-32 h-32 rounded-full mx-auto mb-4" />
            {Object.entries(selectedUser).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{value !== null ? value.toString() : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    </div>
    </main>
    </div>

  );
};

export default UsersPage;