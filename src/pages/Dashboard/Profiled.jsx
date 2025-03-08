// Profile Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../js/services/FBAuthContext';
import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { db } from "../../js/services/firebaseConfig";
import 'react-datepicker/dist/react-datepicker.css';
import { Country, State } from "country-state-city";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';



const Profiled = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editDetails, setEditDetails] = useState({
      phone: '',
      city: '',
      state: '',
      country: '',
    });
  
    const [collection, setCollection] = useState("");
    const db = getFirestore();
  
    useEffect(() => {
      if (currentUser) {
        fetchUserDetails();
      }
    }, [currentUser]);
  
    const fetchUserDetails = async () => {
      try {
        // Try to fetch from the "users" collection first
        let docRef = doc(db, "users", currentUser.uid);
        let docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          // If not found in "users", check in "firsttimers"
          docRef = doc(db, "firsttimers", currentUser.uid);
          docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCollection("firsttimers");
          } else {
            console.log("No such document! User ID:", currentUser.uid);
            return;
          }
        } else {
          setCollection("users");
        }
  
        const data = docSnap.data();
        setUserDetails(data);
        setEditDetails({
          phone: data.phone || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          country: data.address?.country || '',
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
  
    const handleEditChange = (e) => {
      setEditDetails({ ...editDetails, [e.target.name]: e.target.value });
    };
  
    const handleSave = async () => {
      try {
        const userRef = doc(db, collection, currentUser.uid);
        const updateData = {
          phone: editDetails.phone,
          address: {
            city: editDetails.city,
            state: editDetails.state,
            country: editDetails.country
          },
        };
        
        await updateDoc(userRef, updateData);
        setUserDetails(prevDetails => ({
          ...prevDetails,
          ...updateData,
          address: updateData.address
        }));
        setEditMode(false);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    };
  
    return (
        <div className="space-y-6">
        <h1 className="text-2xl font-bold text-yellow-900 mb-6">Profile</h1>
        
        <Card className="bg-white shadow-lg border border-yellow-100">
          <CardHeader>
            <CardTitle className="text-yellow-900">Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
          {userDetails?.profilePictureUrl && (
            <div className="flex justify-center mb-6">
            <img
              src={userDetails.profilePictureUrl}
              alt="Profile"
             className="w-32 h-32 rounded-full object-cover border-4 border-yellow-100"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '20px'
              }}
                />
                </div>
            )}
        

        
        {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-yellow-900 mb-1">Phone</label>
              <input type="text" name="phone" value={editDetails.phone} onChange={handleEditChange} 
              className="w-full p-2 border border-yellow-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

           <div>
                <label className="block text-yellow-900 mb-1">City</label>
              <input type="text" name="city" value={editDetails.city} onChange={handleEditChange} 
              className="w-full p-2 border border-yellow-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
                <label className="block text-yellow-900 mb-1">State</label>
              <input type="text" name="state" value={editDetails.state} onChange={handleEditChange} 
               className="w-full p-2 border border-yellow-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
               />
               </div>

             <div>
                <label className="block text-yellow-900 mb-1">Country</label>
              <input type="text" name="country" value={editDetails.country} onChange={handleEditChange} 
               className="w-full p-2 border border-yellow-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
               />
            </div>
            
            <button onClick={handleSave} 
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors"
            >
            Save changes
            </button>
          </div>
        ) : (
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
                  <p className="text-yellow-900 font-semibold">First Name</p>
                  <p>{userDetails?.firstName}</p>
                </div>
                <div>
                  <p className="text-yellow-900 font-semibold">Last Name</p>
                  <p>{userDetails?.lastName}</p>
                </div>
                <div>
                  <p className="text-yellow-900 font-semibold">Email</p>
                  <p>{userDetails?.email}</p>
                </div>
                <div>
                  <p className="text-yellow-900 font-semibold">Phone</p>
                  <p>{userDetails?.phone}</p>
                </div>
                <div>
                  <p className="text-yellow-900 font-semibold">Date of Birth</p>
                  <p>{userDetails?.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-yellow-900 font-semibold">Gender</p>
                  <p>{userDetails?.gender}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-yellow-900 font-semibold">Address</p>
                <p>{userDetails?.address?.city}, {userDetails?.address?.state}, {userDetails?.address?.country}</p>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors mt-4"
              >
                Edit Profile
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
  export default Profiled;
  