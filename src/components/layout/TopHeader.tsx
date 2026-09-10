import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import useUserPlan from "../../hooks/useUserPlan";

export default function TopHeader() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width < 600;

  const {
    plan,
    planLoading,
  } = useUserPlan();

  const getPlanLabel = () => {
    if (planLoading) {
      return "LOADING...";
    }

    if (plan === "ultra") {
      return "ZURI ULTRA";
    }

    if (plan === "pro") {
      return "ZURI PRO";
    }

    return "UPGRADE";
  };

  const getMemberLabel = () => {
    if (planLoading) {
      return "Loading...";
    }

    if (plan === "ultra") {
      return "Ultra Member";
    }

    if (plan === "pro") {
      return "Pro Member";
    }

    return "Free Member";
  };

  return (
    <View
      style={[
        styles.container,
        isMobile && styles.mobileContainer,
      ]}
    >
      {/* Left: Zuri Status */}
      <View style={styles.left}>
        <View
          style={[
            styles.statusIcon,
            isMobile && styles.mobileStatusIcon,
          ]}
        >
          <Text style={styles.statusLetter}>Z</Text>

          <View style={styles.onlineDot} />
        </View>

        <View style={styles.leftInfo}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                isMobile && styles.mobileTitle,
              ]}
            >
              Zuri
            </Text>

            <TouchableOpacity
              style={[
                styles.modelBadge,
                isMobile && styles.mobileModelBadge,
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/pro")}
            >
              <Text style={styles.modelText}>
                {getPlanLabel()}
              </Text>

              <Text style={styles.chevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.status}>
            Ready when you are
          </Text>
        </View>
      </View>

      {/* Right: Actions */}
      <View
        style={[
          styles.right,
          isMobile && styles.mobileRight,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.iconButton,
            isMobile && styles.mobileIconButton,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>☀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            isMobile && styles.mobileIconButton,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>♢</Text>

          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            isMobile && styles.mobileDivider,
          ]}
        />

        <TouchableOpacity
          style={styles.profile}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.avatarOuter,
              isMobile && styles.mobileAvatarOuter,
            ]}
          >
            <View
              style={[
                styles.avatar,
                isMobile && styles.mobileAvatar,
              ]}
            >
              <Text style={styles.avatarText}>J</Text>
            </View>
          </View>

          {!isMobile && (
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                Joseph
              </Text>

              <Text style={styles.plan}>
                {getMemberLabel()}
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.profileArrow,
              isMobile && styles.mobileProfileArrow,
            ]}
          >
            ⌄
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 76,
    paddingHorizontal: 26,

    backgroundColor: "#081216",

    borderBottomWidth: 1,
    borderBottomColor: "#182A30",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mobileContainer: {
    height: 68,
    paddingHorizontal: 14,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  statusIcon: {
    position: "relative",

    width: 40,
    height: 40,
    borderRadius: 13,

    backgroundColor: "#102A30",

    borderWidth: 1,
    borderColor: "#715C35",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  mobileStatusIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 9,
  },

  statusLetter: {
    color: "#E4B962",
    fontSize: 20,
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",

    width: 9,
    height: 9,
    borderRadius: 5,

    backgroundColor: "#19D3C5",

    right: -2,
    bottom: 3,

    borderWidth: 2,
    borderColor: "#081216",
  },

  leftInfo: {
    flexShrink: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  title: {
    color: "#F5F3EC",
    fontSize: 17,
    fontWeight: "800",
    marginRight: 9,
  },

  mobileTitle: {
    fontSize: 16,
    marginRight: 7,
  },

  modelBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#10272C",

    borderWidth: 1,
    borderColor: "#5C4C2E",

    borderRadius: 20,

    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  mobileModelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  modelText: {
    color: "#DDB35E",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  chevron: {
    color: "#758C8F",
    fontSize: 11,
    marginLeft: 5,
  },

  status: {
    color: "#71878A",
    fontSize: 11,
    marginTop: 3,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },

  mobileRight: {
    marginLeft: 8,
  },

  iconButton: {
    position: "relative",

    width: 38,
    height: 38,
    borderRadius: 12,

    backgroundColor: "#0D1D22",

    borderWidth: 1,
    borderColor: "#1B3036",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 8,
  },

  mobileIconButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    marginLeft: 5,
  },

  icon: {
    color: "#9FB0B2",
    fontSize: 17,
  },

  notificationDot: {
    position: "absolute",

    width: 6,
    height: 6,
    borderRadius: 3,

    backgroundColor: "#E0B45D",

    right: 7,
    top: 7,
  },

  divider: {
    width: 1,
    height: 30,

    backgroundColor: "#1A2C31",

    marginHorizontal: 15,
  },

  mobileDivider: {
    height: 26,
    marginHorizontal: 7,
  },

  profile: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#8A6C36",

    justifyContent: "center",
    alignItems: "center",
  },

  mobileAvatarOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,

    backgroundColor: "#123037",

    justifyContent: "center",
    alignItems: "center",
  },

  mobileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  avatarText: {
    color: "#E8BE6B",
    fontSize: 14,
    fontWeight: "800",
  },

  profileInfo: {
    marginLeft: 10,
  },

  name: {
    color: "#EEF1ED",
    fontSize: 13,
    fontWeight: "700",
  },

  plan: {
    color: "#71878A",
    fontSize: 10,
    marginTop: 2,
  },

  profileArrow: {
    color: "#71878A",
    fontSize: 13,
    marginLeft: 10,
  },

  mobileProfileArrow: {
    fontSize: 11,
    marginLeft: 5,
  },
});