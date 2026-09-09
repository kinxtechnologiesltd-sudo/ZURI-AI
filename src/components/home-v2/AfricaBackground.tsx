import {
    Image,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

export default function AfricaBackground() {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <Image
        source={require("../../asset/images/Africa.png")}
        resizeMode="contain"
        style={[
          styles.image,
          {
            width: width * 0.82,
          },
        ]}
      />

      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
wrapper: {
  ...StyleSheet.absoluteFill,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 0,
  overflow: "hidden",
},

  image: {
    opacity: 0.05,
    aspectRatio: 1,
  },

overlay: {
  ...StyleSheet.absoluteFill,
  backgroundColor: "rgba(16,215,203,0.03)",
},
});