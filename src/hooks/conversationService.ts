import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

// CREATE NEW CONVERSATION
export const createConversation = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return null;
    }

    const conversationsRef = collection(
      db,
      "users",
      user.uid,
      "conversations"
    );

    const docRef = await addDoc(conversationsRef, {
      title: "New Conversation",
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

// GET SINGLE CONVERSATION
export const getConversation = async (
  conversationId: string
) => {
  return conversationId;
};

// GET ALL CONVERSATIONS
export const getConversations = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return [];

    const q = query(
      collection(
        db,
        "users",
        user.uid,
        "conversations"
      ),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as {
        title: string;
      }),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

// UPDATE CONVERSATION TITLE
export const updateConversationTitle = async (
  conversationId: string,
  title: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) return;

    const conversationRef = doc(
      db,
      "users",
      user.uid,
      "conversations",
      conversationId
    );

    await updateDoc(conversationRef, {
      title,
    });
  } catch (error) {
    console.error(
      "Error updating conversation title:",
      error
    );
  }
};