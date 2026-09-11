import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useConversation } from "../../context/ConversationContext";
import { createConversation } from "../../hooks/conversationService";

import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";

export default function Sidebar() {
  const {
    setCurrentConversationId,
    triggerConversationRefresh,
  } = useConversation();

  const handleNewChat = async () => {
    const id = await createConversation();

    if (!id) return;

    setCurrentConversationId(id);

    setTimeout(() => {
      triggerConversationRefresh();
    }, 300);

    console.log("New Conversation:", id);
  };

  return (
    <View style={styles.container}>
      <SidebarHeader />

      <TouchableOpacity
        style={styles.newChatButton}
        activeOpacity={0.9}
        onPress={handleNewChat}
      >
        <Text style={styles.newChatText}>
          + New Chat
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.brandContent}
        contentContainerStyle={styles.brandContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            POWERED BY KINX
          </Text>
        </View>

        <Text style={styles.headline}>
          AFRICA IS{"\n"}BUILDING.
        </Text>

        <Text style={styles.bodyText}>
          We are not waiting for the future
          to arrive.
        </Text>

        <Text style={styles.bodyText}>
          We are building it — one idea,
          one creator, one line of code at
          a time.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.subHeadline}>
          Zuri is only the beginning.
        </Text>

        <Text style={styles.bodyText}>
          A smarter, deeper and more
          powerful Zuri is coming.
        </Text>

        <View style={styles.v2Card}>
          <Text style={styles.v2Small}>
            SOMETHING BIG IS COMING
          </Text>

          <Text style={styles.v2Title}>
            WATCH OUT FOR
          </Text>

          <Text style={styles.v2Logo}>
            ZURI V2
          </Text>

          <Text style={styles.v2Description}>
            The next chapter of
            African-built intelligence.
          </Text>
        </View>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            “The future isn't somewhere else.”
          </Text>

          <Text style={styles.quoteAccent}>
            IT'S BEING BUILT HERE.
          </Text>
        </View>
      </ScrollView>

      <SidebarFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    flexShrink: 0,
    height: "100%",
    backgroundColor: "#050816",
    borderRightWidth: 1,
    borderRightColor: "#1E293B",
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },

  newChatButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#2563EB",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
  },

  newChatText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  brandContent: {
    flex: 1,
  },

  brandContentContainer: {
    paddingTop: 8,
    paddingBottom: 25,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#10252A",
    borderWidth: 1,
    borderColor: "#1B444B",
    marginBottom: 20,
  },

  badgeText: {
    color: "#38D9CF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  headline: {
    color: "#F5F3EC",
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 17,
  },

  bodyText: {
    color: "#8FA1A5",
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 11,
  },

  divider: {
    height: 1,
    backgroundColor: "#193239",
    marginVertical: 15,
  },

  subHeadline: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    marginBottom: 7,
  },

  v2Card: {
    marginTop: 15,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#0D2025",
    borderWidth: 1,
    borderColor: "#1A3B42",
  },

  v2Small: {
    color: "#38D9CF",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  v2Title: {
    color: "#7F9296",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  v2Logo: {
    color: "#F5F3EC",
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  v2Description: {
    color: "#718588",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  quote: {
    marginTop: 20,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#38D9CF",
  },

  quoteText: {
    color: "#B7C5C7",
    fontSize: 11,
    lineHeight: 17,
    fontStyle: "italic",
  },

  quoteAccent: {
    color: "#38D9CF",
    fontSize: 8,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 3,
  },
});