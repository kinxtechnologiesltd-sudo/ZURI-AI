import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
};

export default function QuickAction({
  icon,
  title,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.icon}>
        {icon}
      </View>

      <Text style={styles.title}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    height: 100,
    backgroundColor: "#0C1D21",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#17343A",
    marginRight: 15,
  },

  icon: {
    marginBottom: 10,
  },

  title: {
    color: "#FFF",
    fontWeight: "700",
  },
});