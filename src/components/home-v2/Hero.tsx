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

      <View style={styles.heroBackground}>

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600",
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <View style={styles.overlay} />

      </View>

      <View style={styles.logoContainer}>

        <View style={styles.logoGlow} />

        <Image
          source={require("../../asset/images/zuri-icon.png.png.png")}
          style={styles.zuriLogo}
          resizeMode="contain"
        />

      </View>

      <Text style={styles.title}>
        {greeting}, Joseph 👋
      </Text>

      <Text style={styles.subtitle}>
        Create without limits.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },

  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    height: 430,

    overflow: "hidden",

    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
  },

  backgroundImage: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "rgba(6,16,20,0.72)",
  },

  logoContainer: {
    width: "100%",
    height: 230,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 10,
  },

  logoGlow: {
    position: "absolute",

    width: 260,
    height: 260,

    borderRadius: 130,

    backgroundColor: "rgba(16,224,212,0.10)",
  },

  zuriLogo: {
    width: 620,
    height: 190,

    maxWidth: "100%",
  },

  title: {
    color: "#F5F7F5",

    fontSize: 40,

    fontWeight: "900",

    textAlign: "center",
  },

  subtitle: {
    color: "#8EA3A6",

    fontSize: 18,

    lineHeight: 30,

    textAlign: "center",

    marginTop: 12,

    maxWidth: 600,
  },
});