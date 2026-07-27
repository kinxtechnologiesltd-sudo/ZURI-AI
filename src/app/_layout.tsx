import { Stack } from "expo-router";
import { ConversationProvider } from "../context/ConversationContext";
import { PreferencesProvider } from "../context/PreferencesContext";

export default function Layout() {
  return (
    <ConversationProvider>
      <PreferencesProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PreferencesProvider>
    </ConversationProvider>
  );
}