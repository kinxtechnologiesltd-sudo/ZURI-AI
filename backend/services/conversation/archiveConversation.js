import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebase.js";

/**
 * Archive or restore a conversation
 */
export async function archiveConversation(
  userId,
  conversationId,
  archived = true
) {
  try {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(conversationId)
      .update({
        archived,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      message: archived
        ? "Conversation archived."
        : "Conversation restored.",
    };
  } catch (error) {
    console.error("Archive Conversation Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}