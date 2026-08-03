import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebase.js";

/**
 * Pin or unpin a conversation
 */
export async function pinConversation(
  userId,
  conversationId,
  pinned = true
) {
  try {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(conversationId)
      .update({
        pinned,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      message: pinned
        ? "Conversation pinned."
        : "Conversation unpinned.",
    };
  } catch (error) {
    console.error("Pin Conversation Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}