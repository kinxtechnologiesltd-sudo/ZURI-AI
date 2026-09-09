import {
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});