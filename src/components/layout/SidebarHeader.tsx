import { Image, StyleSheet, View } from "react-native";

export default function SidebarHeader() {
  return (
    <View style={styles.container}>
      <Image
      source={require("../../asset/images/zuri-icon.png.png.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  width: "100%",
  height: 175,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
},

logo: {
  width: 360,
  height: 170,
},
});