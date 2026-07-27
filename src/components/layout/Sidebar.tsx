import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useConversation } from "../../context/ConversationContext";
import { createConversation } from "../../hooks/conversationService";

import ConversationList from "./ConversationList";
import SearchBar from "./SearchBar";
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

// Give Firestore a moment to finish writing
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

      <View style={styles.searchContainer}>
        <SearchBar />
      </View>

      <Text style={styles.sectionTitle}>
        RECENT CONVERSATIONS
      </Text>

      <View style={styles.listContainer}>
        <ConversationList />
      </View>

      <SidebarFooter />
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  width: 300,
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
  marginBottom: 18,


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

  searchContainer: {
    marginBottom: 16,
  },

  sectionTitle: {
  color: "#7C8AA5",
  fontSize: 12,
  fontWeight: "700",
  marginBottom: 12,
  letterSpacing: 1,
},

  listContainer: {
    flex: 1,
  },
});