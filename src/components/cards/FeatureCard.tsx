import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FeatureCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  accent?: "teal" | "gold";
};

export default function FeatureCard({
  title,
  subtitle,
  icon,
  accent = "teal",
}: FeatureCardProps) {
  const isGold = accent === "gold";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          isGold
            ? styles.goldIcon
            : styles.tealIcon,
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <Text
        style={[
          styles.arrow,
          isGold
            ? styles.goldText
            : styles.tealText,
        ]}
      >
        ↗
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31.5%",
    minWidth: 220,
    minHeight: 145,

    position: "relative",

    padding: 18,

    borderRadius: 20,

    backgroundColor: "#0C1A1F",

    borderWidth: 1,
    borderColor: "#1A343A",

    marginBottom: 16,
  },

  iconContainer: {
    width: 38,
    height: 38,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  tealIcon: {
    backgroundColor: "#102F32",
    borderWidth: 1,
    borderColor: "#235A5C",
  },

  goldIcon: {
    backgroundColor: "#2A2418",
    borderWidth: 1,
    borderColor: "#66532E",
  },

  icon: {
    fontSize: 17,
  },

  content: {
    paddingRight: 18,
  },

  title: {
    color: "#F2F3EF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 7,
  },

  subtitle: {
    color: "#7E9497",
    fontSize: 12,
    lineHeight: 18,
  },

  arrow: {
    position: "absolute",
    top: 19,
    right: 18,

    fontSize: 14,
  },

  tealText: {
    color: "#1BCFC2",
  },

  goldText: {
    color: "#D9AE59",
  },
});