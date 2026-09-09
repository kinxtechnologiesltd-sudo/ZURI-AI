import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({
  title,
  subtitle,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 16,
    marginTop: 6,
    lineHeight: 24,
  },
});