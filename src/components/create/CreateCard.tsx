import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

export default function CreateCard({
  icon,
  title,
  description,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Text style={styles.icon}>
          {icon}
        </Text>

        <View>
          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#18363C",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  icon: {
    fontSize: 32,
    marginRight: 18,
  },

  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },

  description: {
    color: "#91A4A8",
    marginTop: 6,
    fontSize: 14,
  },

  arrow: {
    color: "#D4A72C",
    fontSize: 28,
    fontWeight: "bold",
  },
});