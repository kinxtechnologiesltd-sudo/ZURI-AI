import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type CreateCardProps = {
  icon: string;
  title: string;
  description: string;
  color?: string;
  onPress: () => void;
};

export default function CreateCard({
  icon,
  title,
  description,
  color = "#10E0D4",
  onPress,
}: CreateCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: color,
          },
        ]}
      >
        <Text style={styles.icon}>
          {icon}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      <Text style={styles.arrow}>
        →
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0C1D21",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#17343A",
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 30,
  },

  content: {
    flex: 1,
    marginLeft: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  description: {
    color: "#9CB0B4",
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
  },

  arrow: {
    color: "#D4A72C",
    fontSize: 28,
    fontWeight: "bold",
  },
});