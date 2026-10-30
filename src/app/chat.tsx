import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import ZuriLogo from "../asset/images/zuri-icon.png (2).png";
import { useFocusEffect } from "expo-router";
import { readSSEStream } from "../utils/sseReader";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
    Image,
  useWindowDimensions,
} from "react-native";

import GenerationProgressCard from "../components/chat/GenerationProgressCard";
import MessageBubble from "../components/chat/MessageBubble";
import RightPanel from "../components/layout/RightPanel";
import Sidebar from "../components/layout/Sidebar";
import TopHeader from "../components/layout/TopHeader";
import { useConversation } from "../context/ConversationContext";
import { usePreferences } from "../context/PreferencesContext";
import { auth } from "../firebase/firebaseConfig";
import {
  loadMessages,
  saveMessage,
} from "../hooks/chatService";
import {
  createConversation,
  updateConversationTitle,
} from "../hooks/conversationService";
import { uploadGeneratedImage } from "../hooks/imageStorageService";
import { getMemories } from "../hooks/memoryService";
import {
  deleteVoiceAudioFile,
  saveVoiceAudioFile,
} from "../utils/voiceAudioFile";
import useUserPlan from "../hooks/useUserPlan";

const API_BASE_URL =
  "https://zuri-ai-v1.onrender.com";
const MAX_CHAT_UPLOAD_BYTES = 10 * 1024 * 1024;
const CHAT_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

type Message = {
  id?: string;
  text: string;
  sender: "user" | "ai";
  attachment?: {
    name: string;
    uri: string;
    mimeType?: string;
    size?: number;
  };
  imageType?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  pdfName?: string;
  researchImages?: Array<{
    url: string;
    title?: string | null;
    sourceUrl?: string | null;
    creator?: string | null;
  }>;
  researchVideos?: Array<{
    id?: string;
    title: string;
    channel?: string | null;
    source: string;
    url: string;
    thumbnailUrl?: string | null;
  }>;
  sources?: Array<{
    title?: string | null;
    url?: string | null;
    content?: string | null;
    publishedDate?: string | null;
  }>;
};

function GenerationStatus({
  type,
}: {
  type: "image" | "music" | "video" | "comic";
}) {
  const status = {
    image: {
      icon: "🎨",
      title: "Creating your image...",
      text: "Zuri is bringing your idea to life.",
    },
    music: {
      icon: "🎵",
      title: "Creating your music...",
      text: "Zuri is composing your sound.",
    },
    video: {
      icon: "🎬",
      title: "Creating your video...",
      text: "Zuri is rendering your creation.",
    },
    comic: {
      icon: "💥",
      title: "Creating your comic...",
      text: "Zuri is building your visual story.",
    },
  }[type];

  return (
    <View style={styles.generationStatus}>
      <View style={styles.generationHeader}>
        <Text style={styles.generationIcon}>
          {status.icon}
        </Text>

        <View style={styles.generationTextContainer}>
          <Text style={styles.generationTitle}>
            {status.title}
          </Text>

          <Text
            style={styles.generationDescription}
          >
            {status.text}
          </Text>
        </View>
      </View>

      <View style={styles.generationProgressTrack}>
        <View style={styles.generationProgress} />
      </View>
    </View>
  );
}

