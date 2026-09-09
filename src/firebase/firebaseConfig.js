import { initializeApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBU9m-Cnjlor1i7-cTeSI5Arjgkr_Z_YGY",
  authDomain: "kinx-athena-v2.firebaseapp.com",
  projectId: "kinx-athena-v2",
  storageBucket: "kinx-athena-v2.firebasestorage.app",
  messagingSenderId: "261432661731",
  appId: "1:261432661731:web:e0e607ccfce3f3bd1f17d6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase Auth persistence error:", error);
});

export const db = getFirestore(app);

export const storage = getStorage(app);