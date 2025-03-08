import React, { useState, useEffect } from 'react';
import { ChatService } from './ChatService';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

import { userApi } from './userApi';

import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  // You'll get these values from Firebase Console
  apiKey: "AIzaSyCIItTXwXXBpSQ0R21i-UM_X83rMUAdvj8",
  authDomain: "hr-portal-1e2f8.firebaseapp.com",
  projectId: "hr-portal-1e2f8",
  storageBucket: "hr-portal-1e2f8.firebasestorage.app",
  // storageBucket: "hr-portal-1e2f8.appspot.com",  
  messagingSenderId: "498439480768",
  appId: "1:498439480768:web:0f41cff149d1407ed5d425",
  measurementId: "G-M7400EDNKZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

function UserChat() {
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
        try {
          setLoading(true);
          const user = await userApi.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          setError('Failed to load user profile');
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCurrentUser();
    }, []);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
        try {
          const usersList = await userApi.getUsers();
          setUsers(usersList);
        } catch (error) {
          setError('Failed to load users');
          console.error('Error:', error);
        }
      };
      fetchUsers();
    }, []);


    // In UserChat.jsx, add this effect
useEffect(() => {
    if (!currentUser?.username) return;
  
    // Listen for new messages
    const q = query(
      collection(db, 'messages'),
      where('recipientUsername', '==', currentUser.username),
      where('read', '==', false)
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // Show notification
          const message = change.doc.data();
          // You can use browser notifications or a toast system
          if (Notification.permission === 'granted') {
            new Notification(`New message from ${message.senderName}`, {
              body: message.text
            });
          }
        }
      });
    });
  
    return () => unsubscribe();
  }, [currentUser]);


  // Listen for conversations
  useEffect(() => {
    if (!currentUser?.username) return;

    const unsubscribe = ChatService.getConversations(currentUser.username, async (convos) => {
      try {
        const enhancedConvos = await Promise.all(
          convos.map(async (convo) => {
            const otherUsername = convo.participants.find(username => username !== currentUser.username);
            try {
              const userDetails = await userApi.getUserProfile(otherUsername);
              return { ...convo, otherUser: userDetails };
            } catch (error) {
              console.error(`Error fetching user ${otherUsername}:`, error);
              return { ...convo, otherUser: { username: otherUsername, name: 'Unknown User' } };
            }
          })
        );
        setConversations(enhancedConvos);
      } catch (error) {
        setError('Failed to load conversations');
        console.error('Error:', error);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const conversationId = ChatService.getConversationId(currentUser.username, selectedUser.username);
      await ChatService.sendMessage(conversationId, newMessage, currentUser.username);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error to user
      setError('Failed to send message');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex h-screen">
      {/* User List */}
      <div className="w-1/4 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        {Array.isArray(users) && users.map(user => (
          user.username !== currentUser?.username && (
            <div 
              key={user.username}
              onClick={() => setSelectedUser(user)}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                selectedUser?.username === user.username ? 'bg-blue-50' : ''
              }`}
            >
              {user.profile_picture && (
                <img 
                  src={user.profile_picture} 
                  alt={user.first_name} 
                  className="w-8 h-8 rounded-full inline-block mr-2"
                />
              )}
              <span>{`${user.first_name} ${user.last_name}`}</span>
            </div>
          )
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
      {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center">
              {selectedUser.profile_picture && (
                <img 
                  src={selectedUser.profile_picture} 
                  alt={selectedUser.first_name}
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <div>
                <h3 className="font-bold">{`${selectedUser.first_name} ${selectedUser.last_name}`}</h3>
                <p className="text-sm text-gray-500">{selectedUser.church}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === currentUser.username ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.senderId === currentUser.username
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded-l p-2"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 rounded-r"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default UserChat;