import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import MessageBubble from "../components/chat/MessageBubble";
import EmptyChat from "../components/EmptyChat";
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
import useUserPlan from "../hooks/useUserPlan";

const API_BASE_URL = "https://zuri-ai-v1.onrender.com";

type Message = {
  text: string;
  sender: "user" | "ai";
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  researchImages?: Array<{
    url: string;
    title?: string | null;
    sourceUrl?: string | null;
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

          <Text style={styles.generationDescription}>
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
    useState<"image" | "music" | "video" | null>(null);

  const {
    currentConversationId,
    setCurrentConversationId,
    triggerConversationRefresh,
  } = useConversation();

  const [input, setInput] = useState("");

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const [isRecording, setIsRecording] = useState(false);

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

  useEffect(() => {
    console.log("Zuri Pro status:", isProUser);
  }, [isProUser]);

  const [isVoiceMode, setIsVoiceMode] = useState(false);

  async function toggleRecording() {
    try {
      // STOP RECORDING
      if (isRecording) {
        await audioRecorder.stop();
        setIsRecording(false);

        const audioUri = audioRecorder.uri;

        if (!audioUri) {
          console.log("No recording URI found.");
          return;
        }

        console.log("Recording saved:", audioUri);

        const audioResponse = await fetch(audioUri);
        const audioBlob = await audioResponse.blob();

        console.log("audioBlob:", audioBlob);
        console.log("Blob size:", audioBlob.size);
        console.log("Blob type:", audioBlob.type);

        const formData = new FormData();

        formData.append(
          "audio",
          audioBlob,
          "zuri-voice.webm"
        );

        console.log("Sending voice to Zuri...");

        const transcriptionResponse = await fetch(
          `${API_BASE_URL}/voice/transcribe`,
          {
            method: "POST",
            body: formData,
          }
        );

        const responseText =
          await transcriptionResponse.text();

        console.log(
          "🎙️ TRANSCRIBE HTTP STATUS:",
          transcriptionResponse.status
        );

        console.log(
          "🎙️ TRANSCRIBE RAW RESPONSE:",
          responseText
        );

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

        console.log(
          "🎙️ TRANSCRIPTION RESULT:",
          data
        );

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
        alert(
          "Microphone permission is required to use Zuri Voice."
        );
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setIsRecording(true);

      console.log("Recording started");
    } catch (error) {
      console.error("Voice error:", error);
      setIsRecording(false);
    }
  }

  const speakBrowserVoice = (text: string) => {
    if (typeof window === "undefined") return;

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

    window.speechSynthesis.speak(speech);
  };

  const speakZuriReply = async (text: string) => {
    if (!isProUser) {
      speakBrowserVoice(text);
      return;
    }

    try {
      const voiceId =
        voiceGender === "female"
          ? "JMwQvjJt08OhYlPBWeyc"
          : "8P18CIVcRlwP98FOjZDm";

      console.log(
        "Generating Zuri Pro neural voice:",
        voiceGender
      );

      const response = await fetch(
        `${API_BASE_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voiceId,
          }),
        }
      );

      if (!response.ok) {
        console.log(
          "Pro voice unavailable. Using standard voice."
        );

        speakBrowserVoice(text);
        return;
      }

      const audioBlob =
        await response.blob();

      const audioUrl =
        URL.createObjectURL(audioBlob);

      const audio =
        new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error(
        "Zuri Pro voice error:",
        error
      );

      speakBrowserVoice(text);
    }
  };

  const [loading, setLoading] =
    useState(false);

  const [generationType, setGenerationType] =
    useState<
      "image" | "music" | "video" | "comic" | null
    >(null);

  const [selectedFile, setSelectedFile] =
    useState<any>(null);

  const scrollViewRef =
    useRef<ScrollView>(null);

  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;
  const isMobile = width < 600;

  const [messages, setMessages] =
    useState<Message[]>([]);

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
            sender: message.sender,
            text: message.text,
            imageUrl:
              message.imageUrl,
            videoUrl:
              message.videoUrl,
            audioUrl:
              message.audioUrl,
            researchImages:
              Array.isArray(
                message.researchImages
              )
                ? message.researchImages
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

  const callAthena = async (
    message: string
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

    console.log(
      "📨 Message going to backend:",
      JSON.stringify(cleanMessage)
    );

    const formData = new FormData();

    formData.append(
      "message",
      cleanMessage
    );

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

    if (selectedFile) {
      const fileResponse =
        await fetch(selectedFile.uri);

      const blob =
        await fileResponse.blob();

      formData.append(
        "file",
        blob,
        selectedFile.name ||
          "attachment"
      );
    }

    console.log(
      "Sending message to Zuri:",
      message
    );

    const idToken =
      await user.getIdToken();

    const response = await fetch(
      `${API_BASE_URL}/chat`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${idToken}`,
        },
        body: formData,
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      console.error(
        "Zuri backend error:",
        data
      );

      throw new Error(
        data.reply ||
          "Zuri request failed."
      );
    }

    return data;
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

  const pickDocument = async () => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync(
          {
            type: [
              "image/*",
              "application/pdf",
            ],
            multiple: false,
            copyToCacheDirectory: true,
          }
        );

      if (!result.canceled) {
        const file =
          result.assets[0];

        setSelectedFile(file);

        console.log(
          "Selected file:",
          file.name
        );

        console.log(
          "File URI:",
          file.uri
        );
      }
    } catch (error) {
      console.error(
        "Error selecting file:",
        error
      );
    }
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
    const prompt =
      voiceText || input;

    if (!prompt.trim()) return;

    console.log(
      "Conversation ID:",
      currentConversationId
    );

    console.log(
      "Prompt:",
      prompt
    );

    setInput("");
    setLoading(true);

    const lowerPrompt =
      prompt.toLowerCase();

    if (
      /\b(generate|create|make|draw)\b[\s\S]{0,80}\b(image|picture|photo|artwork|illustration)\b/i.test(
        lowerPrompt
      )
    ) {
      setMediaGenerationType(
        "image"
      );
    } else if (
      /\b(generate|create|make|compose)\b[\s\S]{0,80}\b(music|song|beat|audio)\b/i.test(
        lowerPrompt
      )
    ) {
      setMediaGenerationType(
        "music"
      );
    } else if (
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
        text: prompt,
      },
    ]);

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
            prompt
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
            prompt.length > 40
              ? prompt.substring(0, 40) +
                "..."
              : prompt
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
        !selectedFile &&
        /\b(generate|create|make|draw)\b[\s\S]{0,80}\b(image|picture|photo|artwork|illustration)\b/i.test(
          prompt
        );

      if (wantsImage) {
        console.log(
          "🎨 Zuri image generation requested."
        );

        console.log(
          "🎨 Image prompt:",
          prompt
        );

        const result =
          await generateImage(
            prompt
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
          },
        ]);

        if (conversationId) {
          await saveMessage(
            conversationId,
            "ai",
            replyText,
            permanentImageUrl
          );
        }

        triggerConversationRefresh();

        setSelectedFile(null);

        return;
      }

      console.log(
        "🚀 CALLING ZURI BACKEND NOW:",
        prompt
      );

      const data =
        await callAthena(prompt);

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
          researchImages:
            Array.isArray(
              data.researchImages
            )
              ? data.researchImages
              : [],
        },
      ]);

      if (conversationId) {
        await saveMessage(
          conversationId,
          "ai",
          finalReply,
          undefined,
          Array.isArray(
            data.researchImages
          )
            ? data.researchImages
            : []
        );
      }

      if (shouldSpeak) {
        await speakZuriReply(
          reply
        );
      }

      setSelectedFile(null);
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

  return (
    <View style={styles.appContainer}>
      {isDesktop && <Sidebar />}

      <View style={styles.root}>
        <TopHeader />

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (messages.length > 0) {
              scrollViewRef.current?.scrollToEnd({
                animated: true,
              });
            }
          }}
          contentContainerStyle={[
            styles.chatContent,
            isMobile && styles.mobileChatContent,
          ]}
        >
          {messages.length === 0 && (
            <EmptyChat
              onSelectPrompt={(prompt: string) =>
                setInput(prompt)
              }
            />
          )}

          {messages.map(
            (message, index) => (
              <MessageBubble
                key={index}
                sender={message.sender}
                text={message.text}
                imageUrl={message.imageUrl}
                videoUrl={message.videoUrl}
                audioUrl={message.audioUrl}
                researchImages={
                  message.researchImages || []
                }
              />
            )
          )}

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator
                size="large"
                color="#553504"
              />

              <View style={styles.loadingTextContainer}>
                <Text style={styles.loadingText}>
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
                    This may take a little while.
                    Please wait...
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView
          style={styles.composerKeyboard}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
          keyboardVerticalOffset={0}
        >
          <Text style={styles.disclaimer}>
            Zuri can make mistakes. Check important
            information.
          </Text>

          {selectedFile && (
            <View
              style={[
                styles.filePreview,
                isMobile &&
                  styles.mobileFilePreview,
              ]}
            >
              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>
                  {selectedFile.mimeType?.startsWith(
                    "image/"
                  )
                    ? "🖼️"
                    : "📄"}
                </Text>

                <Text
                  style={styles.fileName}
                  numberOfLines={1}
                >
                  {selectedFile.name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setSelectedFile(null)
                }
                style={styles.removeFileButton}
                activeOpacity={0.7}
              >
                <Text
                  style={styles.removeFileText}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {generationType && (
            <GenerationStatus
              type={generationType}
            />
          )}

          <View
            style={[
              styles.inputContainer,
              isMobile &&
                styles.mobileInputContainer,
            ]}
          >
            {/* ATTACH */}
            <TouchableOpacity
              style={[
                styles.attachButton,
                isMobile &&
                  styles.mobileAttachButton,
              ]}
              onPress={pickDocument}
              activeOpacity={0.75}
            >
              <Text style={styles.attachText}>
                +
              </Text>
            </TouchableOpacity>

            {/* TEXT INPUT */}
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask Zuri anything..."
              placeholderTextColor="#64748B"
              style={[
                styles.input,
                isMobile &&
                  styles.mobileInput,
              ]}
              multiline
              textAlignVertical="center"
              autoCapitalize="sentences"
              autoCorrect={true}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd(
                    {
                      animated: true,
                    }
                  );
                }, 150);
              }}
              onSubmitEditing={() => {
                if (Platform.OS !== "ios") {
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
            {input.trim().length > 0 ? (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isMobile &&
                    styles.mobileSendButton,
                ]}
                onPress={() =>
                  sendMessage()
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.sendText,
                    isMobile &&
                      styles.mobileSendText,
                  ]}
                >
                  ↑
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isMobile &&
                    styles.mobileMicButton,
                  isRecording &&
                    styles.micButtonRecording,
                ]}
                onPress={
                  toggleRecording
                }
                activeOpacity={0.8}
              >
                <View
                  style={styles.voiceIcon}
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
  },

  root: {
    flex: 1,
    height: "100%",
    minHeight: 0,
    backgroundColor: "#081216",
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
    paddingBottom: 110,
  },

  /* ==========================
     GENERATION STATUS
  ========================== */

  generationStatus: {
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#2A2A2A",
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
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  generationDescription: {
    color: "#999999",
    fontSize: 12,
    marginTop: 3,
  },

  generationProgressTrack: {
    height: 4,
    marginTop: 12,
    borderRadius: 4,
    backgroundColor: "#303030",
    overflow: "hidden",
  },

  generationProgress: {
    width: "65%",
    height: "100%",
    backgroundColor: "#FFFFFF",
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
    color: "#19D3C5",
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
    backgroundColor: "#081216",
  },

  disclaimer: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 5,
    paddingHorizontal: 10,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#081216",
    borderTopWidth: 1,
    borderTopColor: "#172B30",
  },

  mobileInputContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    minHeight: 62,
  },

  /* ==========================
     ATTACH
  ========================== */

  attachButton: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#0D2025",
    borderWidth: 1,
    borderColor: "#28474D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  mobileAttachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 6,
  },

  attachText: {
    color: "#D7AD5A",
    fontSize: 26,
    fontWeight: "400",
    lineHeight: 29,
  },

  /* ==========================
     INPUT
  ========================== */

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    maxHeight: 130,
    backgroundColor: "#0C1B20",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#29464C",
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
  },

  /* ==========================
     SEND
  ========================== */

  sendButton: {
    width: 52,
    height: 52,
    marginLeft: 10,
    backgroundColor: "#18BEB3",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#4AD8CE",
    justifyContent: "center",
    alignItems: "center",
  },

  mobileSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 6,
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
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginRight: 10,
  },

  mobileMicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 6,
    marginRight: 4,
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
    borderColor: "#1E293B",
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
     FILE PREVIEW
  ========================== */

  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0C1B20",
    borderWidth: 1,
    borderColor: "#244047",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginHorizontal: 30,
    marginBottom: 8,
  },

  mobileFilePreview: {
    marginHorizontal: 10,
    marginBottom: 6,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  fileInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  fileIcon: {
    fontSize: 19,
    marginRight: 10,
  },

  fileName: {
    flex: 1,
    color: "#E9ECE8",
    fontSize: 13,
    fontWeight: "600",
  },

  removeFileButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  removeFileText: {
    color: "#789094",
    fontSize: 22,
  },
});