import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  title: string;
  active?: boolean;
  onPress?: () => void;
};

export default function ConversationItem({
  title,
  active = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        active && styles.active,
      ]}
    >
      {/* Conversation Icon */}
      <View
        style={[
          styles.iconContainer,
          active && styles.activeIconContainer,
        ]}
      >
        <Text
          style={[
            styles.icon,
            active && styles.activeIcon,
          ]}
        >
          ◇
        </Text>
      </View>

      {/* Conversation Details */}
      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            active && styles.activeTitle,
          ]}
        >
          {title}
        </Text>

        <View style={styles.metaRow}>
          {active && (
            <View style={styles.activeDot} />
          )}

          <Text
            style={[
              styles.time,
              active && styles.activeTime,
            ]}
          >
            {active ? "Active now" : "Recent"}
          </Text>
        </View>
      </View>

      {/* More Options */}
      <TouchableOpacity
        style={styles.moreButton}
        activeOpacity={0.6}
      >
        <Text style={styles.more}>
          •••
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",

    flexDirection: "row",
    alignItems: "center",

    minHeight: 60,

    paddingVertical: 10,
    paddingHorizontal: 10,

    borderRadius: 15,

    marginBottom: 6,

    borderWidth: 1,
    borderColor: "transparent",
  },

  active: {
    backgroundColor: "#0E252A",

    borderColor: "#285158",
  },

  iconContainer: {
    width: 36,
    height: 36,

    borderRadius: 11,

    backgroundColor: "#0D1E23",

    borderWidth: 1,
    borderColor: "#1B3439",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  activeIconContainer: {
    backgroundColor: "#123136",
    borderColor: "#3B6669",
  },

  icon: {
    color: "#698184",
    fontSize: 16,
    fontWeight: "700",
  },

  activeIcon: {
    color: "#19D3C5",
  },

  content: {
    flex: 1,
  },

  title: {
    color: "#AEBDBD",

    fontSize: 13,
    fontWeight: "600",
  },

  activeTitle: {
    color: "#F0F2ED",
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 4,
  },

  activeDot: {
    width: 4,
    height: 4,

    borderRadius: 2,

    backgroundColor: "#19D3C5",

    marginRight: 5,
  },

  time: {
    color: "#536B6F",

    fontSize: 9,
    fontWeight: "600",
  },

  activeTime: {
    color: "#78999A",
  },

  moreButton: {
    paddingHorizontal: 5,
    paddingVertical: 8,

    marginLeft: 3,
  },

  more: {
    color: "#536B6F",

    fontSize: 10,
    letterSpacing: 1,
  },
});