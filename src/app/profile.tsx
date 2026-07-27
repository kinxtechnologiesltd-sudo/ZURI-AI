import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AthenaLogo from "../components/ui/AthenaLogo";
import BottomNav from "../components/ui/BottomNav";
import { auth } from "../firebase/firebaseConfig";
import useUserPlan from "../hooks/useUserPlan";

export default function Profile() {
  const { isProUser } = useUserPlan();

  const user = auth.currentUser;

  const email = user?.email || "Zuri user";

  const displayName =
    user?.displayName ||
    email.split("@")[0] ||
    "Zuri User";

  const firstLetter =
    displayName.charAt(0).toUpperCase();

  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <View style={styles.root}>
      {/* Background glow */}
      <View style={styles.topGlow} />
      <View style={styles.goldGlow} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Zuri Logo */}
        <View style={styles.logoSection}>
          <AthenaLogo />
        </View>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.eyebrow}>
            YOUR ZURI
          </Text>

          <Text style={styles.title}>
            My Profile
          </Text>

          <Text style={styles.subtitle}>
            Manage your account and personalize your
            experience with Zuri.
          </Text>
        </View>

        {/* Main Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstLetter}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={styles.userName}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            <Text
              style={styles.userEmail}
              numberOfLines={1}
            >
              {email}
            </Text>

            <View
              style={[
                styles.planBadge,
                isProUser && styles.proPlanBadge,
              ]}
            >
              <View
                style={[
                  styles.planDot,
                  isProUser && styles.proPlanDot,
                ]}
              />

              <Text
                style={[
                  styles.planText,
                  isProUser && styles.proPlanText,
                ]}
              >
                {isProUser
                  ? "ZURI PRO"
                  : "ZURI FREE"}
              </Text>
            </View>
          </View>
        </View>

        {/* Upgrade Card — Free users only */}
        {!isProUser && (
          <TouchableOpacity
            style={styles.upgradeCard}
            activeOpacity={0.85}
            onPress={() => router.push("/pro")}
          >
            <View style={styles.upgradeGlow} />

            <View style={styles.upgradeBadge}>
              <Text style={styles.upgradeBadgeText}>
                ZURI PRO
              </Text>
            </View>

            <Text style={styles.upgradeTitle}>
              Unlock more of Zuri
            </Text>

            <Text style={styles.upgradeText}>
              Get enhanced intelligence, deeper research,
              better memory and expanded creative tools.
            </Text>

            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>
                Explore Pro
              </Text>

              <Text style={styles.upgradeArrow}>
                →
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>
            ACCOUNT
          </Text>

          <Text style={styles.sectionTitle}>
            Your space
          </Text>

          <View style={styles.menuCard}>
            {/* History */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => router.push("/history")}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>
                  ◇
                </Text>
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>
                  Conversation History
                </Text>

                <Text style={styles.menuSubtitle}>
                  Return to your previous conversations
                </Text>
              </View>

              <Text style={styles.menuArrow}>
                →
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Memory */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>
                  ✦
                </Text>
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>
                  Memory
                </Text>

                <Text style={styles.menuSubtitle}>
                  Manage what Zuri remembers about you
                </Text>
              </View>

              <Text style={styles.menuArrow}>
                →
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => router.push("/settings")}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>
                  ⚙
                </Text>
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>
                  Settings
                </Text>

                <Text style={styles.menuSubtitle}>
                  Customize your Zuri experience
                </Text>
              </View>

              <Text style={styles.menuArrow}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account details */}
        <View style={styles.accountCard}>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>
              Account
            </Text>

            <Text style={styles.accountValue}>
              {isProUser ? "Pro" : "Free"}
            </Text>
          </View>

          <View style={styles.accountDivider} />

          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>
              AI Assistant
            </Text>

            <Text style={styles.accountValue}>
              Zuri
            </Text>
          </View>

          <View style={styles.accountDivider} />

          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>
              Created by
            </Text>

            <Text style={styles.kinxValue}>
              KINX
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={logout}
        >
          <Text style={styles.logoutText}>
            Sign out
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ZURI
          </Text>

          <Text style={styles.footerDot}>
            •
          </Text>

          <Text style={styles.footerKinx}>
            Powered by KINX
          </Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#061014",
    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor:
      "rgba(16, 224, 212, 0.05)",
    top: -330,
    alignSelf: "center",
  },

  goldGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor:
      "rgba(212, 167, 44, 0.025)",
    right: -200,
    top: 450,
  },

  container: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 140,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 15,
  },

  pageHeader: {
    marginBottom: 28,
  },

  eyebrow: {
    color: "#10E0D4",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },

  title: {
    color: "#F4F7F5",
    fontSize: 34,
    fontWeight: "900",
  },

  subtitle: {
    color: "#819396",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 560,
    marginTop: 9,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#1A3237",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#102D31",
    borderWidth: 1,
    borderColor: "#2A5A5B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 17,
  },

  avatarText: {
    color: "#D4A72C",
    fontSize: 28,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
  },

  userName: {
    color: "#F4F7F5",
    fontSize: 20,
    fontWeight: "900",
  },

  userEmail: {
    color: "#71878A",
    fontSize: 12,
    marginTop: 5,
  },

  planBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10262B",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 11,
  },

  proPlanBadge: {
    backgroundColor: "#292515",
    borderWidth: 1,
    borderColor: "#5A4B25",
  },

  planDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10E0D4",
    marginRight: 6,
  },

  proPlanDot: {
    backgroundColor: "#D4A72C",
  },

  planText: {
    color: "#10E0D4",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  proPlanText: {
    color: "#E3BC53",
  },

  upgradeCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0C1C20",
    borderWidth: 1,
    borderColor: "#5D4B27",
    borderRadius: 24,
    padding: 23,
    marginBottom: 42,
  },

  upgradeGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor:
      "rgba(212, 167, 44, 0.07)",
    right: -50,
    top: -90,
  },

  upgradeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#292515",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 13,
  },

  upgradeBadgeText: {
    color: "#D4A72C",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  upgradeTitle: {
    color: "#F5F6F2",
    fontSize: 21,
    fontWeight: "900",
  },

  upgradeText: {
    color: "#7C9092",
    fontSize: 13,
    lineHeight: 21,
    maxWidth: 520,
    marginTop: 8,
  },

  upgradeButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4A72C",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 18,
  },

  upgradeButtonText: {
    color: "#061014",
    fontSize: 12,
    fontWeight: "900",
  },

  upgradeArrow: {
    color: "#061014",
    fontSize: 15,
    marginLeft: 7,
  },

  section: {
    marginTop: 10,
    marginBottom: 25,
  },

  sectionEyebrow: {
    color: "#10E0D4",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 6,
  },

  sectionTitle: {
    color: "#F2F5F3",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },

  menuCard: {
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 22,
    overflow: "hidden",
    paddingHorizontal: 16,
  },

  menuItem: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuIconText: {
    color: "#D4A72C",
    fontSize: 18,
    fontWeight: "700",
  },

  menuContent: {
    flex: 1,
  },

  menuTitle: {
    color: "#EEF2EF",
    fontSize: 15,
    fontWeight: "800",
  },

  menuSubtitle: {
    color: "#657A7D",
    fontSize: 11,
    marginTop: 5,
  },

  menuArrow: {
    color: "#536B6F",
    fontSize: 19,
    marginLeft: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#15292E",
    marginLeft: 56,
  },

  accountCard: {
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 25,
  },

  accountRow: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  accountLabel: {
    color: "#71878A",
    fontSize: 12,
  },

  accountValue: {
    color: "#D6DFDB",
    fontSize: 12,
    fontWeight: "700",
  },

  kinxValue: {
    color: "#10E0D4",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  accountDivider: {
    height: 1,
    backgroundColor: "#15292E",
  },

  logoutButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#553034",
    backgroundColor: "#1C1215",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
  },

  logoutText: {
    color: "#D98087",
    fontSize: 14,
    fontWeight: "800",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    color: "#D4A72C",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footerDot: {
    color: "#40565A",
    marginHorizontal: 9,
  },

  footerKinx: {
    color: "#607578",
    fontSize: 11,
  },
});