import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

// SIGN UP
export const registerUser = async (email, password) => {
  // Create Firebase Authentication account
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  // Create the user's Zuri profile in Firestore
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,

      // Every new account starts on Free
      plan: "free",

      createdAt: serverTimestamp(),
    },
    {
      // Protect existing profile fields if this
      // function is ever called against an existing doc
      merge: true,
    }
  );

  return userCredential;
};

// LOGIN
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

// LOGOUT
export const logoutUser = async () => {
  return await signOut(auth);
};