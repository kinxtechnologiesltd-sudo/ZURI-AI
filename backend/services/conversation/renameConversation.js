import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebase.js";

/**
 * Rename a conversation
 */
export async function renameConversation(
  userId,
  conversationId,
  title
) {
  try {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(conversationId)
      .update({
        title,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      message: "Conversation renamed successfully.",
    };
  } catch (error) {
    console.error("Rename Conversation Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}