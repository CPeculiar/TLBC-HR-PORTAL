import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import Image from '../../assets/images/MOGooficial.jpg'
import { useNavigate } from 'react-router-dom';
// import '../../css/additional-styles/UserTable.css'; 

const UserTable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchUsers = async (page = 1) => {

    try {
      const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert("Access token not found. Please login first.");
      navigate('/login');
      return;
    }
    setIsLoading(true);

      const response = await axios.get(`https://tlbc-platform-api.onrender.com/api/users/?page=${page}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUsers(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);


  return (


    <div className="flex h-screen overflow-hidden">

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-2">
              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold mb-2">All Members</h1>
              </div>
            </div>


    <div className="user-table-container">
      <button onClick={() => fetchUsers()} className="get-users  text-white px-4 py-2 rounded-md mb-4"></button>
      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              
              <th>Email</th>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Gender</th>
              
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.email}</td>
                <td>{`${user.first_name} ${user.last_name}`}</td>
                <td>{user.phone_number}</td>
                <td>{user.gender}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination ">
        <button 
          onClick={() => fetchUsers(currentPage - 1)} 
          disabled={currentPage === 1}
          className='bg-purple-600 text-white px-4 py-2 rounded-md mb-4'
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button 
          onClick={() => fetchUsers(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className='bg-purple-600 text-white px-4 py-2 rounded-md mb-4'
        >
          Next
        </button>
      </div>
    </div>
    </div>
    </main>
    </div>
  );
};

export default UserTable;