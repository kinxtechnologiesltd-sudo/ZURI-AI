import {
  StyleSheet,
  View,
} from "react-native";

import FeatureCard from "../cards/FeatureCard";

export default function FeatureGrid() {
  return (
    <View style={styles.container}>
      <FeatureCard
        icon="✦"
        title="Deep Research"
        subtitle="Explore complex ideas and uncover deeper insights."
        accent="gold"
      />

      <FeatureCard
        icon="⌘"
        title="Code Assistant"
        subtitle="Build, debug and understand your code."
      />

      <FeatureCard
        icon="◉"
        title="Vision"
        subtitle="Understand images, designs and screenshots."
        accent="gold"
      />

      <FeatureCard
        icon="◈"
        title="Voice"
        subtitle="Have natural conversations with Zuri."
      />

      <FeatureCard
        icon="∞"
        title="Memory"
        subtitle="Keep important context across conversations."
        accent="gold"
      />

      <FeatureCard
        icon="▤"
        title="Documents"
        subtitle="Read, understand and explore your files."
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

    marginTop: 26,
  },
});