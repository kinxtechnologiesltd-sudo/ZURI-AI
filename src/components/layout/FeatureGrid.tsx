import { StyleSheet, View } from "react-native";

import FeatureCard from "../cards/FeatureCard";

export default function FeatureGrid() {
  return (
    <View style={styles.container}>
      <FeatureCard
        icon="⌕"
        title="Deep Research"
        subtitle="Explore complex topics with intelligent research."
        accent="teal"
      />

      <FeatureCard
        icon="</>"
        title="Code Assistant"
        subtitle="Write, debug and understand code faster."
        accent="gold"
      />

      <FeatureCard
        icon="◉"
        title="Vision"
        subtitle="Understand images, designs and screenshots."
        accent="teal"
      />

      <FeatureCard
        icon="◖"
        title="Voice Chat"
        subtitle="Have natural conversations with Zuri."
        accent="gold"
      />

      <FeatureCard
        icon="✦"
        title="Memory"
        subtitle="Remember important details and conversations."
        accent="gold"
      />

      <FeatureCard
        icon="▤"
        title="Documents"
        subtitle="Read, analyze and summarize your files."
        accent="teal"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",

    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",

    rowGap: 18,
    marginTop: 20,
  },
});