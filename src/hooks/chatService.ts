import { auth } from "../firebase/firebaseConfig";

const API_URL = "https://zuri-ai-v1.onrender.com";

/**
 * =====================================================
 * RESEARCH IMAGE
 * =====================================================
 */

export type ResearchImage = {
  url: string;
  title?: string | null;
  sourceUrl?: string | null;
};

/**
 * =====================================================
 * CHAT MESSAGE
 * =====================================================
 */

export type ChatMessage = {
  id: string;

  sender: "user" | "ai";

  text: string;

  imageUrl?: string;

  videoUrl?: string;

  audioUrl?: string;

  pdfUrl?: string;

  pdfName?: string;

  researchImages: ResearchImage[];

  createdAt?: unknown;
};

/**
 * =====================================================
 * SAVE MESSAGE RESPONSE
 * =====================================================
 */

type SaveMessageResponse = {
  success?: boolean;

  error?: string;

  message?: string;
};

/**
 * =====================================================
 * LOAD MESSAGES RESPONSE
 * =====================================================
 */

type LoadMessagesResponse = {
  messages?: Array<{
    id?: string;

    role?: "user" | "ai";

    content?: string;

    imageUrl?: string;

    videoUrl?: string;

    audioUrl?: string;

    pdfUrl?: string;

    pdfName?: string;

    images?: string[];

    researchImages?: ResearchImage[];

    createdAt?: unknown;
  }>;

  error?: string;

  message?: string;
};

/**
 * =====================================================
 * SAVE MESSAGE
 * =====================================================
 *
 * Saves all supported media attached to a message:
 *
 * - Text
 * - Image
 * - Video
 * - Audio
 * - PDF
 * - Research images
 *
 * =====================================================
 */

export const saveMessage = async (
  conversationId: string,

  sender: "user" | "ai",

  text: string,

  imageUrl?: string,

  researchImages?: ResearchImage[],

  videoUrl?: string,

  audioUrl?: string,

  pdfUrl?: string,

  pdfName?: string,
): Promise<void> => {
  try {
    /**
     * ================================================
     * AUTHENTICATED USER
     * ================================================
     */

    const user = auth.currentUser;

    if (!user) {
      console.error(
        "❌ No authenticated user."
      );

      return;
    }

    /**
     * ================================================
     * FIREBASE TOKEN
     * ================================================
     */

    const idToken =
      await user.getIdToken();

    /**
     * ================================================
     * REQUEST
     * ================================================
     */

    const response =
      await fetch(
        `${API_URL}/conversation/message`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${idToken}`,
          },

          body:
            JSON.stringify({
              /**
               * User
               */

              userId:
                user.uid,

              /**
               * Conversation
               */

              conversationId,

              /**
               * Message
               */

              role:
                sender,

              content:
                text,

              /**
               * ======================================
               * MEDIA
               * ======================================
               */

              imageUrl,

              videoUrl,

              audioUrl,

              pdfUrl,

              pdfName,

              /**
               * ======================================
               * RESEARCH IMAGES
               * ======================================
               */

              researchImages:
                Array.isArray(
                  researchImages
                )
                  ? researchImages
                  : [],

              /**
               * ======================================
               * OPTIONS
               * ======================================
               *
               * Keeping media inside options as
               * well preserves compatibility with
               * your existing backend.
               */

              options: {
                imageUrl,

                videoUrl,

                audioUrl,

                pdfUrl,

                pdfName,

                researchImages:
                  Array.isArray(
                    researchImages
                  )
                    ? researchImages
                    : [],
              },
            }),
        }
      );

    /**
     * ================================================
     * RESPONSE
     * ================================================
     */

    const data =
      (await response.json()) as
        SaveMessageResponse;

    /**
     * ================================================
     * ERROR
     * ================================================
     */

    if (!response.ok) {
      console.error(
        "❌ Error saving message:",
        data
      );

      return;
    }

    console.log(
      "✅ Message saved successfully."
    );

    /**
     * Helpful debugging output
     */

    console.log(
      "💾 Saved message media:",
      {
        imageUrl:
          imageUrl || null,

        videoUrl:
          videoUrl || null,

        audioUrl:
          audioUrl || null,

        pdfUrl:
          pdfUrl || null,

        pdfName:
          pdfName || null,

        researchImages:
          Array.isArray(
            researchImages
          )
            ? researchImages.length
            : 0,
      }
    );

  } catch (error) {
    console.error(
      "❌ Error saving message:",
      error
    );
  }
};

/**
 * =====================================================
 * LOAD MESSAGES
 * =====================================================
 *
 * Loads a conversation and restores all media:
 *
 * - Text
 * - Image
 * - Video
 * - Audio
 * - PDF
 * - Research images
 *
 * =====================================================
 */

export const loadMessages = async (
  conversationId: string,
): Promise<ChatMessage[]> => {
  try {
    /**
     * ================================================
     * AUTHENTICATED USER
     * ================================================
     */

    const user =
      auth.currentUser;

    if (!user) {
      console.error(
        "❌ No authenticated user."
      );

      return [];
    }

    /**
     * ================================================
     * FIREBASE TOKEN
     * ================================================
     */

    const idToken =
      await user.getIdToken();

    /**
     * ================================================
     * REQUEST
     * ================================================
     */

    const response =
      await fetch(
        `${API_URL}/conversation/${user.uid}/${conversationId}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${idToken}`,
          },
        }
      );

    /**
     * ================================================
     * RESPONSE
     * ================================================
     */

    const data =
      (await response.json()) as
        LoadMessagesResponse;

    /**
     * ================================================
     * ERROR
     * ================================================
     */

    if (!response.ok) {
      console.error(
        "❌ Error loading messages:",
        data
      );

      return [];
    }

    /**
     * ================================================
     * MESSAGES
     * ================================================
     */

    const messages =
      data.messages || [];

    console.log(
      `✅ Loaded ${messages.length} messages for conversation ${conversationId}`
    );

    /**
     * ================================================
     * FORMAT MESSAGES
     * ================================================
     */

    return messages.map(
      (
        message,
        index
      ) => ({
        /**
         * Message ID
         */

        id:
          message.id ||
          `${conversationId}-${index}`,

        /**
         * Sender
         */

        sender:
          message.role ===
          "user"
            ? "user"
            : "ai",

        /**
         * Text
         */

        text:
          message.content ||
          "",

        /**
         * Image
         *
         * Supports both:
         *
         * imageUrl
         *
         * legacy images[0]
         */

        imageUrl:
          message.imageUrl ||
          message.images?.[0],

        /**
         * Video
         */

        videoUrl:
          message.videoUrl,

        /**
         * Audio
         */

        audioUrl:
          message.audioUrl,

        /**
         * PDF
         */

        pdfUrl:
          message.pdfUrl,

        pdfName:
          message.pdfName,

        /**
         * Research images
         */

        researchImages:
          Array.isArray(
            message.researchImages
          )
            ? message.researchImages
            : [],

        /**
         * Timestamp
         */

        createdAt:
          message.createdAt,
      })
    );

  } catch (error) {
    console.error(
      "❌ Error loading messages:",
      error
    );

    return [];
  }
};