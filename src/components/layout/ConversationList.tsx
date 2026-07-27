import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { useConversation } from "../../context/ConversationContext";
import { auth } from "../../firebase/firebaseConfig";
import { getConversations } from "../../hooks/conversationService";
import ConversationItem from "./ConversationItem";

type Conversation = {
  id: string;
  title: string;
};

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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

        setLoading(true);

        const data = await getConversations();

        if (mounted) {
          setConversations(data);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [refreshConversations]);

  if (loading) {
    return (
      <Text style={styles.statusText}>
        Loading conversations...
      </Text>
    );
  }

  if (conversations.length === 0) {
    return (
      <Text style={styles.statusText}>
        No conversations yet
      </Text>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          title={conversation.title}
          active={
            currentConversationId === conversation.id
          }
          onPress={() => {
            setCurrentConversationId(conversation.id);
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statusText: {
    color: "#60777A",
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
});