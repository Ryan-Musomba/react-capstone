// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCJy4todCmaCQN6UPK_z3Sl03jLiKLzBog",
    authDomain: "react-capstone-756e0.firebaseapp.com",
    projectId: "react-capstone-756e0",
    storageBucket: "react-capstone-756e0.firebasestorage.app",
    messagingSenderId: "222211866641",
    appId: "1:222211866641:web:546fd4ece3c12c977e71b0"
  };
  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);