import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import AfricaBackground from "./home-v2/AfricaBackground";

const prompts = [
  {
    emoji: "🖼️",
    label: "Generate an image",
    prompt: "Generate an image of a luxurious futuristic city in Africa",
  },
  {
    emoji: "🌐",
    label: "Build a website",
    prompt: "Build a landing page for an AI creative studio",
  },
  {
    emoji: "📱",
    label: "Create an app",
    prompt: "Create a concept for a premium mobile app",
  },
  {
    emoji: "📄",
    label: "Analyze a document",
    prompt: "Analyze this document and summarize the key insights",
  },
  {
    emoji: "💡",
    label: "Brainstorm ideas",
    prompt: "Brainstorm unique product ideas for creative founders",
  },
  {
    emoji: "🎬",
    label: "Make a video",
    prompt: "Create a storyboard for a cinematic AI product launch video",
  },
];

const getGreeting = (hour: number) => {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

interface EmptyChatProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function EmptyChat({
  onSelectPrompt,
}: EmptyChatProps): React.ReactElement {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const greeting = getGreeting(new Date().getHours());

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <AfricaBackground />

      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Image
     source={require("../asset/images/zuri-icon.png (2).png")}
          resizeMode="contain"
          style={styles.logo}
        />

        <Text style={styles.greeting}>{greeting},  👋</Text>

        <Text style={styles.heading}>
          What would you like to create today?
        </Text>

        <View
          style={[
            styles.cards,
            isWide ? styles.cardsWide : styles.cardsNarrow,
          ]}
        >
          {prompts.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
                isWide && styles.cardWide,
              ]}
              onPress={() => onSelectPrompt(item.prompt)}
            >
              <Text style={styles.cardEmoji}>{item.emoji}</Text>

              <Text style={styles.cardLabel}>{item.label}</Text>

              <Text style={styles.cardPrompt}>
                {item.prompt}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#071114",
    position: "relative",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  container: {
    alignItems: "center",
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    zIndex: 1,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },

  greeting: {
    color: "#D9A441",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 36,
    maxWidth: 760,
  },

  cards: {
    width: "100%",
    gap: 18,
  },

  cardsWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  cardsNarrow: {
    flexDirection: "column",
  },

  card: {
    backgroundColor: "rgba(12,18,28,0.90)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,215,140,0.08)",
    padding: 22,
    minHeight: 150,
    width: "100%",

    shadowColor: "#10D7CB",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },

  cardWide: {
    width: "48%",
  },

  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },

  cardEmoji: {
    fontSize: 30,
    marginBottom: 14,
  },

  cardLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  cardPrompt: {
    color: "#B8D8D5",
    fontSize: 14,
    lineHeight: 22,
  },
});