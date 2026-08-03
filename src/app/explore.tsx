import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text } from "react-native";

import CreateHeader from "@/components/create/CreateHeader";
import QuickAction from "@/components/create/QuickAction";
import CreateCard from "../components/create/CreateCard";

export default function ExploreScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <CreateHeader />

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 10,
        }}
      >
        <QuickAction
          title="Images"
          icon={
            <Ionicons
              name="image-outline"
              size={28}
              color="#10E0D4"
            />
          }
          onPress={() => {}}
        />

        <QuickAction
          title="Videos"
          icon={
            <Ionicons
              name="videocam-outline"
              size={28}
              color="#D4A72C"
            />
          }
          onPress={() => {}}
        />

        <QuickAction
          title="Comics"
          icon={
            <Ionicons
              name="book-outline"
              size={28}
              color="#8B5CF6"
            />
          }
          onPress={() => {}}
        />

        <QuickAction
          title="Design"
          icon={
            <Ionicons
              name="color-palette-outline"
              size={28}
              color="#22C55E"
            />
          }
          onPress={() => {}}
        />

        <QuickAction
          title="Apps"
          icon={
            <Ionicons
              name="phone-portrait-outline"
              size={28}
              color="#3B82F6"
            />
          }
          onPress={() => {}}
        />
      </ScrollView>

      <Text style={styles.sectionTitle}>
        AI Studios
      </Text>

      <CreateCard
        icon="🎨"
        title="Image Studio"
        description="Generate, edit and enhance AI images."
        onPress={() => {}}
      />

      <CreateCard
        icon="🎬"
        title="Video Studio"
        description="Create cinematic AI videos in seconds."
        onPress={() => {}}
      />

      <CreateCard
        icon="📖"
        title="Comic Studio"
        description="Generate comics, manga and webtoons."
        onPress={() => {}}
      />

      <CreateCard
        icon="💼"
        title="Design Studio"
        description="Flyers, logos, posters, branding and more."
        onPress={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061014",
  },

  content: {
    padding: 24,
    paddingBottom: 140,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 18,
  },
});