import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from "react-native";

import Colors from "@/theme/colors";
import Radius from "@/theme/radius";
import Spacing from "@/theme/spacing";
import Typography from "@/theme/typography";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const background =
    variant === "primary"
      ? Colors.primary
      : variant === "secondary"
      ? Colors.card
      : "transparent";

  const textColor =
    variant === "primary"
      ? "#061014"
      : Colors.white;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColor },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },

  text: {
    fontSize: Typography.body,
    fontWeight: Typography.bold,
  },
});