import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type GlowButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  icon?: string;
};

export default function GlowButton({
  title,
  onPress,
  loading = false,
  icon,
}: GlowButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#061014" />
      ) : (
        <Text style={styles.text}>
          {icon ? `${icon} ` : ""}
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,

    borderRadius: 18,

    backgroundColor: "#D9A441",

    justifyContent: "center",

    alignItems: "center",

    shadowColor: "#D9A441",

    shadowOpacity: 0.45,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 12,
  },

  text: {
    color: "#061014",

    fontWeight: "900",

    fontSize: 16,
  },
});