import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

// =========================
// CREATE / UPDATE USER PROFILE
// =========================

const createUserProfile = async (user) => {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      plan: "free",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// =========================
// EMAIL SIGN UP
// =========================

export const registerUser = async (
  fullName,
  email,
  password
) => {
  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

  await updateProfile(credential.user, {
    displayName: fullName.trim(),
  });

  await createUserProfile(
    credential.user
  );

  return credential.user;
};

// =========================
// EMAIL LOGIN
// =========================

export const loginUser = async (
  email,
  password
) => {
  const credential =
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

  return credential.user;
};

// =========================
// PASSWORD RESET
// =========================

export const resetPassword = async (
  email
) => {
  if (!email.trim()) {
    throw new Error(
      "Please enter your email."
    );
  }

  await sendPasswordResetEmail(
    auth,
    email.trim()
  );

  return true;
};

// =========================
// SAVE GOOGLE USER
// =========================

export const saveGoogleUser = async (
  user
) => {
  await createUserProfile(user);

  return user;
};

// =========================
// LOGOUT
// =========================

export const logoutUser = async () => {
  await signOut(auth);
};