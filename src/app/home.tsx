import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AthenaLogo from "../components/ui/AthenaLogo";
import BottomNav from "../components/ui/BottomNav";
import { auth } from "../firebase/firebaseConfig";

export default function Home() {
    const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(35)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);
  const logout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <View style={styles.root}>
      {/* Background glow */}
      <View style={styles.topGlow} />
      <View style={styles.sideGlow} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Zuri Brand */}
<Animated.View
  style={{
    opacity: fadeAnim,
    transform: [
      {
        translateY: slideAnim,
      },
    ],
  }}
>
  <View style={styles.logoSection}>
    <AthenaLogo />
  </View>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              ZURI IS READY
            </Text>
          </View>

         <Text style={styles.greeting}>
  Welcome back.
  {"\n"}
  What are we building today?
</Text>

<Text style={styles.subtitle}>
  Build brands, generate stunning images, create videos,
  design websites, write code, analyze documents and bring
  your biggest ideas to life with Zuri AI.
</Text>

          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.85}
            onPress={() => router.push("/chat")}
          >
            <View style={styles.chatButtonIcon}>
              <Text style={styles.chatButtonIconText}>
                ✦
              </Text>
            </View>

            <View style={styles.chatButtonContent}>
              <Text style={styles.chatButtonText}>
                Start a conversation
              </Text>

              <Text style={styles.chatButtonSubtext}>
                Ask Zuri anything
              </Text>
            </View>

            <Text style={styles.chatArrow}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              EXPLORE
            </Text>

            <Text style={styles.sectionTitle}>
              What can Zuri do?
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
onPress={() =>
  router.push({
    pathname: "/chat",
    params: {
      mode: "image",
    },
  })
}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                ✦
              </Text>
            </View>

            <Text style={styles.actionTitle}>
              Create an Image
            </Text>

            <Text style={styles.actionText}>
              Turn your imagination into visuals with AI.
            </Text>

            <Text style={styles.actionArrow}>
              Try it →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push("/chat")}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                ▤
              </Text>
            </View>

            <Text style={styles.actionTitle}>
              Analyze Files
            </Text>

            <Text style={styles.actionText}>
              Upload documents and explore their content.
            </Text>

            <Text style={styles.actionArrow}>
              Upload →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push("/chat")}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                ◉
              </Text>
            </View>

            <Text style={styles.actionTitle}>
              Talk with Zuri
            </Text>

            <Text style={styles.actionText}>
              Have natural conversations using your voice.
            </Text>

            <Text style={styles.actionArrow}>
              Start talking →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push("/chat")}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                ◎
              </Text>
            </View>

            <Text style={styles.actionTitle}>
              Research Anything
            </Text>

            <Text style={styles.actionText}>
              Explore questions and discover deeper answers.
            </Text>

            <Text style={styles.actionArrow}>
              Research →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pro Banner */}
        <TouchableOpacity
          style={styles.proBanner}
          activeOpacity={0.85}
          onPress={() => router.push("/pro")}
        >
          <View style={styles.proGlow} />

          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>
              ZURI PRO
            </Text>
          </View>

          <View style={styles.proContent}>
            <Text style={styles.proTitle}>
              Unlock more of Zuri.
            </Text>

            <Text style={styles.proText}>
              Get enhanced intelligence, deeper research,
              better memory and more powerful creative tools.
            </Text>
          </View>

          <View style={styles.proButton}>
            <Text style={styles.proButtonText}>
              Explore Pro
            </Text>

            <Text style={styles.proButtonArrow}>
              →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Recent Conversations */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionEyebrow}>
            CONTINUE
          </Text>

          <Text style={styles.sectionTitle}>
            Recent conversations
          </Text>

          <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
  <Image
    source={require("../asset/images/zuri-icon.png.png.png")}
    style={styles.emptyLogo}
    resizeMode="contain"
  />
