import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIItTXwXXBpSQ0R21i-UM_X83rMUAdvj8",
  authDomain: "hr-portal-1e2f8.firebaseapp.com",
  projectId: "hr-portal-1e2f8",
  storageBucket: "hr-portal-1e2f8.firebasestorage.app",
  messagingSenderId: "498439480768",
  appId: "1:498439480768:web:0f41cff149d1407ed5d425",
  measurementId: "G-M7400EDNKZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
