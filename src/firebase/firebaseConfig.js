import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

// Use the correct Firebase Auth setup for each platform
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app);

export const storage = getStorage(app);