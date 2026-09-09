import { adminDb } from "../../config/firebase.js";

/**
 * Load all messages from a conversation
 */
export async function loadConversation(userId, conversationId) {
  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Load Conversation Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}