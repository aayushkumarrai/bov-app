import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfaevl66PSMIjS4u6wNzWH-5LQ0gsY0_8",
  authDomain: "where-is-my-bov.firebaseapp.com",
  projectId: "where-is-my-bov",
  storageBucket: "where-is-my-bov.firebasestorage.app",
  messagingSenderId: "794076989916",
  appId: "1:794076989916:web:aa70ff890b4992b1a8a719"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);