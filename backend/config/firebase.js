import "dotenv/config";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseCredentials() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim();

  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL?.trim();

  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, "\n")
      .trim();

  console.log("🔥 Firebase environment check:");
  console.log(
    "PROJECT_ID:",
    projectId ? "FOUND" : "MISSING"
  );
  console.log(
    "CLIENT_EMAIL:",
    clientEmail ? "FOUND" : "MISSING"
  );
  console.log(
    "PRIVATE_KEY:",
    privateKey ? "FOUND" : "MISSING"
  );
console.log("🔥 RENDER TEST:", process.env.TEST_RENDER);
console.log("🔥 FIREBASE PROJECT:", !!process.env.FIREBASE_PROJECT_ID);
console.log("🔥 FIREBASE EMAIL:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("🔥 FIREBASE KEY:", !!process.env.FIREBASE_PRIVATE_KEY);
  if (
    !projectId ||
    !clientEmail ||
    !privateKey
  ) {
    throw new Error(
      "Firebase Admin credentials are missing."
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(
          getFirebaseCredentials()
        ),
      });

export const adminAuth =
  getAuth(app);

export const adminDb =
  getFirestore(app);