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

type Project = {
  id: string;
  emoji: string;
  title: string;
  category: string;
  lastEdited: string;
};

const sampleProjects: Project[] = [
  {
    id: "p1",
    emoji: "🖼️",
    title: "Zuri Visuals",
    category: "AI Images",
    lastEdited: "Edited 2 days ago",
  },
  {
    id: "p2",
    emoji: "🎵",
    title: "Ambient Score",
    category: "Music",
    lastEdited: "Edited 5 days ago",
  },
  {
    id: "p3",
    emoji: "📱",
    title: "Aurora App",
    category: "Mobile App",
    lastEdited: "Edited 1 week ago",
  },
];

export default function ContinueCreating(): React.ReactElement {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isLarge = width >= 900;
  const cardWidth = isLarge ? Math.min(440, width * 0.28) : Math.min(360, width * 0.8);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Continue creating</Text>
        <Text style={styles.subtitle}>Resume your recent projects or pick up where you left off.</Text>
      </View>

      <ScrollView
        horizontal={!isLarge}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isLarge ? styles.gridWrap : styles.rowWrap,
        ]}
      >
        {sampleProjects.map((p) => (
          <View key={p.id} style={[styles.cardWrapper, { width: cardWidth }]}>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed ? styles.cardPressed : null,
              ]}
              onPress={() => router.push("/chat")}
            >
              <View style={styles.cardTop}>
                <Text style={styles.icon}>{p.emoji}</Text>
                <View style={styles.accentDot} />
              </View>

              <Text style={styles.projectTitle}>{p.title}</Text>
              <Text style={styles.projectMeta}>
                {p.category} · {p.lastEdited}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => router.push("/chat")}
                  style={({ pressed }) => [
                    styles.continueButton,
                    pressed ? styles.continuePressed : null,
                  ]}
                >
                  <Text style={styles.continueText}>Continue →</Text>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: "#F8F7F4",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#B7CCC9",
    fontSize: 14,
    marginTop: 6,
    maxWidth: 720,
  },
  scrollContent: {
    alignItems: "flex-start",
  },
  rowWrap: {
    paddingVertical: 8,
    paddingRight: 20,
    flexDirection: "row",
    gap: 16,
  },
  gridWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardWrapper: {
    marginRight: 16,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(10,14,18,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 140, 0.08)",
    shadowColor: "#13E4D4",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    minHeight: 150,
    justifyContent: "space-between",
  },
  cardPressed: {
    opacity: 0.95,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    fontSize: 36,
  },
  accentDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#F2C94C",
  },
  projectTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },
  projectMeta: {
    color: "#9FCFC7",
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  continueButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(3, 50, 61, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(19, 228, 212, 0.28)",
  },
  continuePressed: {
    opacity: 0.92,
  },
  continueText: {
    color: "#FCE9B9",
    fontWeight: "800",
    fontSize: 14,
  },
});