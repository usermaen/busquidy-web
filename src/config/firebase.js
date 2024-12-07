// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAznhakaYuH_ewYSzgEoHD02AU7ATw56RI",
  authDomain: "busquidy-1756b.firebaseapp.com",
  projectId: "busquidy-1756b",
  storageBucket: "busquidy-1756b.firebasestorage.app",
  messagingSenderId: "401273447371",
  appId: "1:401273447371:web:eebd07509f75cbbe3ecc4e",
  measurementId: "G-JFQPRHXEMN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };