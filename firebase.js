// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0Oc3yWIkRzvbBkmAnVijR5Rw4He29sQM",
  authDomain: "inventory-management-4d744.firebaseapp.com",
  projectId: "inventory-management-4d744",
  storageBucket: "inventory-management-4d744.appspot.com",
  messagingSenderId: "780018913845",
  appId: "1:780018913845:web:2faf01950253171e51d77c",
  measurementId: "G-M8FV2ZLKJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

export{firestore, storage}