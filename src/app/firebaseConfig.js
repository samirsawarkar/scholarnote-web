import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSC91UhsaFsYEBTSFQr9V1JXtgg31Abeo",
  authDomain: "scholarnote-73796.firebaseapp.com",
  projectId: "scholarnote-73796",
  storageBucket: "scholarnote-73796.appspot.com",
  messagingSenderId: "293851557107",
  appId: "1:293851557107:web:2b3900e3215e639bd0db86"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };