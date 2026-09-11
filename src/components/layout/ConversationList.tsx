import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getConversations } from "../../hooks/conversationService";

type ConversationListProps = {
  activeConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
};

export default function ConversationList({
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<
    Awaited<ReturnType<typeof getConversations>>
  >([]);

  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getConversations();

      setConversations(() => data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#DCE7E8" />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No conversations yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const isActive = item.id === activeConversationId;

        return (
          <TouchableOpacity
            style={[
              styles.conversationItem,
              isActive && styles.activeConversationItem,
            ]}
            activeOpacity={0.75}
            onPress={() => onSelectConversation?.(item.id)}
          >
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  isActive && styles.activeTitle,
                ]}
                numberOfLines={1}
              >
                {item.title || "New conversation"}
              </Text>
            </View>

            {onDeleteConversation && (
              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.7}
                onPress={() => onDeleteConversation(item.id)}
                hitSlop={{
                  top: 8,
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
              >
                <Text style={styles.deleteText}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#7F8C8D",
    fontSize: 13,
  },

  listContent: {
    paddingVertical: 6,
  },

  conversationItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  activeConversationItem: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: "#B8C5C7",
    fontSize: 14,
    lineHeight: 20,
  },

  activeTitle: {
    color: "#FFFFFF",
  },

  deleteButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  deleteText: {
    color: "#7F8C8D",
    fontSize: 22,
    lineHeight: 24,
  },
});