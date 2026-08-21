import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * =====================================================
 * FIREBASE ADMIN CREDENTIALS
 * =====================================================
 *
 * Credentials are read from environment variables.
 *
 * Required:
 * FIREBASE_PROJECT_ID
 * FIREBASE_CLIENT_EMAIL
 * FIREBASE_PRIVATE_KEY
 */

function getFirebaseCredentials() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim();

  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL?.trim();

  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, "\n")
      .trim();

  /**
   * Safe diagnostic.
   *
   * This ONLY reports whether each variable exists.
   * It NEVER prints the actual credentials.
   */

  console.log(
    "🔥 Firebase environment check:",
    {
      projectId: Boolean(projectId),
      clientEmail: Boolean(clientEmail),
      privateKey: Boolean(privateKey),
    }
  );

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

/**
 * =====================================================
 * INITIALIZE FIREBASE ADMIN
 * =====================================================
 */

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(
          getFirebaseCredentials()
        ),
      });

/**
 * =====================================================
 * FIREBASE SERVICES
 * =====================================================
 */

export const adminAuth =
  getAuth(app);

export const adminDb =
  getFirestore(app);

console.log(
  "✅ Firebase Admin initialized successfully."
);