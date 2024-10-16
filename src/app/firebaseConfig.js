// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSC91UhsaFsYEBTSFQr9V1JXtgg31Abeo",
  authDomain: "scholarnote-73796.firebaseapp.com",
  projectId: "scholarnote-73796",
  storageBucket: "scholarnote-73796.appspot.com",
  messagingSenderId: "293851557107",
  appId: "1:293851557107:web:2b3900e3215e639bd0db86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

console.log('Firestore instance:', db);

export { db, storage, auth };

console.log('Firebase initialized');
