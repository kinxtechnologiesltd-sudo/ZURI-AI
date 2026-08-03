
import {
    AudioModule,
    RecordingPresets,
    useAudioRecorder,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import MessageBubble from "../components/chat/MessageBubble";
import Hero from "../components/home-v2/Hero";
import RightPanel from "../components/layout/RightPanel";
import Sidebar from "../components/layout/Sidebar";
import TopHeader from "../components/layout/TopHeader";
import { useConversation } from "../context/ConversationContext";
import { usePreferences } from "../context/PreferencesContext";
import { getMemories } from "../hooks/memoryService";

import {
    loadMessages,
    saveMessage,
} from "../hooks/chatService";
import {
    createConversation,
    updateConversationTitle,
} from "../hooks/conversationService";
import { uploadGeneratedImage } from "../hooks/imageStorageService";
import useUserPlan from "../hooks/useUserPlan";
type Message = {
  text: string;
  sender: "user" | "ai";
  imageUrl?: string;
};

export default function Chat() {
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
const [showVoiceOptions, setShowVoiceOptions] = useState(false);
const { isProUser } = useUserPlan();

console.log("Zuri Pro status:", isProUser);
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
        "http://localhost:3001/transcribe",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await transcriptionResponse.json();

      if (!transcriptionResponse.ok) {
        throw new Error(
          data.error || "Voice transcription failed."
        );
      }

      console.log("Transcription result:", data);
if (data.text) {
  const transcribedText = data.text.trim();

  setInput(transcribedText);

 if (transcribedText) {
  setIsVoiceMode(true);
  await sendMessage(transcribedText, true);
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
};
const speakBrowserVoice = (text: string) => {
  if (typeof window === "undefined") return;

  if (!("speechSynthesis" in window)) {
    console.log("Browser speech is not supported.");
    return;
  }

  window.speechSynthesis.cancel();

  let speechText = text;

// Pronunciation fixes
speechText = speechText
  .replace(/\bKINX\b/g, "Kings")
  .replace(/\bKinx\b/g, "Kings");

const speech = new SpeechSynthesisUtterance(speechText);
  const voices = window.speechSynthesis.getVoices();
  
  console.log(
  "POSSIBLE FEMALE AFRICAN VOICES:",
  voices
    .filter((voice) =>
      ["en-NG", "en-GH", "en-KE", "en-ZA"].includes(
        voice.lang
      )
    )
    .map((voice) => ({
      name: voice.name,
      lang: voice.lang,
    }))
);

  let selectedVoice;

  if (voiceGender === "female") {
    selectedVoice =
      // Clearly feminine Nigerian voice, if available
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === "en-ng" &&
          /female|ezinne|nneka|ada/i.test(voice.name)
      ) ||

      // Feminine African English voice
      voices.find(
        (voice) =>
          ["en-ng", "en-gh", "en-ke", "en-za"].includes(
            voice.lang.toLowerCase()
          ) &&
          /female|woman/i.test(voice.name)
      ) ||

      // Known feminine English voices
      voices.find((voice) =>
        /aria|zira|samantha|jenny|susan|hazel|libby|sonia/i.test(
          voice.name
        )
      ) ||

      // Any English female-labelled voice
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en") &&
          /female|woman/i.test(voice.name)
      );

// Confident, polished broadcast-style delivery
speech.rate = 0.9;
speech.pitch = 1.0;
  } else {
    selectedVoice =
      // Clearly masculine Nigerian voice, if available
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === "en-ng" &&
          /male|abeo|chinedu|tunde/i.test(voice.name)
      ) ||

      // Masculine African English voice
      voices.find(
        (voice) =>
          ["en-ng", "en-gh", "en-ke", "en-za"].includes(
            voice.lang.toLowerCase()
          ) &&
          /male|man/i.test(voice.name)
      ) ||

      // Known masculine English voices
      voices.find((voice) =>
        /guy|david|mark|george|ryan|daniel|james/i.test(
          voice.name
        )
      ) ||

      // Any English male-labelled voice
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en") &&
          /male|man/i.test(voice.name)
      );

// Confident, polished broadcast-style delivery
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
  // FREE USERS
  if (!isProUser) {
    speakBrowserVoice(text);
    return;
  }

  // PRO USERS
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
  "http://127.0.0.1:3001/chat",
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

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  } catch (error) {
    console.error(
      "Zuri Pro voice error:",
      error
    );

    // Automatic fallback
    speakBrowserVoice(text);
  }
};
 
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

