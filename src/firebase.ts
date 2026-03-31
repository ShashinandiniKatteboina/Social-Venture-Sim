import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8nrfNaHddp7CAdqo57DsUbd1O_FydAFk",
  authDomain: "foundersim-6f8e4.firebaseapp.com",
  projectId: "foundersim-6f8e4",
  storageBucket: "foundersim-6f8e4.firebasestorage.app",
  messagingSenderId: "749448810243",
  appId: "1:749448810243:web:a6a7bd32a0b1221cc5a336",
  measurementId: "G-RTWWLFPDZ9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
