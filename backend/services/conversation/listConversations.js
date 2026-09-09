import { adminDb } from "../../config/firebase.js";

/**
 * List all conversations for a user
 */
export async function listConversations(userId) {
  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .orderBy("updatedAt", "desc")
      .get();

    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      conversations,
    };
  } catch (error) {
    console.error("List Conversations Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}