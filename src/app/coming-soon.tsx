import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ComingSoon() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Coming Soon</Text>

        <Text style={styles.subtitle}>
          This feature is currently under development.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  content: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#16213A",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 12,
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },

  button: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});