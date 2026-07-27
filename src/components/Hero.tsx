import { Image, StyleSheet, Text, View } from "react-native";

import FeatureGrid from "./layout/FeatureGrid";

export default function Hero() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../asset/images/zuri-icon.png.png.png")}
          style={styles.zuriLogo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>
        Good evening, Joseph 👋
      </Text>

      <Text style={styles.subtitle}>
        What can I help you build, learn or solve today?
      </Text>

      <FeatureGrid />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },

 logoContainer: {
  width: "100%",
  height: 240,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: -10,
},

zuriLogo: {
  width: 700,
  height: 230,
  maxWidth: "100%",
},

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#F3F4EF",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 17,
    color: "#789094",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
    maxWidth: 650,
    lineHeight: 24,
  },
});