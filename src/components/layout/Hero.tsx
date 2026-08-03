import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Hero() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoGlow} />
        <Image
          source={require("../asset/images/zuri-icon.png.png.png")}
          style={styles.zuriLogo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>
        {greeting}, Joseph 👋
      </Text>

      <Text style={styles.subtitle}>
        Create anything with one prompt.
      </Text>
    </View>
  );
}
 const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",

    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 24,
  },

  logoContainer: {
    width: "100%",
    height: 180,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 26,
  },

  zuriLogo: {
    width: 620,
    height: 180,

    maxWidth: "100%",
  },

  title: {
    color: "#F5F7F5",

    fontSize: 42,

    fontWeight: "900",

    textAlign: "center",

    letterSpacing: -1,
  },
logoGlow: {
  position: "absolute",

  width: 260,
  height: 260,

  borderRadius: 130,

  backgroundColor: "rgba(16,224,212,0.08)",
},
  subtitle: {
    color: "#8EA3A6",

    fontSize: 18,

    lineHeight: 30,

    textAlign: "center",

    marginTop: 14,

    maxWidth: 620,
  },
});