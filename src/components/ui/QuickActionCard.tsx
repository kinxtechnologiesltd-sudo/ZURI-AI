import {
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

type Props = {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
};

const QuickActionCard = ({
  title,
  subtitle,
  icon,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.icon}>{icon}</Text>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

export default QuickActionCard;

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  icon: {
    fontSize: 30,
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    color: "#94A3B8",
    marginTop: 6,
    fontSize: 14,
  },
});