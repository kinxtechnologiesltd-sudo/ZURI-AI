import { auth } from "../firebase/firebaseConfig";

const API_URL = "http://localhost:3001";

// ==========================
// SAVE MESSAGE
// ==========================
export const saveMessage = async (
  conversationId: string,
  sender: "user" | "ai",
  text: string,
  imageUrl?: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("No authenticated user.");
      return;
    }

    const response = await fetch(
      `${API_URL}/conversation/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          conversationId,
          role: sender,
          content: text,
          imageUrl,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error saving message:", data);
    }
  } catch (error) {
    console.error("Error saving message:", error);
  }
};

// ==========================
// LOAD MESSAGES
// ==========================
export const loadMessages = async (
  conversationId: string
) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return [];
    }

    const response = await fetch(
      `${API_URL}/conversation/${user.uid}/${conversationId}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return [];
    }

    return data.messages.map((message: any) => ({
      id: message.id,
      sender: message.role,
      text: message.content,
      imageUrl: message.imageUrl,
      createdAt: message.createdAt,
    }));
  } catch (error) {
    console.error("Error loading messages:", error);
    return [];
  }
};