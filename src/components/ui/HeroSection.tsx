import { StyleSheet, Text, View } from "react-native";
import AthenaLogo from "./AthenaLogo";

export default function HeroSection() {
  return (
    <View style={styles.container}>
      <AthenaLogo />

      <Text style={styles.heading}>
        Think Beyond.
      </Text>

      <Text style={styles.subtitle}>
        Athena helps you think, create, learn and build faster.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 35,
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 15,
  },

  subtitle: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
    fontSize: 16,
    maxWidth: 320,
  },
});