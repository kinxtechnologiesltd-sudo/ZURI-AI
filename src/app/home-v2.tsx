import { ScrollView, StyleSheet, View } from "react-native";

import ContinueCreating from "../components/home-v2/ContinueCreating";
import Hero from "../components/home-v2/Hero";
import Inspiration from "../components/home-v2/Inspiration";
import PromptComposer from "../components/home-v2/PromptComposer";
import TodaysPicks from "../components/home-v2/TodaysPicks";
import BottomNav from "../components/ui/BottomNav";
export default function HomeV2() {
  return (
    <View style={styles.root}>

      <View style={styles.topGlow} />

      <View style={styles.bottomGlow} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <Hero />

        <PromptComposer />

        <ContinueCreating />

        <Inspiration />

        <TodaysPicks />

      </ScrollView>

      <BottomNav />

    </View>
  );
}const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#061014",
    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    top: -220,
    alignSelf: "center",

    width: 520,
    height: 520,

    borderRadius: 260,

    backgroundColor: "rgba(16,224,212,0.06)",
  },

  bottomGlow: {
    position: "absolute",
    bottom: -220,
    right: -120,

    width: 420,
    height: 420,

    borderRadius: 210,

    backgroundColor: "rgba(217,164,65,0.04)",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 1180,

    alignSelf: "center",

    paddingHorizontal: 24,

    paddingTop: 28,

    paddingBottom: 140,
  },
});