export default function Chat() {
  const [mediaGenerationType, setMediaGenerationType] =
    useState<
      "image" | "music" | "video" | null
    >(null);

  const {
    currentConversationId,
    setCurrentConversationId,
    triggerConversationRefresh,
  } = useConversation();

  const [input, setInput] = useState("");
  const [selectedAttachment, setSelectedAttachment] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isPickingAttachment, setIsPickingAttachment] =
    useState(false);

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );
  const webRecordingStartedAt = useRef<number | null>(null);
  const voicePlayer = useAudioPlayer(null);
  const voiceAudioFileUri = useRef<string | null>(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const {
    voiceGender,
    setVoiceGender,
    preferredName,
    responseStyle,
    responseLength,
  } = usePreferences();

  const [showVoiceOptions, setShowVoiceOptions] =
    useState(false);

  const { isProUser } = useUserPlan();

  const showChatAlert = (
    title: string,
    message: string
  ) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const [isVoiceMode, setIsVoiceMode] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [generationType, setGenerationType] =
    useState<
      "image" | "music" | "video" | "comic" | null
    >(null);


  const [messages, setMessages] =
    useState<Message[]>([]);

  const [showMobileHistory, setShowMobileHistory] =
    useState(false);
const scrollViewRef =
  useRef<ScrollView>(null);

const inputRef = useRef<TextInput>(null);
const abortControllerRef = useRef<AbortController | null>(null);

  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isMobile = width < 600;
  const isSmallPhone = width < 380;

  useFocusEffect(
  useCallback(() => {
    if (!isMobile) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);

    return () => clearTimeout(timer);
  }, [isMobile])
);

  useEffect(() => {
    console.log(
      "Zuri Pro status:",
      isProUser
    );
  }, [isProUser]);

  useEffect(() => {
    const subscription = voicePlayer.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (!status.didJustFinish) return;

        const fileUri = voiceAudioFileUri.current;
        voiceAudioFileUri.current = null;
        if (fileUri) {
          deleteVoiceAudioFile(fileUri);
        }
      }
    );

    return () => {
      subscription.remove();
      const fileUri = voiceAudioFileUri.current;
      voiceAudioFileUri.current = null;
      if (fileUri) {
        deleteVoiceAudioFile(fileUri);
      }
    };
  }, [voicePlayer]);

  async function toggleRecording() {
    if (!isProUser) {
      showChatAlert(
        "Zuri Voice is a Pro feature",
        "Upgrade to Pro or Ultra to use voice conversations."
      );
      return;
    }

    try {
      // STOP RECORDING
      if (isRecording) {
        const webRecordingDurationMs =
          Platform.OS === "web" && webRecordingStartedAt.current !== null
            ? Date.now() - webRecordingStartedAt.current
            : null;
        await audioRecorder.stop();
        setIsRecording(false);
        webRecordingStartedAt.current = null;
        if (Platform.OS === "web") {
          console.log(
            "Recording stopped (duration seconds):",
            webRecordingDurationMs === null
              ? null
              : webRecordingDurationMs / 1000
          );
        }

        const audioUri = audioRecorder.uri;

        if (!audioUri) {
          return;
        }

        const audioResponse =
          await fetch(audioUri);

        const audioBlob =
          await audioResponse.blob();

        const uriExtension = audioUri
          .split(/[?#]/)[0]
          .match(/\.(m4a|webm|3gp|wav|mp3|aac|ogg)$/i)?.[1]
          ?.toLowerCase();
        const blobMimeType = audioBlob.type
          .split(";")[0]
          .trim()
          .toLowerCase();
        const extensionFromMimeType: Record<string, string> = {
          "audio/mp4": "m4a",
          "audio/x-m4a": "m4a",
          "audio/webm": "webm",
          "audio/3gpp": "3gp",
          "audio/wav": "wav",
          "audio/x-wav": "wav",
          "audio/mpeg": "mp3",
          "audio/aac": "aac",
          "audio/ogg": "ogg",
        };
        const mimeTypeFromExtension: Record<string, string> = {
          m4a: "audio/mp4",
          webm: "audio/webm",
          "3gp": "audio/3gpp",
          wav: "audio/wav",
          mp3: "audio/mpeg",
          aac: "audio/aac",
          ogg: "audio/ogg",
        };
        const audioExtension =
          uriExtension ||
          extensionFromMimeType[blobMimeType] ||
          (Platform.OS === "web" ? "webm" : "m4a");
        const audioMimeType =
          mimeTypeFromExtension[audioExtension] ||
          blobMimeType ||
          "application/octet-stream";
        const uploadBlob = audioBlob.slice(
          0,
          audioBlob.size,
          audioMimeType
        );
        const uploadFilename = `zuri-voice.${audioExtension}`;

        if (Platform.OS === "web") {
          console.log(
            "Browser MediaRecorder MIME type:",
            audioBlob.type
          );
          console.log(
            "Blob size (bytes):",
            audioBlob.size
          );
          console.log(
            "Blob type:",
            audioBlob.type
          );
          console.log(
            "Blob filename/extension:",
            uploadFilename
          );
          console.log(
            "Upload MIME type:",
            uploadBlob.type
          );
        }

        const formData = new FormData();

        formData.append(
          "audio",
          uploadBlob,
          uploadFilename
        );

        const user = auth.currentUser;
        if (!user) {
          throw new Error(
            "You must be logged in to transcribe a recording."
          );
        }
        const idToken = await user.getIdToken();

        const transcriptionResponse =
          await fetch(
            `${API_BASE_URL}/voice/transcribe`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
              body: formData,
            }
          );

        const responseText =
          await transcriptionResponse.text();

        if (Platform.OS === "web") {
          console.log(
            "TRANSCRIPTION HTTP STATUS:",
            transcriptionResponse.status
          );
        }

        let data: any;

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Voice server returned invalid response (${transcriptionResponse.status}).`
          );
        }

        if (!transcriptionResponse.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Voice transcription failed."
          );
        }

        if (data.text) {
          const transcribedText =
            data.text.trim();

          setInput(transcribedText);

          if (transcribedText) {
            setIsVoiceMode(true);

            await sendMessage(
              transcribedText,
              true
            );
          }
        }

        return;
      }

      // START RECORDING
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        showChatAlert(
          "Permission Required",
          "Microphone permission is required to use Zuri Voice."
        );
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      if (Platform.OS === "web") {
        webRecordingStartedAt.current = Date.now();
      }
      audioRecorder.record();

      setIsRecording(true);
      if (Platform.OS === "web") {
        console.log("Recording started");
      }
    } catch (error) {
      setIsRecording(false);
    }
  }

  const speakBrowserVoice = (
    text: string
  ) => {
    if (typeof window === "undefined")
      return;

    if (!("speechSynthesis" in window)) {
      console.log(
        "Browser speech is not supported."
      );
      return;
    }

    window.speechSynthesis.cancel();

    let speechText = text;

    speechText = speechText
      .replace(/\bKINX\b/g, "Kings")
      .replace(/\bKinx\b/g, "Kings");

    const speech =
      new SpeechSynthesisUtterance(
        speechText
      );

    const voices =
      window.speechSynthesis.getVoices();

    console.log(
      "POSSIBLE FEMALE AFRICAN VOICES:",
      voices
        .filter((voice) =>
          [
            "en-NG",
            "en-GH",
            "en-KE",
            "en-ZA",
          ].includes(voice.lang)
        )
        .map((voice) => ({
          name: voice.name,
          lang: voice.lang,
        }))
    );

    let selectedVoice;

    if (voiceGender === "female") {
      selectedVoice =
        voices.find(
          (voice) =>
            voice.lang.toLowerCase() ===
              "en-ng" &&
            /female|ezinne|nneka|ada/i.test(
              voice.name
            )
        ) ||
        voices.find(
          (voice) =>
            [
              "en-ng",
              "en-gh",
              "en-ke",
              "en-za",
            ].includes(
              voice.lang.toLowerCase()
            ) &&
            /female|woman/i.test(
              voice.name
            )
        ) ||
        voices.find((voice) =>
          /aria|zira|samantha|jenny|susan|hazel|libby|sonia/i.test(
            voice.name
          )
        ) ||
        voices.find(
          (voice) =>
            voice.lang
              .toLowerCase()
              .startsWith("en") &&
            /female|woman/i.test(
              voice.name
            )
        );

      speech.rate = 0.9;
      speech.pitch = 1.0;
    } else {
      selectedVoice =
        voices.find(
          (voice) =>
            voice.lang.toLowerCase() ===
              "en-ng" &&
            /male|abeo|chinedu|tunde/i.test(
              voice.name
            )
        ) ||
        voices.find(
          (voice) =>
            [
              "en-ng",
              "en-gh",
              "en-ke",
              "en-za",
            ].includes(
              voice.lang.toLowerCase()
            ) &&
            /male|man/i.test(
              voice.name
            )
        ) ||
        voices.find((voice) =>
          /guy|david|mark|george|ryan|daniel|james/i.test(
            voice.name
          )
        ) ||
        voices.find(
          (voice) =>
            voice.lang
              .toLowerCase()
              .startsWith("en") &&
            /male|man/i.test(
              voice.name
            )
        );

      speech.rate = 0.9;
      speech.pitch = 0.95;
    }

    if (selectedVoice) {
      speech.voice = selectedVoice;

      console.log(
        `Zuri ${voiceGender} free voice:`,
        selectedVoice.name,
        selectedVoice.lang
      );
    } else {
      console.log(
        `No matching ${voiceGender} voice found. Using browser default.`
      );
    }

    speech.volume = 1;

    window.speechSynthesis.speak(
      speech
    );
  };

  const speakZuriReply = async (
    text: string
  ) => {
    if (!isProUser) return;

    try {
      const voiceId =
        voiceGender === "female"
          ? "JMwQvjJt08OhYlPBWeyc"
          : "8P18CIVcRlwP98FOjZDm";

      console.log(
        "Generating Zuri Pro neural voice:",
        voiceGender
      );

const user = auth.currentUser;

if (!user) {
  throw new Error("You must be signed in to use Zuri Voice.");
}

const idToken = await user.getIdToken();
const response = await fetch(
  `${API_BASE_URL}/voice/speak`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      text,
      voiceId,
    }),
  }
);
      if (!response.ok) {
        throw new Error(
          `Voice service returned ${response.status}.`
        );
      }

      if (Platform.OS === "web") {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        await audio.play();
        return;
      }

      const audioFileUri = await saveVoiceAudioFile(response);

      const previousFileUri = voiceAudioFileUri.current;
      voicePlayer.replace({ uri: audioFileUri });
      voiceAudioFileUri.current = audioFileUri;
      if (previousFileUri) {
        deleteVoiceAudioFile(previousFileUri);
      }
      voicePlayer.play();
    } catch (error) {
      console.error(
        "Zuri Pro voice error:",
        error
      );

      showChatAlert(
        "Voice Unavailable",
        error instanceof Error
          ? error.message
          : "Zuri could not play the voice response. Please try again."
      );
    }
  };

  useEffect(() => {
    console.log(
      "Chat currentConversationId changed:",
      currentConversationId
    );

    const fetchMessages = async () => {
      if (!currentConversationId) {
        setMessages([]);
        return;
      }

      try {
        const data: Message[] =
          await loadMessages(
            currentConversationId
          );

        console.log(
          "✅ CHAT MESSAGES LOADED:",
          data
        );

        const formattedMessages =
          data.map((message) => ({
            id: message.id,
            sender: message.sender,
            text: message.text,
            imageUrl:
              message.imageUrl,
            videoUrl:
              message.videoUrl,
            audioUrl:
              message.audioUrl,
            pdfUrl:
              message.pdfUrl,
            pdfName:
              message.pdfName,
            researchImages:
              Array.isArray(
                message.researchImages
              )
                ? message.researchImages
                : [],
            researchVideos:
              Array.isArray(message.researchVideos)
                ? message.researchVideos
                : [],
            sources:
              Array.isArray(message.sources)
                ? message.sources
                : [],
          }));

        setMessages(
          formattedMessages
        );
      } catch (error) {
        console.error(
          "❌ LOAD MESSAGES ERROR:",
          error
        );

        setMessages([]);
      }
    };

    fetchMessages();
  }, [currentConversationId]);

  const chooseChatAttachment = async () => {
    setIsPickingAttachment(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: CHAT_ATTACHMENT_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const extension = asset.name.split(".").pop()?.toLowerCase();
      const supportedExtension = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "pdf",
      ].includes(extension || "");

      if (
        (asset.mimeType &&
          !CHAT_ATTACHMENT_TYPES.includes(asset.mimeType)) ||
        (!asset.mimeType && !supportedExtension)
      ) {
        showChatAlert(
          "Unsupported file",
          "Attach a JPEG, PNG, WebP, or PDF file."
        );
        return;
      }

      if (
        typeof asset.size === "number" &&
        asset.size > MAX_CHAT_UPLOAD_BYTES
      ) {
        showChatAlert(
          "File too large",
          "Chat attachments must be 10 MB or smaller."
        );
        return;
      }

      setSelectedAttachment(asset);
    } catch (error) {
      console.error("Chat attachment picker failed:", error);
      showChatAlert(
        "Unable to select file",
        "Please try choosing the file again."
      );
    } finally {
      setIsPickingAttachment(false);
    }
  };

  const callAthena = async (
    message: string,
    attachment?: DocumentPicker.DocumentPickerAsset | null,
    options?: {
      onDelta?: (text: string) => void;
      signal?: AbortSignal;
    }
  ) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "You must be logged in to use Zuri."
      );
    }

    const cleanMessage =
      String(message || "").trim();

    if (!cleanMessage) {
      throw new Error(
        "Cannot send an empty message to Zuri."
      );
    }

    const formData = new FormData();

    formData.append(
      "message",
      cleanMessage
    );

    if (attachment) {
      const fileBlob =
        Platform.OS === "web" && attachment.file
          ? attachment.file
          : await fetch(attachment.uri).then((result) => {
              if (!result.ok) {
                throw new Error("Unable to read the selected file.");
              }
              return result.blob();
            });
      const extension = attachment.name.split(".").pop()?.toLowerCase();
      const mimeType =
        attachment.mimeType ||
        (extension === "pdf"
          ? "application/pdf"
          : extension === "png"
            ? "image/png"
            : extension === "webp"
              ? "image/webp"
              : "image/jpeg");
      const uploadBlob = new Blob([fileBlob], { type: mimeType });

      if (uploadBlob.size > MAX_CHAT_UPLOAD_BYTES) {
        throw new Error("Chat attachments must be 10 MB or smaller.");
      }

      formData.append("file", uploadBlob, attachment.name);
    }

    const recentHistory =
      messages.slice(-2).map((msg) => ({
        sender: msg.sender,
        text:
          String(msg.text || "").length >
          800
            ? String(msg.text).slice(
                0,
                800
              ) +
              "\n[Earlier content truncated]"
            : String(msg.text || ""),
      }));

    console.log(
      "📜 History being sent to backend:",
      recentHistory
    );

    formData.append(
      "history",
      JSON.stringify(recentHistory)
    );

    const savedMemories =
      await getMemories();

    console.log(
      "🧠 Memories being sent to backend:",
      savedMemories
    );

    formData.append(
      "preferences",
      JSON.stringify({
        preferredName,
        responseStyle,
        responseLength,
      })
    );

    formData.append(
      "memories",
      JSON.stringify(
        savedMemories.map(
          (memory) => memory.content
        )
      )
    );

    console.log(
      "Sending message to Zuri:",
      message
    );

    const idToken =
      await user.getIdToken();

    const response = await fetch(
      !attachment
        ? `${API_BASE_URL}/stream`
        : `${API_BASE_URL}/chat`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${idToken}`,
        },
        body: formData,
        signal: abortControllerRef.current?.signal,
      }
    );

    if (!response.ok) {
      let errorData: any = null;

      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      console.error(
        "Zuri backend error:",
        errorData
      );

      throw new Error(
        errorData?.reply ||
          errorData?.message ||
          errorData?.error ||
          "Zuri request failed."
      );
    }

    let data: any = {
      reply: "",
    };

    if (!attachment) {
      let accumulated = "";

      await readSSEStream(
        response,
        (event) => {
          if (event.data === "[DONE]") {
            return;
          }

          try {
            const parsed = JSON.parse(event.data);

            if (parsed?.type === "media") {
              data = {
                ...data,
                ...parsed,
                reply: accumulated,
              };
              return;
            }

            if (typeof parsed?.delta === "string") {
              accumulated += parsed.delta;

              if (options?.onDelta) {
                options.onDelta(accumulated);
              }
            }

            if (parsed?.error?.message) {
              throw new Error(parsed.error.message);
            }
          } catch (error) {
            if (event.data !== "[DONE]") {
              console.error(
                "Malformed SSE event:",
                event.data
              );
            }
          }
        }
      );

      data.reply = accumulated;
    } else {
      data = await response.json();
    }

    return data;
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
  };

  const generateImage = async (
    prompt: string
  ) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "You must be logged in to generate images."
      );
    }

    const idToken =
      await user.getIdToken();

    const response = await fetch(
      `${API_BASE_URL}/image/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          prompt,
        }),
      }
    );

    const data =
      await response.json();

    console.log(
      "🎨 Image generation response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Image generation failed."
      );
    }

    if (!data.image) {
      throw new Error(
        "Zuri generated no image."
      );
    }

    return data;
  };

  const waitForMusic = async (
    taskId: string
  ): Promise<string | null> => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "You must be logged in to check music status."
      );
    }

    const idToken =
      await user.getIdToken();

    const maxAttempts = 60;
    const intervalMs = 5000;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        console.log(
          `🎵 Checking Suno status (${attempt}/${maxAttempts})`
        );

        const response =
          await fetch(
            `${API_BASE_URL}/suno/status/${encodeURIComponent(
              taskId
            )}`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${idToken}`,
              },
            }
          );

        const data =
          await response.json();

        console.log(
          "🎵 Suno status response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Unable to check music status."
          );
        }

        if (data.audioUrl) {
          console.log(
            "✅ Suno audio ready:",
            data.audioUrl
          );

          return data.audioUrl;
        }

        const status =
          String(
            data.status || ""
          ).toUpperCase();

        if (
          status === "FAILED" ||
          status === "ERROR" ||
          status === "CANCELLED"
        ) {
          console.error(
            "❌ Suno generation failed:",
            data
          );

          return null;
        }
      } catch (error) {
        console.error(
          "Suno polling error:",
          error
        );
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            intervalMs
          )
      );
    }

    console.error(
      "⏰ Suno generation timed out."
    );

    return null;
  };

  async function sendMessage(
    voiceText?: string,
    shouldSpeak = false
  ) {
    if (loading) return;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const prompt =
      voiceText || input;
    const attachment = selectedAttachment;

    if (!prompt.trim() && !attachment) return;

    const requestPrompt =
      prompt.trim() ||
      `Please analyze the attached file "${attachment?.name}".`;

    const useStreaming = !attachment;
    const displayPrompt = attachment
      ? `${requestPrompt}\n\nAttachment: ${attachment.name}`
      : requestPrompt;

    console.log(
      "Conversation ID:",
      currentConversationId
    );

    setInput("");
    setLoading(true);

    const lowerPrompt =
      requestPrompt.toLowerCase();

    if (
      !attachment &&
      /\b(generate|create|make|draw)\b[\s\S]{0,80}\b(image|picture|photo|artwork|illustration)\b/i.test(
        lowerPrompt
      )
    ) {
      setMediaGenerationType(
        "image"
      );
    } else if (!attachment &&
      /\b(generate|create|make|compose)\b[\s\S]{0,80}\b(music|song|beat|audio)\b/i.test(
        lowerPrompt
      )
    ) {
      setMediaGenerationType(
        "music"
      );
    } else if (!attachment &&
      /\b(generate|create|make|produce|render)\b[\s\S]{0,80}\b(video|movie|clip|animation)\b/i.test(
        lowerPrompt
      )
    ) {
      setMediaGenerationType(
        "video"
      );
    } else {
      setMediaGenerationType(
        null
      );
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: displayPrompt,
        attachment: attachment
          ? {
              name: attachment.name,
              uri: attachment.uri,
              mimeType: attachment.mimeType,
              size: attachment.size,
            }
          : undefined,
      },
    ]);

    if (useStreaming) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "",
        },
      ]);
    }

    try {
      console.log(
        "Current Conversation:",
        currentConversationId
      );

      let conversationId =
        currentConversationId;

      if (!conversationId) {
        conversationId =
          await createConversation();

        if (conversationId) {
          setCurrentConversationId(
            conversationId
          );
        }
      }

      if (conversationId) {
        try {
          console.log(
            "💾 Saving user message..."
          );

          await saveMessage(
            conversationId,
            "user",
            displayPrompt
          );

          console.log(
            "✅ User message saved."
          );
        } catch (error) {
          console.error(
            "⚠️ Failed to save user message:",
            error
          );
        }

        try {
          await updateConversationTitle(
            conversationId,
            requestPrompt.length > 40
              ? requestPrompt.substring(0, 40) +
                "..."
              : requestPrompt
          );

          triggerConversationRefresh();
        } catch (error) {
          console.error(
            "⚠️ Conversation title update failed:",
            error
          );
        }
      }

      const wantsImage =
        !attachment &&
        /\b(generate|create|make|draw)\b[\s\S]{0,80}\b(image|picture|photo|artwork|illustration)\b/i.test(
          requestPrompt
        );

      if (wantsImage) {
        console.log(
          "🎨 Zuri image generation requested."
        );

        const result =
          await generateImage(
            requestPrompt
          );

        console.log(
          "🎨 Image generated successfully."
        );

        const permanentImageUrl =
          await uploadGeneratedImage(
            result.image
          );

        console.log(
          "☁️ Image uploaded successfully:",
          permanentImageUrl
        );

        const replyText =
          result.text ||
          "Here's the image I generated for you.";

        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: replyText,
            imageUrl:
              permanentImageUrl,
            imageType:
              "image",
          },
        ]);

        if (conversationId) {
          const savedId = await saveMessage(
            conversationId,
            "ai",
            replyText,
            permanentImageUrl
          );
          if (savedId) {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.sender === "ai") {
                next[next.length - 1] = { ...last, id: savedId };
              }
              return next;
            });
          }
        }

        triggerConversationRefresh();

  
        return;
      }

      console.log(
        "🚀 CALLING ZURI BACKEND NOW:",
        requestPrompt
      );

      const data = await callAthena(
        requestPrompt,
        attachment,
        useStreaming
          ? {
              onDelta: (text: string) => {
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];

                  if (last && last.sender === "ai") {
                    next[next.length - 1] = {
                      ...last,
                      text,
                    };
                  }

                  return next;
                });
              },
            }
          : undefined
      );
      setSelectedAttachment(null);

      triggerConversationRefresh();

      const reply =
        data.reply ||
        "No response from Zuri.";

      let audioUrl:
        | string
        | undefined =
        data.audioUrl ||
        undefined;

      const musicTaskId:
        | string
        | undefined =
        data.musicTaskId ||
        undefined;

      let finalReply = reply;

      if (
        musicTaskId &&
        !audioUrl
      ) {
        setGenerationType(
          "music"
        );

        finalReply =
          reply ||
          "I'm creating your music now...";

        console.log(
          "🎵 Suno task received:",
          musicTaskId
        );

        const generatedAudioUrl =
          await waitForMusic(
            musicTaskId
          );

        setGenerationType(null);

        if (generatedAudioUrl) {
          audioUrl =
            generatedAudioUrl;

          finalReply =
            reply ||
            "Your music is ready.";

          console.log(
            "🎵 FINAL AUDIO URL FOR CHAT:",
            audioUrl
          );
        } else {
          finalReply =
            reply ||
            "I couldn't finish generating the music.";
        }
      }

      if (useStreaming) {
      setMessages((prev) => prev.slice(0, -1));
    }

    setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: finalReply,
          videoUrl:
            data.videoUrl ||
            undefined,
          imageUrl:
            data.imageUrl ||
            undefined,
          audioUrl:
            audioUrl ||
            undefined,
          pdfUrl:
            data.pdfUrl ||
            undefined,
          pdfName:
            data.pdfName ||
            undefined,
          researchImages:
            Array.isArray(
              data.researchImages
            )
              ? data.researchImages
              : [],
          researchVideos:
            Array.isArray(data.researchVideos)
              ? data.researchVideos
              : [],
          sources:
            Array.isArray(data.sources)
              ? data.sources
              : [],
        },
      ]);

      if (conversationId) {
        const savedId = await saveMessage(
          conversationId,
          "ai",
          finalReply,
          data.imageUrl || undefined,
          Array.isArray(
            data.researchImages
          )
            ? data.researchImages
            : [],
          Array.isArray(data.sources)
            ? data.sources
            : [],
          data.videoUrl || undefined,
          audioUrl || data.audioUrl || undefined,
          data.pdfUrl || undefined,
          data.pdfName || undefined,
          Array.isArray(data.researchVideos)
            ? data.researchVideos
            : []
        );
        if (savedId) {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.sender === "ai") {
              next[next.length - 1] = { ...last, id: savedId };
            }
            return next;
          });
        }
      }

      if (shouldSpeak) {
        await speakZuriReply(
          reply
        );
      }

    } catch (error) {
      console.error(
        "❌ Zuri sendMessage error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            error instanceof Error
              ? error.message
              : "Unable to reach Zuri.",
        },
      ]);
    } finally {
      setLoading(false);
      setMediaGenerationType(
        null
      );
      setIsVoiceMode(false);
    }
  }

  const handleComposerFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd(
        {
          animated: true,
        }
      );
    }, 250);
  };

  return (
    <View style={styles.appContainer}>
      {isDesktop && <Sidebar />}

      <View style={styles.root}>
        <TopHeader
          onMenuPress={
            isMobile
              ? () =>
                  setShowMobileHistory(
                    true
                  )
              : undefined
          }
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          showsVerticalScrollIndicator={
            !isMobile
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios"
              ? "interactive"
              : "none"
          }
          onContentSizeChange={() => {
            if (messages.length > 0) {
              scrollViewRef.current?.scrollToEnd(
                {
                  animated: true,
                }
              );
            }
          }}
          contentContainerStyle={[
            styles.chatContent,
            isMobile &&
              styles.mobileChatContent,
          ]}
        >
{messages.length === 0 && (
  <View style={styles.emptyZuri}>
    <Image
      source={ZuriLogo}
      style={[
        styles.emptyZuriLogo,
        isMobile && styles.mobileEmptyZuriLogo,
        isSmallPhone && styles.smallPhoneEmptyZuriLogo,
      ]}
      resizeMode="contain"
    />
  </View>
)}

          {messages.map(
            (message, index) => (
              <MessageBubble
                key={index}
                sender={message.sender}
                text={message.text}
                messageId={message.id}
                conversationId={currentConversationId ?? undefined}
                imageKind={message.imageType === "comic" ? "comic" : "image"}
                imageUrl={
                  message.imageUrl
                }
                videoUrl={
                  message.videoUrl
                }
                audioUrl={
                  message.audioUrl
                }
                pdfUrl={
                  message.pdfUrl
                }
                pdfName={
                  message.pdfName
                }
                researchImages={
                  message.researchImages ||
                  []
                }
                researchVideos={
                  message.researchVideos ||
                  []
                }
                sources={
                  message.sources ||
                  []
                }
                attachment={message.attachment} />


            )
          )}

          {loading && (
            <View
              style={styles.loadingBox}
            >
              <ActivityIndicator
                size="large"
                color="#553504"
              />

              <View
                style={
                  styles.loadingTextContainer
                }
              >
                <Text
                  style={
                    styles.loadingText
                  }
                >
                  {mediaGenerationType ===
                  "video"
                    ? "🎬 Zuri is generating your video..."
                    : mediaGenerationType ===
                      "image"
                    ? "🎨 Zuri is creating your image..."
                    : mediaGenerationType ===
                      "music"
                    ? "🎵 Zuri is creating your music..."
                    : "Zuri is thinking..."}
                </Text>

                {mediaGenerationType && (
                  <Text
                    style={
                      styles.mediaWaitingText
                    }
                  >
                    This may take a little
                    while. Please wait...
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* ==========================
            MOBILE / DESKTOP COMPOSER
        ========================== */}

        <KeyboardAvoidingView
          style={styles.composerKeyboard}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          <Text
            style={[
              styles.disclaimer,
              isMobile &&
                styles.mobileDisclaimer,
            ]}
          >
            Zuri can make mistakes. Check
            important information.
          </Text>

          {generationType && (
            <GenerationProgressCard type={generationType} />
          )}

          {selectedAttachment && (
            <View
              style={[
                styles.attachmentPreview,
                isMobile && styles.mobileAttachmentPreview,
              ]}
            >
              {selectedAttachment.mimeType?.startsWith("image/") ? (
                <Image
                  source={{ uri: selectedAttachment.uri }}
                  style={styles.attachmentThumbnail}
                />
              ) : (
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color="#00D9E8"
                />
              )}
              <View style={styles.attachmentDetails}>
                <Text
                  style={styles.attachmentName}
                  numberOfLines={1}
                >
                  {selectedAttachment.name}
                </Text>
                <Text style={styles.attachmentSize}>
                  {typeof selectedAttachment.size === "number"
                    ? selectedAttachment.size >= 1024 * 1024
                      ? `${(selectedAttachment.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${Math.max(1, Math.round(selectedAttachment.size / 1024))} KB`
                    : "Ready to attach"}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="Remove attachment"
                onPress={() => setSelectedAttachment(null)}
                style={styles.removeAttachmentButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#E5E7EB" />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              styles.inputContainer,
              isMobile &&
                styles.mobileInputContainer,
              isSmallPhone &&
                styles.smallPhoneInputContainer,
            ]}
          >
            <TouchableOpacity
              accessibilityLabel="Add image or PDF attachment"
              style={[
                styles.attachButton,
                isMobile && styles.mobileAttachButton,
              ]}
              onPress={chooseChatAttachment}
              disabled={loading || isPickingAttachment}
              activeOpacity={0.75}
            >
              {isPickingAttachment ? (
                <ActivityIndicator size="small" color="#00D9E8" />
              ) : (
                <Ionicons
                  name="attach"
                  size={isSmallPhone ? 20 : 23}
                  color={loading ? "#526267" : "#00D9E8"}
                />
              )}
            </TouchableOpacity>

            {/* TEXT INPUT */}
          <TextInput
  ref={inputRef}
  value={input}
              onChangeText={setInput}
              placeholder="Ask Zuri anything..."
              placeholderTextColor="#64748B"
              style={[
                styles.input,
                isMobile &&
                  styles.mobileInput,
                isSmallPhone &&
                  styles.smallPhoneInput,
              ]}
              multiline
              textAlignVertical="center"
              autoCapitalize="sentences"
              autoCorrect={true}
              onFocus={
                handleComposerFocus
              }
              onSubmitEditing={() => {
                if (
                  Platform.OS !== "ios"
                ) {
                  sendMessage();
                }
              }}
              returnKeyType={
                Platform.OS === "ios"
                  ? "default"
                  : "send"
              }
              blurOnSubmit={false}
            />

            {/* SEND / MICROPHONE */}
            {input.trim().length > 0 || selectedAttachment ? (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isMobile &&
                    styles.mobileSendButton,
                  isSmallPhone &&
                    styles.smallPhoneActionButton,
                ]}
                onPress={() =>
                  loading ? stopGeneration() : sendMessage()
                }
                activeOpacity={0.8}
                hitSlop={{
                  top: 4,
                  bottom: 4,
                  left: 4,
                  right: 4,
                }}
              >
              <Ionicons
  name="arrow-up"
  size={isSmallPhone ? 19 : isMobile ? 21 : 25}
  color="#071014"
/>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isMobile &&
                    styles.mobileMicButton,
                  isSmallPhone &&
                    styles.smallPhoneActionButton,
                  isRecording &&
                    styles.micButtonRecording,
                ]}
                onPress={
                  toggleRecording
                }
                activeOpacity={0.8}
                hitSlop={{
                  top: 4,
                  bottom: 4,
                  left: 4,
                  right: 4,
                }}
              >
                <View
                  style={
                    styles.voiceIcon
                  }
                >
                  <View
                    style={[
                      styles.voiceLine,
                      styles.voiceLineShort,
                    ]}
                  />

                  <View
                    style={[
                      styles.voiceLine,
                      styles.voiceLineTall,
                    ]}
                  />

                  <View
                    style={[
                      styles.voiceLine,
                      styles.voiceLineMedium,
                    ]}
                  />

                  <View
                    style={[
                      styles.voiceLine,
                      styles.voiceLineTall,
                    ]}
                  />

                  <View
                    style={[
                      styles.voiceLine,
                      styles.voiceLineShort,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* VOICE SETTINGS */}
            <View
              style={[
                styles.voiceSettingsWrapper,
                isMobile &&
                  styles.mobileVoiceSettingsWrapper,
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.voiceSettingsButton,
                  isMobile &&
                    styles.mobileVoiceSettingsButton,
                ]}
                onPress={() =>
                  setShowVoiceOptions(
                    !showVoiceOptions
                  )
                }
                activeOpacity={0.7}
              >
                <Text
                  style={
                    styles.voiceSettingsIcon
                  }
                >
                  ⌄
                </Text>
              </TouchableOpacity>

              {showVoiceOptions && (
                <View
                  style={
                    styles.voiceOptions
                  }
                >
                  <TouchableOpacity
                    style={[
                      styles.voiceOption,
                      voiceGender ===
                        "female" &&
                        styles.voiceOptionActive,
                    ]}
                    onPress={() => {
                      setVoiceGender(
                        "female"
                      );

                      setShowVoiceOptions(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.voiceOptionText
                      }
                    >
                      Feminine voice
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.voiceOption,
                      voiceGender ===
                        "male" &&
                        styles.voiceOptionActive,
                    ]}
                    onPress={() => {
                      setVoiceGender(
                        "male"
                      );

                      setShowVoiceOptions(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.voiceOptionText
                      }
                    >
                      Masculine voice
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
      {isDesktop && <RightPanel />}

      {/* ==========================
          MOBILE ZURI V1 PANEL
      ========================== */}

      {isMobile &&
        showMobileHistory && (
          <View
            style={styles.mobileHistoryOverlay}
          >
            {/* BACKDROP */}
            <TouchableOpacity
              style={
                styles.mobileHistoryBackdrop
              }
              activeOpacity={1}
              onPress={() =>
                setShowMobileHistory(false)
              }
            />

            {/* ZURI PANEL */}
            <View
              style={[
                styles.mobileHistoryPanel,
                isSmallPhone &&
                  styles.smallPhoneHistoryPanel,
              ]}
            >
              {/* HEADER */}
              <View
                style={
                  styles.mobileHistoryHeader
                }
              >
                <Text
                  style={
                    styles.mobileHistoryTitle
                  }
                >
                  ZURI
                </Text>

                <TouchableOpacity
                  style={
                    styles.mobileHistoryClose
                  }
                  onPress={() =>
                    setShowMobileHistory(false)
                  }
                  activeOpacity={0.75}
                  hitSlop={{
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8,
                  }}
                >
                  <Text
                    style={
                      styles.mobileHistoryCloseText
                    }
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CONTENT */}
              <ScrollView
                style={
                  styles.mobileHistoryContent
                }
                contentContainerStyle={
                  styles.zuriPanelContent
                }
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.zuriPanelBadge
                  }
                >
                  <Text
                    style={
                      styles.zuriPanelBadgeText
                    }
                  >
                    POWERED BY KYNX
                  </Text>
                </View>

                <Text
                  style={
                    styles.zuriPanelHeadline
                  }
                >
                  AFRICA IS BUILDING.
                </Text>

                <Text
                  style={styles.zuriPanelText}
                >
                  We are not waiting for the
                  future to arrive.
                </Text>

                <Text
                  style={styles.zuriPanelText}
                >
                  We are building it — one idea,
                  one creator, one line of code at
                  a time.
                </Text>

                <View
                  style={
                    styles.zuriPanelDivider
                  }
                />

                <Text
                  style={
                    styles.zuriPanelSubheadline
                  }
                >
                  Zuri is only the beginning.
                </Text>

                <Text
                  style={styles.zuriPanelText}
                >
                  A smarter, deeper and more
                  powerful Zuri is coming.
                </Text>

                <View
                  style={styles.zuriV2Card}
                >
                  <Text
                    style={styles.zuriV2Small}
                  >
                    SOMETHING BIG IS COMING
                  </Text>

                  <Text
                    style={styles.zuriV2Title}
                  >
                    WATCH OUT FOR
                  </Text>

                  <Text
                    style={styles.zuriV2Logo}
                  >
                    ZURI V2
                  </Text>

                  <Text
                    style={
                      styles.zuriV2Description
                    }
                  >
                    The next chapter of
                    African-built intelligence.
                  </Text>
                </View>

                <View
                  style={styles.zuriPanelQuote}
                >
                  <Text
                    style={
                      styles.zuriPanelQuoteText
                    }
                  >
                    “The future isn't somewhere
                    else.”
                  </Text>

                  <Text
                    style={
                      styles.zuriPanelQuoteAccent
                    }
                  >
                    IT'S BEING BUILT HERE.
                  </Text>
                </View>

                <Text
                  style={styles.zuriPanelFooter}
                >
                  KINX • INTELLIGENCE FOR THE FUTURE
                </Text>
              </ScrollView>
            </View>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ==========================
     APP
  ========================== */

  appContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#080B0E",
  },

  root: {
    flex: 1,
    height: "100%",
    minHeight: 0,
    backgroundColor: "#080B0E",
    paddingHorizontal: 12,
  },

  /* ==========================
     CHAT
  ========================== */

  chatArea: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 20,
  },

  chatContent: {
    paddingTop: 10,
    paddingBottom: 150,
  },

  mobileChatContent: {
    paddingTop: 6,
    paddingBottom: 90,
    paddingHorizontal: 2,
  },

  smallPhoneChatContent: {
    paddingBottom: 85,
  },

  /* ==========================
     GENERATION STATUS
  ========================== */

  generationStatus: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#22343F",
  },

  generationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  generationIcon: {
    fontSize: 22,
    marginRight: 10,
  },

  generationTextContainer: {
    flex: 1,
  },

  generationTitle: {
    color: "#F5F5F0",
    fontSize: 14,
    fontWeight: "700",
  },

  generationDescription: {
    color: "#A7B3BA",
    fontSize: 12,
    marginTop: 3,
  },

  generationProgressTrack: {
    height: 4,
    marginTop: 12,
    borderRadius: 4,
    backgroundColor: "#22343F",
    overflow: "hidden",
  },

  generationProgress: {
    width: "65%",
    height: "100%",
    backgroundColor: "#F5F5F0",
    borderRadius: 4,
  },

  /* ==========================
     LOADING
  ========================== */

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },

  loadingTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  loadingText: {
    color: "#00D9E8",
    fontSize: 14,
    fontWeight: "600",
  },

  mediaWaitingText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
  },

  /* ==========================
     KEYBOARD / COMPOSER
  ========================== */

  composerKeyboard: {
    width: "100%",
    backgroundColor: "#080B0E",
  },

  disclaimer: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 5,
    paddingHorizontal: 10,
  },

  mobileDisclaimer: {
    fontSize: 9,
    marginTop: 3,
    marginBottom: 3,
  },

  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: 420,
    minWidth: 190,
    marginHorizontal: 30,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#22343F",
  },

  mobileAttachmentPreview: {
    maxWidth: "90%",
    marginHorizontal: 8,
  },

  attachmentThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 7,
    resizeMode: "cover",
  },

  attachmentDetails: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  attachmentName: {
    color: "#F3F4EF",
    fontSize: 12,
    fontWeight: "600",
  },

  attachmentSize: {
    color: "#94A3A8",
    fontSize: 10,
    marginTop: 3,
  },

  removeAttachmentButton: {
    width: 28,
    height: 28,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#080B0E",
    borderTopWidth: 1,
    borderTopColor: "#22343F",
  },

  mobileInputContainer: {
    paddingHorizontal: 7,
    paddingTop: 5,
    paddingBottom: 14,
    minHeight: 58,
  },

  smallPhoneInputContainer: {
    paddingHorizontal: 5,
    paddingTop: 6,
    paddingBottom: 6,
  },

  attachButton: {
    width: 42,
    height: 42,
    marginRight: 8,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#22343F",
  },

  mobileAttachButton: {
    width: 36,
    height: 36,
    marginRight: 5,
    borderRadius: 18,
  },

  smallPhoneActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  /* ==========================
     INPUT
  ========================== */

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    maxHeight: 130,
    backgroundColor: "#151F25",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#22343F",
    color: "#F3F4EF",
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    outlineStyle: "none",
  } as any,

  mobileInput: {
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
  },

  smallPhoneInput: {
    minHeight: 42,
    maxHeight: 100,
    borderRadius: 21,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13.5,
  },

  /* ==========================
     SEND
  ========================== */

  sendButton: {
    width: 52,
    height: 52,
    minWidth: 44,
    minHeight: 44,
    flexShrink: 0,
    marginLeft: 10,
    backgroundColor: "#FFC928",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#FFE477",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
 mobileSendButton: {
  width: 42,
  height: 42,
  minWidth: 42,
  minHeight: 42,
  borderRadius: 21,
  marginLeft: 5,
  flexShrink: 0,
},
smallPhoneSendButton: {
  width: 40,
  height: 40,
  minWidth: 40,
  minHeight: 40,
  borderRadius: 20,
  marginLeft: 4,
  flexShrink: 0,
  justifyContent: "center",
  alignItems: "center",
},

  sendText: {
    color: "#071014",
    fontSize: 24,
    fontWeight: "900",
  },

  mobileSendText: {
    fontSize: 21,
  },

  /* ==========================
     MICROPHONE
  ========================== */

  micButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#22343F",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginRight: 10,
  },

  mobileMicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 3,
  },

  micButtonRecording: {
    borderColor: "#38BDF8",
    borderWidth: 2,
    transform: [{ scale: 1.06 }],
  },

  voiceIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  voiceLine: {
    width: 3,
    borderRadius: 4,
    backgroundColor: "#38BDF8",
  },

  voiceLineShort: {
    height: 8,
  },

  voiceLineMedium: {
    height: 15,
  },

  voiceLineTall: {
    height: 22,
  },

  /* ==========================
     VOICE SETTINGS
  ========================== */

  voiceSettingsWrapper: {
    position: "relative",
    marginRight: 10,
    zIndex: 100,
  },

  mobileVoiceSettingsWrapper: {
    marginRight: 0,
  },

  voiceSettingsButton: {
    width: 32,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  mobileVoiceSettingsButton: {
    width: 22,
    height: 40,
  },

  voiceSettingsIcon: {
    color: "#38BDF8",
    fontSize: 22,
    fontWeight: "700",
  },

  voiceOptions: {
    position: "absolute",
    bottom: 58,
    right: 0,
    width: 180,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#22343F",
    borderRadius: 16,
    padding: 8,
    zIndex: 1000,
  },

  voiceOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },

  voiceOptionActive: {
    backgroundColor: "#172554",
  },

  voiceOptionText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
  },

  /* ==========================
     MOBILE HISTORY
  ========================== */

  mobileHistoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5000,
    elevation: 50,
    flexDirection: "row",
  },

  mobileHistoryBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
  },

  mobileHistoryPanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 310,
    maxWidth: "84%",
    backgroundColor: "#080B0E",
    borderRightWidth: 1,
    borderRightColor: "#1B3036",
    shadowColor: "#000000",
    shadowOffset: {
      width: 8,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 30,
    overflow: "hidden",
  },

  smallPhoneHistoryPanel: {
    width: 285,
    maxWidth: "82%",
  },

  mobileHistoryHeader: {
    height: 66,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#182A30",
    backgroundColor: "#080B0E",
  },
