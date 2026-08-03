import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FeatureCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  accent?: "teal" | "gold";
  badge?: string;
  onPress?: () => void;
};

export default function FeatureCard({
  title,
  subtitle,
  icon,
  accent = "teal",
  badge,
  onPress,
}: FeatureCardProps) {
  const isGold = accent === "gold";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
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

      {badge && (
        <View
          style={[
            styles.badge,
            isGold
              ? styles.goldBadge
              : styles.tealBadge,
          ]}
        >
          <Text style={styles.badgeText}>
            {badge}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>

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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31.5%",
    minWidth: 220,
    minHeight: 155,

    position: "relative",

    padding: 22,

    borderRadius: 24,

    backgroundColor: "#0D171C",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    marginBottom: 18,
  },

  cardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: "#D9A441",
  },

  iconContainer: {
    width: 48,
    height: 48,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 18,
  },

  tealIcon: {
    backgroundColor: "rgba(0,217,200,.12)",
    borderWidth: 1,
    borderColor: "rgba(0,217,200,.30)",
  },

  goldIcon: {
    backgroundColor: "rgba(217,164,65,.12)",
    borderWidth: 1,
    borderColor: "rgba(217,164,65,.30)",
  },

  icon: {
    fontSize: 22,
  },

  badge: {
    position: "absolute",
    top: 18,
    right: 18,

    paddingHorizontal: 8,
    paddingVertical: 3,

    borderRadius: 999,
  },

  goldBadge: {
    backgroundColor: "rgba(217,164,65,.18)",
  },

  tealBadge: {
    backgroundColor: "rgba(0,217,200,.18)",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  content: {
    paddingRight: 20,
  },

  title: {
    color: "#F2F3EF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },

  subtitle: {
    color: "#8FA4A8",
    fontSize: 13,
    lineHeight: 20,
  },

  arrow: {
    position: "absolute",
    right: 20,
    bottom: 20,

    fontSize: 18,
    fontWeight: "700",
  },

  tealText: {
    color: "#19BDB3",
  },

  goldText: {
    color: "#D9A441",
  },
});