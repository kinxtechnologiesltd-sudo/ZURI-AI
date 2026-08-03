import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../config/firebase.js";

/**
 * Save a message in a conversation
 */
export async function saveMessage(
  userId,
  conversationId,
  role,
  content,
  options = {}
) {
  try {
    const messageId = randomUUID();

    const message = {
      id: messageId,
      role,
      content,
      images: options.images || [],
      files: options.files || [],
      voice: options.voice || null,
      metadata: options.metadata || {},
      createdAt: FieldValue.serverTimestamp(),
    };

    const conversationRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("conversations")
      .doc(conversationId);

    await conversationRef
      .collection("messages")
      .doc(messageId)
      .set(message);

    await conversationRef.update({
      lastMessage: content,
      updatedAt: FieldValue.serverTimestamp(),
      lastMessageAt: FieldValue.serverTimestamp(),
      messageCount: FieldValue.increment(1),
    });

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("Save Message Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}