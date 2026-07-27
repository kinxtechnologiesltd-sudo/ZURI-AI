import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AthenaLogo from "../components/ui/AthenaLogo";
import BottomNav from "../components/ui/BottomNav";
import { auth } from "../firebase/firebaseConfig";
import {
  addMemory,
  deleteMemory,
  getMemories,
  ZuriMemory,
} from "../hooks/memoryService";

export default function Memory() {
  const [memories, setMemories] = useState<ZuriMemory[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const loadMemories = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getMemories();

      setMemories(data);
    } catch (error) {
      console.error(
        "Failed to load memories:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setMemories([]);
          setLoading(false);
          return;
        }

        await loadMemories();
      }
    );

    return unsubscribe;
  }, [loadMemories]);
console.log("🔥 Save Memory button pressed");
const handleAddMemory = async () => {
  const cleanMemory = newMemory.trim();

  if (!cleanMemory || saving) {
    return;
  }

  try {
    setSaving(true);

    console.log("Saving memory for user:", auth.currentUser?.uid);
    console.log("Memory content:", cleanMemory);

    await addMemory(cleanMemory);

    console.log("✅ Memory successfully written.");

    setNewMemory("");

    await loadMemories();
  } catch (error: any) {
    console.error("🔥 Full save error:", error);

    Alert.alert(
      "Save Error",
      error?.message || JSON.stringify(error)
    );
  } finally {
    setSaving(false);
  }
};
  const handleDeleteMemory = async (
    memoryId: string
  ) => {
    if (deletingId) {
      return;
    }

    try {
      setDeletingId(memoryId);

      await deleteMemory(memoryId);

      setMemories((currentMemories) =>
        currentMemories.filter(
          (memory) => memory.id !== memoryId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete memory:",
        error
      );

      Alert.alert(
        "Couldn't delete memory",
        "Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topGlow} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <AthenaLogo />
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            PERSONAL MEMORY
          </Text>

          <Text style={styles.title}>
            Zuri's Memory
          </Text>

          <Text style={styles.subtitle}>
            Manage information Zuri can remember to make
            your conversations more personal and useful.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>
              ✦
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Your memory, your control
            </Text>

            <Text style={styles.infoText}>
              Add information you want Zuri to remember and
              remove it whenever you want.
            </Text>
          </View>
        </View>

        {/* Add Memory */}

        <View style={styles.addMemoryCard}>
          <Text style={styles.addMemoryLabel}>
            ADD A MEMORY
          </Text>

          <Text style={styles.addMemoryTitle}>
            What should Zuri remember?
          </Text>

          <TextInput
            value={newMemory}
            onChangeText={setNewMemory}
            placeholder="Example: I prefer TypeScript over JavaScript."
            placeholderTextColor="#536B6F"
            multiline
            maxLength={500}
            style={styles.memoryInput}
          />

          <View style={styles.inputFooter}>
            <Text style={styles.characterCount}>
              {newMemory.length}/500
            </Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!newMemory.trim() || saving) &&
                  styles.saveButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={!newMemory.trim() || saving}
              onPress={handleAddMemory}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="#061014"
                />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save memory
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Memory Header */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>
              SAVED MEMORIES
            </Text>

            <Text style={styles.sectionTitle}>
              What Zuri remembers
            </Text>
          </View>

          <View style={styles.memoryCount}>
            <Text style={styles.memoryCountText}>
              {memories.length}
            </Text>
          </View>
        </View>

        {/* Loading */}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#10E0D4"
            />

            <Text style={styles.loadingText}>
              Loading memories...
            </Text>
          </View>
        ) : memories.length === 0 ? (
          /* Empty State */

          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                ◇
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No memories yet
            </Text>

            <Text style={styles.emptyText}>
              Add something above that you'd like Zuri to
              remember about your preferences, goals or
              interests.
            </Text>

            <TouchableOpacity
              style={styles.chatButton}
              activeOpacity={0.8}
              onPress={() => router.push("/chat")}
            >
              <Text style={styles.chatButtonText}>
                Chat with Zuri
              </Text>

              <Text style={styles.chatButtonArrow}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Saved Memories */

          <View style={styles.memoryList}>
            {memories.map((memory) => (
              <View
                key={memory.id}
                style={styles.memoryCard}
              >
                <View style={styles.memoryIcon}>
                  <Text style={styles.memoryIconText}>
                    ✦
                  </Text>
                </View>

                <View style={styles.memoryContent}>
                  <Text style={styles.memoryText}>
                    {memory.content}
                  </Text>

                  <Text style={styles.memoryMeta}>
                    Saved to Zuri's memory
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                  disabled={
                    deletingId === memory.id
                  }
                  onPress={() =>
                    handleDeleteMemory(memory.id)
                  }
                >
                  {deletingId === memory.id ? (
                    <ActivityIndicator
                      size="small"
                      color="#D98087"
                    />
                  ) : (
                    <Text style={styles.deleteText}>
                      Delete
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>
            Memory & privacy
          </Text>

          <Text style={styles.privacyText}>
            Your saved memories belong to your account and
            are protected by your Firestore security rules.
            You can remove individual memories whenever you
            want.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerZuri}>
            ZURI
          </Text>

          <Text style={styles.footerDot}>
            •
          </Text>

          <Text style={styles.footerText}>
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
    backgroundColor: "rgba(16, 224, 212, 0.05)",
    top: -330,
    alignSelf: "center",
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

  header: {
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
    marginTop: 9,
    maxWidth: 580,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A1A1E",
    borderWidth: 1,
    borderColor: "#294B4D",
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#102D31",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  infoIconText: {
    color: "#D4A72C",
    fontSize: 19,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#EEF3F0",
    fontSize: 14,
    fontWeight: "800",
  },

  infoText: {
    color: "#71878A",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
  },

  addMemoryCard: {
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#1C353A",
    borderRadius: 22,
    padding: 19,
    marginBottom: 38,
  },

  addMemoryLabel: {
    color: "#D4A72C",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  addMemoryTitle: {
    color: "#EEF2EF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 7,
    marginBottom: 14,
  },

  memoryInput: {
    minHeight: 105,
    backgroundColor: "#0C1D21",
    borderWidth: 1,
    borderColor: "#29464C",
    borderRadius: 16,
    color: "#F3F4EF",
    padding: 14,
    fontSize: 13,
    lineHeight: 20,
    textAlignVertical: "top",
  },

  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  characterCount: {
    color: "#536B6F",
    fontSize: 10,
  },

  saveButton: {
    minWidth: 115,
    minHeight: 42,
    backgroundColor: "#D4A72C",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  saveButtonDisabled: {
    opacity: 0.4,
  },

  saveButtonText: {
    color: "#061014",
    fontSize: 11,
    fontWeight: "900",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  sectionEyebrow: {
    color: "#10E0D4",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 5,
  },

  sectionTitle: {
    color: "#F1F4F2",
    fontSize: 21,
    fontWeight: "800",
  },

  memoryCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
  },

  memoryCountText: {
    color: "#D4A72C",
    fontSize: 11,
    fontWeight: "900",
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },

  loadingText: {
    color: "#71878A",
    fontSize: 12,
    marginTop: 14,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 48,
    marginBottom: 25,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyIconText: {
    color: "#D4A72C",
    fontSize: 24,
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
    maxWidth: 380,
    marginTop: 8,
  },

  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4A72C",
    borderRadius: 13,
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginTop: 22,
  },

  chatButtonText: {
    color: "#061014",
    fontSize: 12,
    fontWeight: "900",
  },

  chatButtonArrow: {
    color: "#061014",
    fontSize: 15,
    marginLeft: 8,
  },

  memoryList: {
    marginBottom: 25,
  },

  memoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
  },

  memoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  memoryIconText: {
    color: "#D4A72C",
    fontSize: 15,
  },

  memoryContent: {
    flex: 1,
  },

  memoryText: {
    color: "#E7ECE9",
    fontSize: 13,
    lineHeight: 20,
  },

  memoryMeta: {
    color: "#536B6F",
    fontSize: 9,
    marginTop: 5,
  },

  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
  },

  deleteText: {
    color: "#D98087",
    fontSize: 10,
    fontWeight: "800",
  },

  privacyCard: {
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 20,
    padding: 19,
    marginBottom: 40,
  },

  privacyTitle: {
    color: "#D7DFDB",
    fontSize: 13,
    fontWeight: "800",
  },

  privacyText: {
    color: "#657A7D",
    fontSize: 11,
    lineHeight: 19,
    marginTop: 7,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  footerZuri: {
    color: "#D4A72C",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footerDot: {
    color: "#40565A",
    marginHorizontal: 9,
  },

  footerText: {
    color: "#607578",
    fontSize: 11,
  },
});