const isDesktop = width >= 1024;

  const [messages, setMessages] = useState<Message[]>([]);
 useEffect(() => {
  console.log(
    "Chat currentConversationId changed:",
    currentConversationId
  );

  const fetchMessages = async () => {
   if (!currentConversationId) {
  setMessages([
    {
      sender: "ai",
      text: "Start a new conversation with Zuri.",
    },
  ]);
  return;
}
const data = await loadMessages(currentConversationId);

console.log("=================================");
console.log("Loaded Messages:", data);
console.log("Message Count:", data.length);
console.log("=================================");

if (data.length > 0) {
const formattedMessages = data.map((message: Message) => ({
  sender: message.sender,
  text: message.text,
  imageUrl: message.imageUrl,
}));

console.log("Formatted Messages:", formattedMessages);

console.log("Before setMessages:", messages);

setMessages(formattedMessages);

setTimeout(() => {
  console.log("After setMessages (next tick):", formattedMessages);
}, 0);
console.log("Messages state will become:", formattedMessages);
} else {
console.log("========== USE EFFECT ==========");
console.log("Current Conversation ID:", currentConversationId);
console.log("================================");

  setMessages([
    {
      sender: "ai",
      text: "Start chatting with Zuri...",
    },
  ]);
}

  };

fetchMessages();
}, [currentConversationId]);
  
const callAthena = async (message: string) => {
  // Create the request form
  const formData = new FormData();

  // Send the actual user's message
  formData.append(
    "message",
    message
  );
formData.append(
  "history",
  JSON.stringify(
    messages.slice(-20).map((msg) => ({
      sender: msg.sender,
      text: msg.text,
    }))
  )
);
  // Load the logged-in user's saved memories
  const savedMemories = await getMemories();

  console.log(
    "🧠 Memories being sent to backend:",
    savedMemories
  );

  // Send the user's personalization preferences
  formData.append(
    "preferences",
    JSON.stringify({
      preferredName,
      responseStyle,
      responseLength,
    })
  );

  // Send the user's saved memories
  formData.append(
    "memories",
    JSON.stringify(
      savedMemories.map(
        (memory) => memory.content
      )
    )
  );

  // Attach an image or PDF if the user selected one
  if (selectedFile) {
    const fileResponse = await fetch(
      selectedFile.uri
    );

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

  // Send the request to the backend
  const response = await fetch(
    "http://localhost:3001/chat",
    {
      method: "POST",
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

  return data.reply;
};
const generateImage = async (prompt: string) => {
  const response = await fetch(
    "http://localhost:3001/generate-image",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Image generation error:", data);

    throw new Error(
      data.details ||
        data.error ||
        "Image generation failed."
    );
  }

  return data;
};
const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
setSelectedFile(file);
      console.log("Selected file:", file.name);
      console.log("File URI:", file.uri);
    }
  } catch (error) {
    console.error("Error selecting file:", error);
  }
};
 async function sendMessage(
  voiceText?: string,
  shouldSpeak = false
) {
  const prompt = voiceText || input;

  if (!prompt.trim()) return;
    console.log("Conversation ID:", currentConversationId);
console.log("Prompt:", prompt);

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: prompt,
      },
    ]);
 console.log(
  "Current Conversation:",
  currentConversationId
);

// Use the current conversation if one already exists
let conversationId = currentConversationId;

// If the user starts chatting without clicking New Chat,
// automatically create a conversation first
if (!conversationId) {
  conversationId = await createConversation();

  if (conversationId) {
    setCurrentConversationId(conversationId);
  }
}

// Save the user's message to the conversation
if (conversationId) {
  await saveMessage(
    conversationId,
    "user",
    prompt
  );

  await updateConversationTitle(
    conversationId,
    prompt.length > 40
      ? prompt.substring(0, 40) + "..."
      : prompt
  );

  // Immediately refresh the conversation sidebar
  triggerConversationRefresh();
}

