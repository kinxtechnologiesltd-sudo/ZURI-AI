import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
const suggestions = [
  {
    icon: "image-outline",
    title: "Generate Image",
    prompt: "Generate a premium image of ",
  },
  {
    icon: "videocam-outline",
    title: "Create Video",
    prompt: "Create a cinematic video about ",
  },
  {
    icon: "book-open-variant",
    title: "Make Comic",
    prompt: "Create a comic story about ",
  },
  {
    icon: "music-note-outline",
    title: "Compose Music",
    prompt: "Compose a song about ",
  },
  {
    icon: "laptop",
    title: "Build Website",
    prompt: "Build a modern website for ",
  },
  {
    icon: "phone-portrait-outline",
    title: "Build App",
    prompt: "Design a mobile application for ",
  },
];
const placeholderIdeas = [
  "Design a luxury perfume advert...",
  "Generate a cinematic movie poster...",
  "Build a modern fintech website...",
  "Create an Afrobeat love song...",
  "Design a premium restaurant flyer...",
  "Generate an anime wallpaper...",
  "Create a church conference poster...",
  "Build a mobile banking app...",
];
export default function PromptComposer() {
 const [prompt, setPrompt] = useState("");
 const enhancePrompt = () => {
  if (!prompt.trim()) return;

  const enhanced = `Create a premium, highly detailed and visually stunning version of the following request:\n\n${prompt}\n\nInclude professional quality, cinematic lighting, rich details and modern design principles where applicable.`;

  setPrompt(enhanced);
};

const [placeholderIndex, setPlaceholderIndex] =
  useState(0);

  useEffect(() => {
  const interval = setInterval(() => {
    setPlaceholderIndex((current) => {
      return (
        (current + 1) %
        placeholderIdeas.length
      );
    });
  }, 3500);

  return () => clearInterval(interval);
}, []);

  const { width } = useWindowDimensions();

  const isDesktop = width >= 1000;

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.badge}>
          CREATE WITH ZURI
        </Text>

        <Text style={styles.title}>
          Ask Zuri to create anything
        </Text>

        <Text style={styles.subtitle}>
          Images, videos, music, comics,
          websites and apps —
          all from one prompt.
        </Text>

      </View>

      <View
        style={[
          styles.promptCard,
          isDesktop && styles.desktopCard,
        ]}
      >

        <View style={styles.goldGlow} />

        <View style={styles.promptHeader}>

          <MaterialCommunityIcons
            name="creation"
            size={22}
            color="#D9A441"
          />

          <Text style={styles.promptHeaderText}>
            Describe your imagination
          </Text>

        </View>

        <TextInput
          multiline
          value={prompt}
          onChangeText={setPrompt}
      placeholder={
  placeholderIdeas[placeholderIndex]
}
          placeholderTextColor="#72878A"
          style={styles.input}
        />        <View style={styles.divider} />

<View style={styles.infoRow}>
  <Text style={styles.characterCount}>
    {prompt.length} characters
  </Text>
</View>
        <View style={styles.bottomBar}>

          <View style={styles.tools}>

         <Pressable
  style={styles.toolButton}
  onPress={enhancePrompt}
>
              <Ionicons
                name="attach-outline"
                size={20}
                color="#10D7CB"
              />
              <Text style={styles.toolText}>
                Upload
              </Text>
            </Pressable>

            <Pressable style={styles.toolButton}>
              <Ionicons
                name="mic-outline"
                size={20}
                color="#10D7CB"
              />
              <Text style={styles.toolText}>
                Voice
              </Text>
            </Pressable>

            <Pressable style={styles.toolButton}>
              <Ionicons
                name="sparkles-outline"
                size={20}
                color="#D9A441"
              />
              <Text style={styles.toolText}>
                Enhance
              </Text>
            </Pressable>

          </View>

          <Pressable style={styles.createButton}>

            <MaterialCommunityIcons
              name="creation"
              size={20}
              color="#071114"
            />

            <Text style={styles.createText}>
              Create
            </Text>

          </Pressable>

        </View>

      </View>

      <View style={styles.quickSection}>

        <Text style={styles.quickTitle}>
          Start with
        </Text>

        <View style={styles.chips}>

          {suggestions.map((item) => (

            <Pressable
              key={item.title}
              style={styles.chip}
              onPress={() =>
                setPrompt(item.prompt)
              }
            >

              <Ionicons
                name={item.icon as any}
                size={18}
                color="#D9A441"
              />

              <Text style={styles.chipText}>
                {item.title}
              </Text>

            </Pressable>

          ))}

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 30,
    marginBottom: 40,
    alignSelf: "center",
    maxWidth: 1100,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  badge: {
    color: "#D9A441",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },
infoRow: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 12,
},

characterCount: {
  color: "#7E9497",
  fontSize: 13,
  fontWeight: "600",
},
  title: {
    color: "#F5F7F5",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#8DA2A6",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 620,
  },

  promptCard: {
    position: "relative",
    overflow: "hidden",

    backgroundColor: "#0B171B",

    borderRadius: 28,

    borderWidth: 1,
    borderColor: "#1B353A",

    padding: 24,
  },

  desktopCard: {
    paddingHorizontal: 34,
    paddingVertical: 30,
  },

  goldGlow: {
    position: "absolute",

    width: 240,
    height: 240,

    borderRadius: 120,

    backgroundColor: "rgba(217,164,65,0.08)",

    top: -90,
    right: -70,
  },

  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  promptHeaderText: {
    color: "#D9A441",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },

  input: {
    minHeight: 170,

    color: "#FFFFFF",

    fontSize: 17,

    lineHeight: 28,

    textAlignVertical: "top",

    paddingTop: 6,

    outlineStyle: "none",
  } as any,

  divider: {
    height: 1,
    backgroundColor: "#1B353A",
    marginVertical: 22,
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },

  tools: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  toolButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#102126",

    borderWidth: 1,
    borderColor: "#214045",

    borderRadius: 14,

    paddingHorizontal: 16,
    paddingVertical: 12,

    marginRight: 12,
    marginBottom: 10,
  },

  toolText: {
    color: "#E6ECEC",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#D9A441",

    borderRadius: 18,

    paddingHorizontal: 26,
    paddingVertical: 15,

    minWidth: 170,
  },

  createText: {
    color: "#071114",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 10,
  },

  quickSection: {
    marginTop: 34,
  },

  quickTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 18,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#102126",

    borderRadius: 999,

    borderWidth: 1,
    borderColor: "#214045",

    paddingHorizontal: 18,
    paddingVertical: 12,

    marginRight: 12,
    marginBottom: 12,
  },

  chipText: {
    color: "#F5F7F5",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 10,
  },
});