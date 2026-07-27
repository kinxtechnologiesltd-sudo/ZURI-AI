import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useUserPlan from "../../hooks/useUserPlan";
export default function TopHeader() {
    const router = useRouter();
    const { isProUser, planLoading } = useUserPlan();
  return (
    <View style={styles.container}>
      {/* Left: Zuri Status */}
      <View style={styles.left}>
        <View style={styles.statusIcon}>
          <Text style={styles.statusLetter}>Z</Text>
          <View style={styles.onlineDot} />
        </View>

        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Zuri</Text>

          <TouchableOpacity
  style={styles.modelBadge}
  activeOpacity={0.8}
  onPress={() => router.push("/pro")}
>
             <Text style={styles.modelText}>
  {isProUser ? "ZURI PRO" : "UPGRADE"}
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
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>☀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>♢</Text>

          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.profile}
          activeOpacity={0.8}
        >
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>J</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Joseph</Text>
<Text style={styles.plan}>
  {planLoading
    ? "Loading..."
    : isProUser
    ? "Pro Member"
    : "Free Member"}
</Text>
          </View>

          <Text style={styles.profileArrow}>⌄</Text>
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

  left: {
    flexDirection: "row",
    alignItems: "center",
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

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "#F5F3EC",
    fontSize: 17,
    fontWeight: "800",
    marginRight: 9,
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

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,

    backgroundColor: "#123037",

    justifyContent: "center",
    alignItems: "center",
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
});