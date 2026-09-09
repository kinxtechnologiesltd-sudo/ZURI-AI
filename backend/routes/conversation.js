import express from "express";

import {
    archiveConversationController,
    createConversationController,
    deleteConversationController,
    listConversationsController,
    loadConversationController,
    pinConversationController,
    renameConversationController,
    saveMessageController,
} from "../controllers/conversationController.js";

const router = express.Router();

// Create a new conversation
router.post("/create", createConversationController);

// Save a message
router.post("/message", saveMessageController);

// Load a conversation
router.get(
  "/:userId/:conversationId",
  loadConversationController
);

// List all conversations
router.get(
  "/:userId",
  listConversationsController
);

// Rename
router.put("/rename", renameConversationController);

// Delete
router.delete("/delete", deleteConversationController);

// Archive
router.put("/archive", archiveConversationController);

// Pin
router.put("/pin", pinConversationController);

export default router;