emptyZuri: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 300,
},

emptyZuriLogo: {
  width: 800,
  height: 750,
},

mobileEmptyZuriLogo: {
  width: 230,
  height: 215,
},

smallPhoneEmptyZuriLogo: {
  width: 195,
  height: 185,
},

  mobileHistoryTitle: {
    color: "#F5F3EC",
    fontSize: 18,
    fontWeight: "800",
  },

  mobileHistoryClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D1D22",
    borderWidth: 1,
    borderColor: "#1B3036",
  },

  mobileHistoryCloseText: {
    color: "#B8C6C8",
    fontSize: 25,
    fontWeight: "300",
    lineHeight: 27,
  },

  mobileHistoryContent: {
    flex: 1,
    overflow: "hidden",
  },
    zuriPanelContent: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 40,
  },

  zuriPanelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#10252A",
    borderWidth: 1,
    borderColor: "#1B444B",
    marginBottom: 22,
  },

  zuriPanelBadgeText: {
    color: "#00D9E8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  zuriPanelHeadline: {
    color: "#F5F3EC",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 18,
  },

  zuriPanelText: {
    color: "#AAB9BC",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 13,
  },

  zuriPanelDivider: {
    height: 1,
    backgroundColor: "#193239",
    marginVertical: 18,
  },

  zuriPanelSubheadline: {
    color: "#F5F5F0",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginBottom: 8,
  },

  zuriV2Card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#0D2025",
    borderWidth: 1,
    borderColor: "#1A3B42",
  },

  zuriV2Small: {
    color: "#00D9E8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  zuriV2Title: {
    color: "#9BAAAD",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  zuriV2Logo: {
    color: "#F5F3EC",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 2,
  },

  zuriV2Description: {
    color: "#829497",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  zuriPanelQuote: {
    marginTop: 28,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: "#00D9E8",
  },

  zuriPanelQuoteText: {
    color: "#DCE7E8",
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },

  zuriPanelQuoteAccent: {
    color: "#00D9E8",
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 4,
  },

  zuriPanelFooter: {
    color: "#4F666A",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    textAlign: "center",
    marginTop: 35,
  },
});
