import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

type ConversationContextType = {
  currentConversationId: string | null;
  setCurrentConversationId: (
    id: string | null
  ) => void;

  refreshConversations: number;
  triggerConversationRefresh: () => void;
};

const ConversationContext =
  createContext<ConversationContextType | null>(null);

export function ConversationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentConversationId, setCurrentConversationId] =
    useState<string | null>(null);

  const [refreshConversations, setRefreshConversations] =
    useState(0);

  const triggerConversationRefresh = () => {
    setRefreshConversations((prev) => prev + 1);
  };

  return (
    <ConversationContext.Provider
      value={{
        currentConversationId,
        setCurrentConversationId,
        refreshConversations,
        triggerConversationRefresh,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);

  if (!context) {
    throw new Error(
      "useConversation must be used inside ConversationProvider"
    );
  }

  return context;
}