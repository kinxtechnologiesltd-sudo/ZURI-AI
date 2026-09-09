import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebase.js";

/**
 * Create a new conversation
 */
export async function createConversation(userId, title = "New Chat") {
  try {
    const conversationId = randomUUID();

    const conversation = {
      id: conversationId,
      title,
      pinned: false,
      archived: false,
      deleted: false,
      model: "gpt-5.5",
      messageCount: 0,
      lastMessage: "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastMessageAt: FieldValue.serverTimestamp(),
    };

    await adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(conversationId)
      .set(conversation);

    return {
      success: true,
      conversation,
    };
  } catch (error) {
    console.error("Create Conversation Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}