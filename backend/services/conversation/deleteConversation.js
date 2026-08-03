import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebase.js";

/**
 * Soft delete a conversation
 */
export async function deleteConversation(userId, conversationId) {
  try {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(conversationId)
      .update({
        deleted: true,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      message: "Conversation deleted successfully.",
    };
  } catch (error) {
    console.error("Delete Conversation Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}