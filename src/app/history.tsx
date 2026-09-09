import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AthenaLogo from "../components/ui/AthenaLogo";
import BottomNav from "../components/ui/BottomNav";
import { useConversation } from "../context/ConversationContext";
import { auth } from "../firebase/firebaseConfig";
import { getConversations } from "../hooks/conversationService";

type Conversation = {
  id: string;
  title: string;
};

export default function History() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [loading, setLoading] = useState(true);

  const {
    currentConversationId,
    setCurrentConversationId,
    refreshConversations,
  } = useConversation();

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!mounted) return;

        if (!user) {
          setConversations([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);

          const data = await getConversations();

          if (mounted) {
            setConversations(data);
          }
        } catch (error) {
          console.error(
            "Failed to load conversation history:",
            error
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [refreshConversations]);

  const openConversation = (
    conversationId: string
  ) => {
    setCurrentConversationId(conversationId);

    router.push("/chat");
  };

  const startNewChat = () => {
    setCurrentConversationId(null);

    router.push("/chat");
  };

  return (
    <View style={styles.root}>
      {/* Decorative background glow */}
      <View style={styles.topGlow} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Zuri Logo */}
        <View style={styles.logoSection}>
          <AthenaLogo />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            YOUR CONVERSATIONS
          </Text>

          <Text style={styles.title}>
            Conversation History
          </Text>

          <Text style={styles.subtitle}>
            Return to your previous conversations and
            continue exploring ideas with Zuri.
          </Text>
        </View>

        {/* New Chat */}
        <TouchableOpacity
          style={styles.newChatButton}
          activeOpacity={0.85}
          onPress={startNewChat}
        >
          <View style={styles.newChatIcon}>
            <Text style={styles.newChatIconText}>
              +
            </Text>
          </View>

          <View style={styles.newChatContent}>
            <Text style={styles.newChatText}>
              Start a new conversation
            </Text>

            <Text style={styles.newChatSubtext}>
              Begin something new with Zuri
            </Text>
          </View>

          <Text style={styles.newChatArrow}>
            →
          </Text>
        </TouchableOpacity>

        {/* Conversation List */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent conversations
            </Text>

            {!loading && (
              <Text style={styles.conversationCount}>
                {conversations.length}
              </Text>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#10E0D4"
              />

              <Text style={styles.loadingText}>
                Loading your conversations...
              </Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ◇
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                No conversations yet
              </Text>

              <Text style={styles.emptyText}>
                Start chatting with Zuri and your
                conversations will appear here.
              </Text>

              <TouchableOpacity
                style={styles.emptyButton}
                onPress={startNewChat}
              >
                <Text style={styles.emptyButtonText}>
                  Start chatting
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.conversationList}>
              {conversations.map((conversation) => {
                const isActive =
                  currentConversationId ===
                  conversation.id;

                return (
                  <TouchableOpacity
                    key={conversation.id}
                    activeOpacity={0.8}
                    onPress={() =>
                      openConversation(
                        conversation.id
                      )
                    }
                    style={[
                      styles.conversationCard,
                      isActive &&
                        styles.activeConversationCard,
                    ]}
                  >
                    <View
                      style={[
                        styles.conversationIcon,
                        isActive &&
                          styles.activeConversationIcon,
                      ]}
                    >
                      <Text
                        style={[
                          styles.conversationIconText,
                          isActive &&
                            styles.activeConversationIconText,
                        ]}
                      >
                        ◇
                      </Text>
                    </View>

                    <View
                      style={
                        styles.conversationContent
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={
                          styles.conversationTitle
                        }
                      >
                        {conversation.title ||
                          "New conversation"}
                      </Text>

                      <Text
                        style={
                          styles.conversationMeta
                        }
                      >
                        {isActive
                          ? "Current conversation"
                          : "Continue conversation"}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.conversationArrow
                      }
                    >
                      →
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

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

  container: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 140,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  header: {
    marginBottom: 30,
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
    marginBottom: 10,
  },

  subtitle: {
    color: "#819396",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 580,
  },

  newChatButton: {
    minHeight: 82,
    backgroundColor: "#D4A72C",
    borderRadius: 22,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 45,
  },

  newChatIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor:
      "rgba(6, 16, 20, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  newChatIconText: {
    color: "#061014",
    fontSize: 27,
    fontWeight: "500",
  },

  newChatContent: {
    flex: 1,
    marginLeft: 15,
  },

  newChatText: {
    color: "#061014",
    fontSize: 16,
    fontWeight: "900",
  },

  newChatSubtext: {
    color: "#283015",
    fontSize: 12,
    marginTop: 4,
  },

  newChatArrow: {
    color: "#061014",
    fontSize: 23,
    fontWeight: "700",
  },

  historySection: {
    marginBottom: 50,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  sectionTitle: {
    color: "#F1F4F2",
    fontSize: 21,
    fontWeight: "800",
  },

  conversationCount: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#10282E",
    color: "#10E0D4",
    textAlign: "center",
    lineHeight: 27,
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 10,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
  },

  loadingText: {
    color: "#71878A",
    fontSize: 13,
    marginTop: 15,
  },

  conversationList: {
    width: "100%",
  },

  conversationCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 19,
    paddingHorizontal: 16,
    marginBottom: 11,
  },

  activeConversationCard: {
    backgroundColor: "#0D2226",
    borderColor: "#2B615F",
  },

  conversationIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#102329",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  activeConversationIcon: {
    backgroundColor: "#123438",
  },

  conversationIconText: {
    color: "#71878A",
    fontSize: 17,
    fontWeight: "700",
  },

  activeConversationIconText: {
    color: "#10E0D4",
  },

  conversationContent: {
    flex: 1,
  },

  conversationTitle: {
    color: "#EDF2EF",
    fontSize: 14,
    fontWeight: "700",
  },

  conversationMeta: {
    color: "#617679",
    fontSize: 10,
    marginTop: 5,
  },

  conversationArrow: {
    color: "#536B6F",
    fontSize: 20,
    marginLeft: 10,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 50,
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyIconText: {
    color: "#D4A72C",
    fontSize: 23,
  },

  emptyTitle: {
    color: "#F1F4F2",
    fontSize: 18,
    fontWeight: "800",
  },

  emptyText: {
    color: "#71878A",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 350,
    marginTop: 8,
  },

  emptyButton: {
    backgroundColor: "#102E32",
    borderWidth: 1,
    borderColor: "#27605F",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 22,
  },

  emptyButtonText: {
    color: "#10E0D4",
    fontSize: 12,
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