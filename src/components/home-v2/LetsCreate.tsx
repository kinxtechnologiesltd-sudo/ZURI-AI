import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function LetsCreate(): React.ReactElement {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  return (
    <View style={[styles.wrapper, isLarge ? styles.wrapperLarge : null]}>
      <View style={styles.card}>
        <Text style={styles.title}>Ready to build something amazing?</Text>
        <Text style={styles.subtitle}>
          Create images, videos, apps, music, documents and more with Zuri.
        </Text>

        <Pressable style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]} onPress={() => router.push("/chat")}>
          <Text style={styles.buttonText}>✨ Let's Create</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },
  wrapperLarge: {
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  card: {
    width: "100%",
    maxWidth: 920,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 170, 0.18)",
    backgroundColor: "rgba(12, 18, 28, 0.88)",
    padding: 28,
    shadowColor: "#00f1ff",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
    overflow: "hidden",
  },
  title: {
    color: "#F8F7F4",
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    marginBottom: 16,
  },
  subtitle: {
    color: "#D8D7D1",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 720,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    paddingVertical: 16,
    backgroundColor: "#02323D",
    borderWidth: 1,
    borderColor: "#13E4D4",
    shadowColor: "#13E4D4",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonText: {
    color: "#FCE9B9",
    fontSize: 18,
    fontWeight: "800",
  },
});