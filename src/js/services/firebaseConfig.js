import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; 


const firebaseConfig = {
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// export { db, storage, auth };
