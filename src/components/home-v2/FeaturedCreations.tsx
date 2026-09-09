import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

const featuredCards = [
  {
    emoji: "🖼️",
    title: "AI Images",
    description: "Generate stunning visuals instantly.",
  },
  {
    emoji: "🎬",
    title: "AI Videos",
    description: "Create cinematic clips from prompts.",
  },
  {
    emoji: "🌐",
    title: "Websites",
    description: "Launch beautiful sites in minutes.",
  },
  {
    emoji: "📱",
    title: "Mobile Apps",
    description: "Design sleek native experiences.",
  },
  {
    emoji: "🎵",
    title: "Music",
    description: "Compose original soundtracks.",
  },
  {
    emoji: "📄",
    title: "Documents",
    description: "Write polished content with ease.",
  },
];

export default function FeaturedCreations(): React.ReactElement {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const cardWidth = Math.min(300, width * 0.72);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Creations</Text>
        <Text style={styles.subtitle}>Discover what you can build with Zuri.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {featuredCards.map((card) => (
          <Pressable
            key={card.title}
            style={[styles.card, { width: cardWidth }]}
            onPress={() => router.push("/chat")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.accentDot} />
            </View>

            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: "#F8F7F4",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#B9C6C2",
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 560,
  },
  scrollContent: {
    paddingVertical: 4,
    paddingRight: 20,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 223, 135, 0.16)",
    backgroundColor: "rgba(12, 17, 24, 0.72)",
    shadowColor: "#0ff9ea",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  cardEmoji: {
    fontSize: 30,
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#F2C94C",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  cardDescription: {
    color: "#B8D8D5",
    fontSize: 15,
    lineHeight: 22,
  },
});