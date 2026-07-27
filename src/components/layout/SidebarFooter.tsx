import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useUserPlan from "../../hooks/useUserPlan";
export default function SidebarFooter() {
    const router = useRouter();
    const { isProUser, planLoading } = useUserPlan();
  return (
    <View style={styles.container}>
      {/* User Profile */}
      <View style={styles.userCard}>
        <View style={styles.avatarOuter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.name}>Joseph</Text>

          <View style={styles.planRow}>
            <View style={styles.planDot} />
            <Text style={styles.plan}>Pro Member</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
        >
          <Text style={styles.moreText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <TouchableOpacity
        style={styles.settings}
        activeOpacity={0.8}
      >
        <View style={styles.settingsIcon}>
          <Text style={styles.settingsIconText}>⚙</Text>
        </View>

        <Text style={styles.settingsText}>
          Settings
        </Text>
      </TouchableOpacity>

      {/* Zuri Pro Card */}
     {!planLoading && (
  isProUser ? (
    <TouchableOpacity
  style={styles.proCard}
  activeOpacity={0.85}
  onPress={() => router.push("/pro")}
>
  <Text style={styles.proTitle}>
    ✦ Zuri Pro
  </Text>

  <Text style={styles.proSub}>
    Premium features unlocked
  </Text>
</TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.upgrade}
      activeOpacity={0.85}
      onPress={() => router.push("/pro")}
    >
      <Text style={styles.upgradeTitle}>
        Upgrade to Pro
      </Text>

      <Text style={styles.upgradeSub}>
        Unlock premium voice, AI music, animation and expanded image generation.
      </Text>
    </TouchableOpacity>
  )
)}
    </View>
  );
}

const styles = StyleSheet.create({
  proCard: {
  backgroundColor: "#0B2426",
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: "#1F6B70",
},

proTitle: {
  color: "#5EEAD4",
  fontSize: 16,
  fontWeight: "800",
  marginBottom: 6,
},

proSub: {
  color: "#94A3B8",
  fontSize: 13,
  lineHeight: 19,
},
  container: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#1A2B31",
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatarOuter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#C79A4B",
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#F1C675",
    fontWeight: "800",
    fontSize: 17,
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    color: "#F7F8F6",
    fontSize: 15,
    fontWeight: "700",
  },

  planRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  planDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#19D3C5",
    marginRight: 6,
  },

  plan: {
    color: "#8EA4A7",
    fontSize: 12,
  },

  moreButton: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  moreText: {
    color: "#71878B",
    fontSize: 15,
    letterSpacing: 2,
  },

  settings: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  settingsIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#102329",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  settingsIconText: {
    fontSize: 14,
  },

  settingsText: {
    color: "#B9C7C9",
    fontSize: 14,
    fontWeight: "600",
  },

  upgrade: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0D2025",
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: "#244047",
  },

  upgradeGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#123D3D",
    top: -50,
    right: -35,
    opacity: 0.7,
  },

  proBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#173337",
    borderWidth: 1,
    borderColor: "#806632",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 12,
  },

  proBadgeText: {
    color: "#E2B963",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  upgradeTitle: {
    color: "#F4F1E9",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 7,
  },

  upgradeSub: {
    color: "#82989B",
    fontSize: 12,
    lineHeight: 18,
  },

  upgradeAction: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },

  upgradeActionText: {
    color: "#1DD6C8",
    fontSize: 12,
    fontWeight: "700",
  },

  arrow: {
    color: "#D7AD5A",
    fontSize: 16,
    marginLeft: 7,
  },
});