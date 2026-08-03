import { archiveConversation } from "../services/conversation/archiveConversation.js";
import { createConversation } from "../services/conversation/createConversation.js";
import { deleteConversation } from "../services/conversation/deleteConversation.js";
import { listConversations } from "../services/conversation/listConversations.js";
import { loadConversation } from "../services/conversation/loadConversation.js";
import { pinConversation } from "../services/conversation/pinConversation.js";
import { renameConversation } from "../services/conversation/renameConversation.js";
import { saveMessage } from "../services/conversation/saveMessage.js";

// ===============================
// CREATE CONVERSATION
// ===============================
export async function createConversationController(req, res) {
  try {
    const { userId, title } = req.body;

    const result = await createConversation(userId, title);

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ===============================
// SAVE MESSAGE
// ===============================
export async function saveMessageController(req, res) {
  try {
    console.log("🔥 saveMessageController called");
    console.log(req.body);

    const {
      userId,
      conversationId,
      role,
      content,
      options,
    } = req.body;

    const result = await saveMessage(
      userId,
      conversationId,
      role,
      content,
      options
    );

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ===============================
// LOAD CONVERSATION
// ===============================
export async function loadConversationController(req, res) {
  try {
    const { userId, conversationId } = req.params;

    const result = await loadConversation(
      userId,
      conversationId
    );

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ===============================
// LIST CONVERSATIONS
// ===============================
export async function listConversationsController(req, res) {
  try {
    const { userId } = req.params;

    const result = await listConversations(userId);

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ===============================
// RENAME CONVERSATION
// ===============================
export async function renameConversationController(req, res) {
  try {
    const {
      userId,
      conversationId,
      title,
    } = req.body;

    const result = await renameConversation(
      userId,
      conversationId,
      title
    );

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ===============================
// DELETE CONVERSATION
// ===============================
export async function deleteConversationController(req, res) {
  try {
    const {
      userId,
      conversationId,
    } = req.body;

    const result = await deleteConversation(
      userId,
      conversationId
    );

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ===============================
// ARCHIVE CONVERSATION
// ===============================
export async function archiveConversationController(req, res) {
  try {
    const {
      userId,
      conversationId,
      archived,
    } = req.body;

    const result = await archiveConversation(
      userId,
      conversationId,
      archived
    );

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ===============================
// PIN CONVERSATION
// ===============================
export async function pinConversationController(req, res) {
  try {
    const {
      userId,
      conversationId,
      pinned,
    } = req.body;

    const result = await pinConversation(
      userId,
      conversationId,
      pinned
    );

    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}