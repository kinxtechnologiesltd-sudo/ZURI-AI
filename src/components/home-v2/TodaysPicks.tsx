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

type Pick = {
  id: string;
  badge: "NEW" | "HOT" | "FEATURED" | "TRENDING";
  title: string;
  description: string;
};

const picks: Pick[] = [
  {
    id: "p1",
    badge: "NEW",
    title: "Generative Studio",
    description: "Create studio-grade images and videos from a single prompt.",
  },
  {
    id: "p2",
    badge: "HOT",
    title: "Smart Website Builder",
    description: "Turn ideas into responsive websites in minutes.",
  },
  {
    id: "p3",
    badge: "FEATURED",
    title: "Adaptive App Templates",
    description: "Launch polished mobile experiences with AI-driven scaffolds.",
  },
  {
    id: "p4",
    badge: "TRENDING",
    title: "AI Composer",
    description: "Produce original music and soundscapes on demand.",
  },
];

export default function TodaysPicks(): React.ReactElement {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWide = width >= 900;
  const cardWidth = isWide ? Math.min(420, (width - 100) / 2) : Math.min(320, width * 0.8);

  const badgeColor = (badge: Pick["badge"]) => {
    switch (badge) {
      case "NEW":
        return "#10D7CB";
      case "HOT":
        return "#FF6B6B";
      case "FEATURED":
        return "#F2C94C";
      case "TRENDING":
        return "#B28CFF";
      default:
        return "#10D7CB";
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Today’s Picks</Text>
        <Text style={styles.subtitle}>Handpicked features to spark your next creation.</Text>
      </View>

      <ScrollView
        horizontal={!isWide}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isWide ? styles.gridWrap : styles.rowWrap,
        ]}
      >
        {picks.map((p) => (
          <View key={p.id} style={[styles.cardWrapper, { width: cardWidth }]}>
            <Pressable
              onPress={() => router.push("/chat")}
              style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
              accessibilityLabel={`${p.badge} ${p.title} - ${p.description}`}
            >
              <View style={styles.cardTop}>
                <View style={[styles.badge, { backgroundColor: badgeColor(p.badge) }]}>
                  <Text style={styles.badgeText}>{p.badge}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{p.title}</Text>

              <Text style={styles.cardDescription} numberOfLines={1}>
                {p.description}
              </Text>

              <View style={styles.cardFooter}>
                <Pressable
                  onPress={() => router.push("/chat")}
                  style={({ pressed }) => [styles.tryButton, pressed ? styles.tryPressed : null]}
                >
                  <Text style={styles.tryText}>Try Now →</Text>
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
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: "#F8F7F4",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#B9C6C2",
    fontSize: 14,
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
    padding: 18,
    minHeight: 140,
    backgroundColor: "rgba(12, 17, 24, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(255,215,140,0.08)",
    shadowColor: "#10D7CB",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    justifyContent: "space-between",
  },
  cardPressed: {
    opacity: 0.96,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  badgeText: {
    color: "#071114",
    fontWeight: "800",
    fontSize: 12,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },
  cardDescription: {
    color: "#B8D8D5",
    fontSize: 14,
    marginTop: 8,
  },
  cardFooter: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  tryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(3,50,61,0.9)",
    borderWidth: 1,
    borderColor: "rgba(19,228,212,0.22)",
    shadowColor: "#10D7CB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  tryPressed: {
    opacity: 0.92,
  },
  tryText: {
    color: "#FCE9B9",
    fontWeight: "800",
    fontSize: 14,
  },
});