import {
  Image,
  StyleSheet,
  View,
} from "react-native";

export default function AthenaLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../asset/images/zuri-icon.png (2).png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

 logo: {
  width: 380,
  height: 360,
},
});