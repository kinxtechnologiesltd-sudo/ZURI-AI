import { StyleSheet, Text, View } from "react-native";

type StudioHeaderProps = {
  title: string;
  subtitle: string;
};

export default function StudioHeader({
  title,
  subtitle,
}: StudioHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>
        ZURI STUDIO
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },

  badge: {
    color: "#10E0D4",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
  },

  subtitle: {
    color: "#91A4A8",
    fontSize: 16,
    lineHeight: 26,
    marginTop: 12,
  },
});