</View>

            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>
                Your ideas will live here
              </Text>

              <Text style={styles.emptyText}>
                Your recent conversations with Zuri will appear
                here so you can continue where you left off.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
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

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={logout}
        >
          <Text style={styles.logoutText}>
            Sign out
          </Text>
        </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: "rgba(16, 224, 212, 0.06)",
    top: -300,
    alignSelf: "center",
  },

  sideGlow: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(247, 200, 115, 0.025)",
    right: -250,
    top: 500,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 45,
    paddingBottom: 130,
  },

  logoSection: {
  marginBottom: 30,
  alignItems: "center",
  justifyContent: "center",
},

  hero: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 70,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B2025",
    borderWidth: 1,
    borderColor: "#16363C",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 22,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10E0D4",
    marginRight: 8,
  },

  statusText: {
    color: "#8EA5A8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  greeting: {
    color: "#F5F7F6",
    fontSize: 46,
    lineHeight: 53,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
  },

  subtitle: {
    color: "#819396",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    maxWidth: 610,
    marginTop: 18,
    marginBottom: 32,
  },

  chatButton: {
    width: "100%",
    maxWidth: 620,
    minHeight: 82,
    backgroundColor: "#0B1C21",
    borderWidth: 1,
    borderColor: "#1C454B",
    borderRadius: 24,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  chatButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#103137",
    borderWidth: 1,
    borderColor: "#1A575B",
    justifyContent: "center",
    alignItems: "center",
  },

  chatButtonIconText: {
    color: "#F7C873",
    fontSize: 22,
  },

  chatButtonContent: {
    flex: 1,
    marginLeft: 15,
  },

  chatButtonText: {
    color: "#F4F7F5",
    fontSize: 16,
    fontWeight: "800",
  },

  chatButtonSubtext: {
    color: "#71878A",
    fontSize: 12,
    marginTop: 4,
  },

  chatArrow: {
    color: "#10E0D4",
    fontSize: 24,
  },

  sectionHeader: {
    marginBottom: 20,
  },

  sectionEyebrow: {
    color: "#10E0D4",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 7,
  },

sectionTitle: {
  color: "#F2F5F3",
  fontSize: 25,
  fontWeight: "800",
},

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 55,
  },

  actionCard: {
    flexGrow: 1,
    flexBasis: 230,
    minHeight: 220,
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 22,
    padding: 22,
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  actionIconText: {
    color: "#F7C873",
    fontSize: 20,
    fontWeight: "800",
  },

  actionTitle: {
    color: "#F1F4F2",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 9,
  },

  actionText: {
    color: "#71878A",
    fontSize: 13,
    lineHeight: 21,
    flex: 1,
  },

  actionArrow: {
    color: "#10E0D4",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 20,
  },

  proBanner: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0B1C20",
    borderWidth: 1,
    borderColor: "#66532E",
    borderRadius: 26,
    padding: 27,
    marginBottom: 60,
  },

  proGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(247, 200, 115, 0.06)",
    right: -60,
    top: -100,
  },

  proBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#2A2518",
    borderWidth: 1,
    borderColor: "#5D4C2D",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 16,
  },

  proBadgeText: {
    color: "#F7C873",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  proContent: {
    maxWidth: 650,
  },

  proTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },

  proText: {
    color: "#829598",
    fontSize: 14,
    lineHeight: 23,
    marginTop: 9,
    maxWidth: 580,
  },

  proButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7C873",
    borderRadius: 14,
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginTop: 22,
  },

  proButtonText: {
    color: "#101514",
    fontSize: 13,
    fontWeight: "900",
  },

  proButtonArrow: {
    color: "#101514",
    marginLeft: 8,
    fontSize: 16,
  },

  recentSection: {
    marginBottom: 45,
  },

emptyCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#09171B",
  borderWidth: 1,
  borderColor: "#162B30",
  borderRadius: 22,
  padding: 22,
  marginTop: 18,
},

emptyIcon: {
  width: 48,
  height: 48,
  borderRadius: 16,
  backgroundColor: "#10282E",
  borderWidth: 1,
  borderColor: "#294249",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 17,
},

emptyLogo: {
  width: 34,
  height: 34,
},

  emptyIconText: {
    color: "#F7C873",
    fontSize: 20,
    fontWeight: "900",
  },

  emptyContent: {
    flex: 1,
  },

  emptyTitle: {
    color: "#F1F4F2",
    fontSize: 16,
    fontWeight: "800",
  },

  emptyText: {
    color: "#71878A",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },

  footerText: {
    color: "#F7C873",
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

  logoutButton: {
    alignSelf: "center",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27373B",
  },

  logoutText: {
    color: "#839598",
    fontSize: 13,
    fontWeight: "700",
  },
});