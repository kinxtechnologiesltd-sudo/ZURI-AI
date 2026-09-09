import { auth } from "../firebase/firebaseConfig";

const API_URL = "https://zuri-ai-v1.onrender.com";

// ==========================
// TYPES
// ==========================

export type Conversation = {
  id: string;
  title?: string;
  model?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type ConversationMessage = {
  id?: string;
  role?: "user" | "ai";
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  createdAt?: unknown;
};

// ==========================
// AUTH HEADERS
// ==========================

const getAuthHeaders = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user.");
  }

  const idToken = await user.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
};

// ==========================
// CREATE NEW CONVERSATION
// ==========================

export const createConversation = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return null;
    }

    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/conversation/create`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user.uid,
          title: "New Conversation",
          model: "gpt-5.5",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Error creating conversation:",
        data
      );
      return null;
    }

    return data?.conversation?.id || null;
  } catch (error) {
    console.error(
      "Error creating conversation:",
      error
    );

    return null;
  }
};

// ==========================
// GET SINGLE CONVERSATION
// ==========================

export const getConversation = async (
  conversationId: string
): Promise<ConversationMessage[]> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return [];
    }

    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/conversation/${user.uid}/${conversationId}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Error loading conversation:",
        data
      );

      return [];
    }

    return Array.isArray(data?.messages)
      ? data.messages
      : [];
  } catch (error) {
    console.error(
      "Error loading conversation:",
      error
    );

    return [];
  }
};

// ==========================
// GET ALL CONVERSATIONS
// ==========================

export const getConversations = async (): Promise<
  Conversation[]
> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return [];
    }

    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/conversation/${user.uid}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Error loading conversations:",
        data
      );

      return [];
    }

    return Array.isArray(data?.conversations)
      ? data.conversations
      : [];
  } catch (error) {
    console.error(
      "Error loading conversations:",
      error
    );

    return [];
  }
};

// ==========================
// UPDATE CONVERSATION TITLE
// ==========================

export const updateConversationTitle = async (
  conversationId: string,
  title: string
): Promise<boolean> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return false;
    }

    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/conversation/rename`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          userId: user.uid,
          conversationId,
          title,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();

      console.error(
        "Error updating conversation title:",
        data
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Error updating conversation title:",
      error
    );

    return false;
  }
};