setLoading(true);

    try {
  const wantsImage =
    !selectedFile &&
    /\b(generate|create|make|draw)\b.*\b(image|picture|photo|artwork|illustration)\b/i.test(
      prompt
    );

  if (wantsImage) {
  const result = await generateImage(prompt);

  // Upload the generated image to Firebase Storage
  const permanentImageUrl =
  await uploadGeneratedImage(result.imageUrl);
  const replyText =
    result.text ||
    "Here's the image I generated for you.";

  // Display the permanent image in Zuri
  setMessages((prev) => [
    ...prev,
    {
      sender: "ai",
      text: replyText,
      imageUrl: permanentImageUrl,
    },
  ]);

  // Save both the message and image URL to Firestore
  if (conversationId) {
  await saveMessage(
    conversationId,
    "ai",
    replyText,
    permanentImageUrl
  );
}

  setSelectedFile(null);
  setLoading(false);
  return;
}

  const reply = await callAthena(prompt);
  setSelectedFile(null);
setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
        },
      ]);
  if (conversationId) {
  await saveMessage(
    conversationId,
    "ai",
    reply
  );
}

// Only speak when the message came from Voice Mode
if (shouldSpeak) {
  await speakZuriReply(reply);
}
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Unable to reach Zuri.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
  <View style={styles.appContainer}>
  {isDesktop && <Sidebar />}

 <View style={styles.root}>
  <TopHeader />

  
 <ScrollView
  ref={scrollViewRef}
  style={styles.chatArea}
  showsVerticalScrollIndicator={true}
  onContentSizeChange={() => {
    if (messages.length > 1) {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }
  }}
  contentContainerStyle={{
    paddingBottom: 150,
    paddingTop: 10,
  }}
>
  {messages.length <= 1 && <Hero />}

 {messages.length > 1 &&
  messages.map((message, index) => (
    <MessageBubble
  key={index}
  sender={message.sender}
  text={message.text}
  imageUrl={message.imageUrl}
/>
    ))
}

  {loading && (
    <View style={styles.loadingBox}>
      <ActivityIndicator
        size="large"
        color="#553504"
      />

      <Text style={styles.loadingText}>
        Zuri is thinking...
      </Text>
    </View>
  )}
</ScrollView>

{selectedFile && (
  <View style={styles.filePreview}>
    <View style={styles.fileInfo}>
      <Text style={styles.fileIcon}>
        {selectedFile.mimeType?.startsWith("image/")
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
      onPress={() => setSelectedFile(null)}
      style={styles.removeFileButton}
    >
      <Text style={styles.removeFileText}>×</Text>
    </TouchableOpacity>
  </View>
)}
      <View style={styles.inputContainer}>
        <TouchableOpacity
  style={styles.attachButton}
  onPress={pickDocument}
>
  <Text style={styles.attachText}>+</Text>
</TouchableOpacity>
       <TextInput
  value={input}
  onChangeText={setInput}
  placeholder="Ask Zuri anything..."
  placeholderTextColor="#64748B"
  style={styles.input}
 onSubmitEditing={() => sendMessage()}
  returnKeyType="send"
  blurOnSubmit={false}
/>
<TouchableOpacity
  style={styles.sendButton}
 onPress={() => sendMessage()}
>
  <Text style={styles.sendText}>↑</Text>
</TouchableOpacity>

        <TouchableOpacity
  style={[
    styles.micButton,
    isRecording && styles.micButtonRecording,
  ]}
  onPress={toggleRecording}
>
  <View style={styles.voiceIcon}>
    <View style={[styles.voiceLine, styles.voiceLineShort]} />
    <View style={[styles.voiceLine, styles.voiceLineTall]} />
    <View style={[styles.voiceLine, styles.voiceLineMedium]} />
    <View style={[styles.voiceLine, styles.voiceLineTall]} />
    <View style={[styles.voiceLine, styles.voiceLineShort]} />
  </View>
</TouchableOpacity>
<View style={styles.voiceSettingsWrapper}>
  <TouchableOpacity
    style={styles.voiceSettingsButton}
    onPress={() => setShowVoiceOptions(!showVoiceOptions)}
  >
    <Text style={styles.voiceSettingsIcon}>⌄</Text>
  </TouchableOpacity>

  {showVoiceOptions && (
    <View style={styles.voiceOptions}>
      <TouchableOpacity
        style={[
          styles.voiceOption,
          voiceGender === "female" && styles.voiceOptionActive,
        ]}
        onPress={() => {
          setVoiceGender("female");
          setShowVoiceOptions(false);
        }}
      >
        <Text style={styles.voiceOptionText}>
          Feminine voice
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.voiceOption,
          voiceGender === "male" && styles.voiceOptionActive,
        ]}
        onPress={() => {
          setVoiceGender("male");
          setShowVoiceOptions(false);
        }}
      >
        <Text style={styles.voiceOptionText}>
          Masculine voice
        </Text>
      </TouchableOpacity>
    </View>
  )}
