import React, { useEffect, useState } from "react";
import { db } from "../../js/services/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const Profile = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">User Profiles</h1>
      {selectedUser ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Profile Details</h2>
          <p><strong>Username:</strong> {selectedUser.username}</p>
          <p><strong>First Name:</strong> {selectedUser.firstName}</p>
          <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Phone:</strong> {selectedUser.phone}</p>
          <img src={selectedUser.profilePicture} alt="Profile" className="w-32 h-32 rounded-full mx-auto mt-4" />
          <button onClick={() => setSelectedUser(null)} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Back</button>
        </div>
      ) : (
        <table className="table-auto w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleSelectUser(user)} className="bg-blue-500 text-white py-1 px-3 rounded">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Profile;
