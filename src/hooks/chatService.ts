import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

export const saveMessage = async (
  conversationId: string,
  sender: "user" | "ai",
  text: string,
  imageUrl?: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return;
    }

    console.log(
      "Saving to:",
      "users",
      user.uid,
      "conversations",
      conversationId,
      "messages"
    );

    const messageData = {
      sender,
      text,
      createdAt: serverTimestamp(),
      ...(imageUrl ? { imageUrl } : {}),
    };

    await addDoc(
      collection(
        db,
        "users",
        user.uid,
        "conversations",
        conversationId,
        "messages"
      ),
      messageData
    );

    console.log("Message saved successfully.");
  } catch (error) {
    console.error("Firestore Error:", error);
  }
};

export const loadMessages = async (
  conversationId: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return [];
    }

    const q = query(
      collection(
        db,
        "users",
        user.uid,
        "conversations",
        conversationId,
        "messages"
      ),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as {
        sender: "user" | "ai";
        text: string;
        imageUrl?: string;
      }),
    }));
  } catch (error) {
    console.error(
      "Error loading messages:",
      error
    );

    return [];
  }
};