</View>
      </View>

   </View>

{isDesktop && <RightPanel />}

</View>
);
}

const styles = StyleSheet.create({
  voiceSettingsWrapper: {
  position: "relative",
  marginRight: 10,
  zIndex: 100,
},

voiceSettingsButton: {
  width: 32,
  height: 48,
  justifyContent: "center",
  alignItems: "center",
},

voiceSettingsIcon: {
  color: "#38BDF8",
  fontSize: 22,
  fontWeight: "700",
},

voiceOptions: {
  position: "absolute",
  bottom: 58,
  left: 0,
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
  micButtonRecording: {
  borderColor: "#38BDF8",
  borderWidth: 2,
  transform: [{ scale: 1.06 }],
},
  micButton: {
  width: 48,
  height: 48,
  borderRadius: 16,
  backgroundColor: "#111827",
  borderWidth: 1,
  borderColor: "#1E293B",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
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

header: {
  display: "none",
},

chatArea: {
  flex: 1,
  minHeight: 0,

  width: "100%",
  maxWidth: 900,

  alignSelf: "center",

  paddingHorizontal: 20,
},

messageBubble: {
  maxWidth: "80%",
  padding: 14,
  borderRadius: 18,
  marginBottom: 12,
},

userBubble: {
  alignSelf: "flex-end",
  backgroundColor: "#173A3E",
},

aiBubble: {
  alignSelf: "flex-start",

  backgroundColor: "#0C1B20",

  borderWidth: 1,
  borderColor: "#1D353A",
},

messageText: {
  fontSize: 16,
  lineHeight: 24,
},

userText: {
  color: "#FFFFFF",
},

aiText: {
  color: "#E8ECE8",
},

loadingBox: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 10,
},

loadingText: {
  color: "#19D3C5",
  marginLeft: 10,
  fontSize: 14,
  fontWeight: "600",
},

inputContainer: {
  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 30,
  paddingTop: 14,
  paddingBottom: 20,

  backgroundColor: "#081216",

  borderTopWidth: 1,
  borderTopColor: "#172B30",
},

attachButton: {
  width: 52,
  height: 52,

  borderRadius: 17,

  backgroundColor: "#0D2025",

  borderWidth: 1,
  borderColor: "#28474D",

  justifyContent: "center",
  alignItems: "center",

  marginRight: 11,
},

attachText: {
  color: "#D7AD5A",
  fontSize: 26,
  fontWeight: "400",
  lineHeight: 29,
},

input: {
  flex: 1,
  height: 58,

  backgroundColor: "#0C1B20",

  borderRadius: 19,

  borderWidth: 1,
  borderColor: "#29464C",

  color: "#F3F4EF",

  fontSize: 15,

  paddingHorizontal: 20,

  outlineStyle: "none",
} as any,

sendButton: {
  width: 52,
  height: 52,
  marginLeft: 11,
  backgroundColor: "#18BEB3",
  borderRadius: 17,
  borderWidth: 1,
  borderColor: "#4AD8CE",
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#19D3C5",
  shadowOpacity: 0.18,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  elevation: 5,
},

sendText: {
  color: "#071014",
  fontSize: 24,
  fontWeight: "900",
},
});