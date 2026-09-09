import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export default function CategoryCard({
  title,
  subtitle,
  icon,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.icon}>
        {icon}
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#0B171C",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1A3138",
    minHeight: 170,
  },

  icon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#10252A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 18,
  },

  subtitle: {
    color: "#8FA4A8",
    marginTop: 8,
    lineHeight: 20,
    fontSize: 14,
  },
});