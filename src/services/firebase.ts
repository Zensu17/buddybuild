// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqIMJlSfspMK2czMbdmoR7TdKcaQkhLi8",
  authDomain: "gen-lang-client-0841567094.firebaseapp.com",
  projectId: "gen-lang-client-0841567094",
  storageBucket: "gen-lang-client-0841567094.firebasestorage.app",
  messagingSenderId: "22296224849",
  appId: "1:22296224849:web:73afff4ec83f2abe91c470"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { app, auth };