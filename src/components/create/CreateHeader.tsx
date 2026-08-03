import { StyleSheet, Text, View } from "react-native";

export default function CreateHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        ✨ CREATE
      </Text>

      <Text style={styles.title}>
        What would you like to create today?
      </Text>

      <Text style={styles.subtitle}>
        Images, videos, comics, websites, apps,
        branding and much more.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },

  greeting: {
    color: "#10E0D4",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },

  title: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 10,
  },

  subtitle: {
    color: "#8FA3A7",
    fontSize: 16,
    lineHeight: 25,
    marginTop: 10,
  },
});