import { auth } from "../firebase/firebaseConfig";

const API_URL = "http://localhost:3001";

// ==========================
// CREATE NEW CONVERSATION
// ==========================
export const createConversation = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return null;
    }

    const response = await fetch(
      `${API_URL}/conversation/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          title: "New Conversation",
          model: "gpt-5.5",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return null;
    }

    return data.conversation.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

// ==========================
// GET SINGLE CONVERSATION
// ==========================
export const getConversation = async (
  conversationId: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) return [];

    const response = await fetch(
      `${API_URL}/conversation/${user.uid}/${conversationId}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return [];
    }

    return data.messages;
  } catch (error) {
    console.error("Error loading conversation:", error);
    return [];
  }
};

// ==========================
// GET ALL CONVERSATIONS
// ==========================
export const getConversations = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return [];

    const response = await fetch(
      `${API_URL}/conversation/${user.uid}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return [];
    }

    return data.conversations;
  } catch (error) {
    console.error("Error loading conversations:", error);
    return [];
  }
};

// ==========================
// UPDATE CONVERSATION TITLE
// ==========================
export const updateConversationTitle = async (
  conversationId: string,
  title: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) return;

    const response = await fetch(
      `${API_URL}/conversation/rename`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          conversationId,
          title,
        }),
      }
    );

    if (!response.ok) {
      console.error(await response.json());
    }
  } catch (error) {
    console.error(
      "Error updating conversation title:",
      error
    );
  }
};