import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type InspCard = {
  id: string;
  title: string;
  description: string;
  cta: string;
};

const cards: InspCard[] = [
  {
    id: "prompt_of_day",
    title: "Prompt of the Day",
    description: "A curated prompt to spark your next creative masterpiece.",
    cta: "Try it →",
  },
  {
    id: "creator_spotlight",
    title: "Creator Spotlight",
    description: "Meet an inspiring creator and see how they use Zuri.",
    cta: "Explore →",
  },
  {
    id: "trending_idea",
    title: "Trending Idea",
    description: "Ideas and trends that are shaping creations right now.",
    cta: "Open →",
  },
];

export default function Inspiration(): React.ReactElement {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWide = width >= 900;
  const cardWidth = isWide ? Math.min(360, (width - 80) / 3) : Math.min(920, width - 40);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Inspiration</Text>
        <Text style={styles.subtitle}>Fresh prompts and stories to kickstart your next idea.</Text>
      </View>

      <ScrollView
        horizontal={isWide ? false : true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWide ? styles.gridWrap : styles.rowWrap,
        ]}
      >
        {cards.map((c) => (
          <View key={c.id} style={[styles.cardWrapper, { width: cardWidth }]}>
            <Pressable
              onPress={() => router.push("/chat")}
              style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
              accessibilityLabel={`${c.title} - ${c.description}`}
            >
              <View style={styles.cardTop}>
                <View style={styles.kicker} />
                <Text style={styles.cardTitle}>{c.title}</Text>
              </View>

              <Text style={styles.cardDescription}>{c.description}</Text>

              <View style={styles.cardFooter}>
                <Pressable
                  onPress={() => router.push("/chat")}
                  style={({ pressed }) => [styles.ctaButton, pressed ? styles.ctaPressed : null]}
                >
                  <Text style={styles.ctaText}>{c.cta}</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: "#F8F7F4",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#B9C6C2",
    fontSize: 15,
    marginTop: 6,
    maxWidth: 720,
  },
  scrollContent: {
    alignItems: "flex-start",
  },
  rowWrap: {
    flexDirection: "row",
    paddingRight: 20,
    gap: 16,
  },
  gridWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  cardWrapper: {
    marginRight: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    minHeight: 180,
    backgroundColor: "rgba(12,17,24,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,215,140,0.08)",
    shadowColor: "#13E4D4",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    justifyContent: "space-between",
  },
  cardPressed: {
    opacity: 0.96,
  },
  cardTop: {
    marginBottom: 12,
  },
  kicker: {
    width: 48,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#10D7CB",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  cardDescription: {
    color: "#CFEDEA",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  cardFooter: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(3,50,61,0.9)",
    borderWidth: 1,
    borderColor: "rgba(19,228,212,0.22)",
    shadowColor: "#13E4D4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaText: {
    color: "#FCE9B9",
    fontWeight: "800",
    fontSize: 14,
  },
});