// ChatService.js
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; 
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';


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

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// const db = getFirestore();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export const ChatService = {
  getConversationId: (username1, username2) => {
    return [username1, username2].sort().join('_');
  },

  // Get all conversations for a user
  getConversations: (username, callback) => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', username)
    );
    
    return onSnapshot(q, (snapshot) => {
      const conversations = [];
      snapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() });
      });
      callback(conversations);
    });
  },

  // Get messages for a specific conversation
  getMessages: (conversationId, callback) => {
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages);
    });
  },

  // Send a new message
  sendMessage: async (conversationId, message, sender) => {
    try {
      await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        text: message,
        senderUsername: sender.username,
        senderName: `${sender.first_name} ${sender.last_name}`,
        senderAvatar: sender.profile_picture,
        timestamp: new Date(),
        read: false
      });
      
      // Update conversation metadata
      await db.collection('conversations').doc(conversationId).update({
        lastMessage: message,
        lastMessageTimestamp: new Date(),
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
};