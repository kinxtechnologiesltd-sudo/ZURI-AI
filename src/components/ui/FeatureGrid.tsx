import {
  StyleSheet,
  View,
} from "react-native";

import FeatureCard from "../cards/FeatureCard";

export default function FeatureGrid() {
  return (
    <View style={styles.container}>
      <FeatureCard
        icon="🎨"
        title="Image Studio"
        subtitle="Generate, edit and enhance images."
        accent="gold"
      />

      <FeatureCard
        icon="🎬"
        title="Video Studio"
        subtitle="Create AI videos and animations."
      />

      <FeatureCard
        icon="💻"
        title="Website Studio"
        subtitle="Build modern websites with AI."
        accent="gold"
      />

      <FeatureCard
        icon="📱"
        title="App Studio"
        subtitle="Design and develop mobile apps."
      />

      <FeatureCard
        icon="🤖"
        title="Zuri Chat"
        subtitle="Research, code and solve anything."
        accent="gold"
      />

      <FeatureCard
        icon="📄"
        title="Document Studio"
        subtitle="Write, summarize and analyze files."
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