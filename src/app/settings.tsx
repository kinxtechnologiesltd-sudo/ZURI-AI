import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useState } from "react";
import AthenaLogo from "../components/ui/AthenaLogo";
import BottomNav from "../components/ui/BottomNav";
import { usePreferences } from "../context/PreferencesContext";
export default function Settings() {
const {
  voiceGender,
  setVoiceGender,
  preferredName,
  setPreferredName,
  responseStyle,
  setResponseStyle,
  responseLength,
  setResponseLength,
} = usePreferences();
const [showVoiceOptions, setShowVoiceOptions] =
  useState(false);
  const [
  showPersonalization,
  setShowPersonalization,
] = useState(false);
  return (
    <View style={styles.root}>
      <View style={styles.topGlow} />
      <View style={styles.goldGlow} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <AthenaLogo />
        </View>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR EXPERIENCE</Text>

          <Text style={styles.title}>Settings</Text>

          <Text style={styles.subtitle}>
            Personalize how Zuri looks, sounds, and works for you.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>ZURI EXPERIENCE</Text>

        <View style={styles.settingsCard}>
          <TouchableOpacity
  style={styles.voiceSetting}
  activeOpacity={0.7}
  onPress={() =>
    setShowVoiceOptions(!showVoiceOptions)
  }
>
  <View style={styles.settingIcon}>
    <Text style={styles.settingIconText}>
      ◉
    </Text>
  </View>

  <View style={styles.settingContent}>
    <Text style={styles.settingTitle}>
      Voice
    </Text>

    <Text style={styles.settingSubtitle}>
      {voiceGender === "female"
        ? "Feminine voice selected"
        : "Masculine voice selected"}
    </Text>
  </View>

  <Text style={styles.voiceChevron}>
    {showVoiceOptions ? "⌃" : "⌄"}
  </Text>
</TouchableOpacity>

{showVoiceOptions && (
  <View style={styles.voiceOptions}>
    <TouchableOpacity
      style={[
        styles.voiceOption,
        voiceGender === "female" &&
          styles.voiceOptionActive,
      ]}
      onPress={() => {
        setVoiceGender("female");
        setShowVoiceOptions(false);
      }}
    >
      <View style={styles.voiceOptionContent}>
        <Text style={styles.voiceOptionTitle}>
          Feminine voice
        </Text>

        <Text style={styles.voiceOptionSubtitle}>
          Zuri's default voice experience
        </Text>
      </View>

      <View
        style={[
          styles.radioOuter,
          voiceGender === "female" &&
            styles.radioOuterActive,
        ]}
      >
        {voiceGender === "female" && (
          <View style={styles.radioInner} />
        )}
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.voiceOption,
        voiceGender === "male" &&
          styles.voiceOptionActive,
      ]}
      onPress={() => {
        setVoiceGender("male");
        setShowVoiceOptions(false);
      }}
    >
      <View style={styles.voiceOptionContent}>
        <Text style={styles.voiceOptionTitle}>
          Masculine voice
        </Text>

        <Text style={styles.voiceOptionSubtitle}>
          An alternative Zuri voice
        </Text>
      </View>

      <View
        style={[
          styles.radioOuter,
          voiceGender === "male" &&
            styles.radioOuterActive,
        ]}
      >
        {voiceGender === "male" && (
          <View style={styles.radioInner} />
        )}
      </View>
    </TouchableOpacity>
  </View>
)}

          <Divider />

          <SettingItem
  icon="✦"
  title="Memory"
  subtitle="Manage what Zuri remembers about you"
  onPress={() => router.push("/memory")}
/>
          <Divider />

<TouchableOpacity
  style={styles.personalizationHeader}
  activeOpacity={0.7}
  onPress={() =>
    setShowPersonalization(!showPersonalization)
  }
>
  <View style={styles.settingIcon}>
    <Text style={styles.settingIconText}>
      ◇
    </Text>
  </View>

  <View style={styles.settingContent}>
    <Text style={styles.settingTitle}>
      Personalization
    </Text>

    <Text style={styles.settingSubtitle}>
      Customize how Zuri responds to you
    </Text>
  </View>

  <Text style={styles.voiceChevron}>
    {showPersonalization ? "⌃" : "⌄"}
  </Text>
</TouchableOpacity>

{showPersonalization && (
  <View style={styles.personalizationPanel}>
    <Text style={styles.preferenceLabel}>
      WHAT SHOULD ZURI CALL YOU?
    </Text>

    <TextInput
      value={preferredName}
      onChangeText={setPreferredName}
      placeholder="Enter your preferred name"
      placeholderTextColor="#536B6F"
      style={styles.nameInput}
    />

    <Text style={styles.preferenceLabel}>
      RESPONSE STYLE
    </Text>

    <View style={styles.optionGrid}>
      {[
        ["balanced", "Balanced"],
        ["professional", "Professional"],
        ["friendly", "Friendly"],
        ["creative", "Creative"],
      ].map(([value, label]) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.preferenceOption,
            responseStyle === value &&
              styles.preferenceOptionActive,
          ]}
          onPress={() =>
            setResponseStyle(value as any)
          }
        >
          <Text
            style={[
              styles.preferenceOptionText,
              responseStyle === value &&
                styles.preferenceOptionTextActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.preferenceLabel}>
      RESPONSE LENGTH
    </Text>

    <View style={styles.optionGrid}>
      {[
        ["concise", "Concise"],
        ["balanced", "Balanced"],
        ["detailed", "Detailed"],
      ].map(([value, label]) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.preferenceOption,
            responseLength === value &&
              styles.preferenceOptionActive,
          ]}
          onPress={() =>
            setResponseLength(value as any)
          }
        >
          <Text
            style={[
              styles.preferenceOptionText,
              responseLength === value &&
                styles.preferenceOptionTextActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <View style={styles.settingsCard}>
          <SettingItem
            icon="◌"
            title="Profile"
            subtitle="View and manage your account"
            onPress={() => router.push("/profile")}
          />

          <Divider />

          <SettingItem
            icon="⌁"
            title="Conversation History"
            subtitle="View your previous conversations"
            onPress={() => router.push("/history")}
          />

          <Divider />

          <SettingItem
            icon="♢"
            title="Subscription"
            subtitle="Manage your Zuri plan"
          />
        </View>

        <Text style={styles.sectionLabel}>PRIVACY & DATA</Text>

        <View style={styles.settingsCard}>
          <SettingItem
            icon="▣"
            title="Data Controls"
            subtitle="Manage your conversations and stored data"
          />

          <Divider />

          <SettingItem
            icon="⌾"
            title="Privacy"
            subtitle="Review your privacy preferences"
          />
        </View>

        <Text style={styles.sectionLabel}>ABOUT</Text>

        <View style={styles.settingsCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Assistant</Text>
            <Text style={styles.infoValue}>Zuri</Text>
          </View>

          <Divider />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <Divider />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created by</Text>
            <Text style={styles.kinxValue}>KINX</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerZuri}>ZURI</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerText}>Powered by KINX</Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

type SettingItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.settingIconText}>{icon}</Text>
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>

        <Text style={styles.settingSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    personalizationHeader: {
  minHeight: 82,
  flexDirection: "row",
  alignItems: "center",
},

personalizationPanel: {
  marginLeft: 56,
  paddingRight: 5,
  paddingBottom: 20,
},

preferenceLabel: {
  color: "#789094",
  fontSize: 9,
  fontWeight: "900",
  letterSpacing: 1.4,
  marginTop: 12,
  marginBottom: 9,
},

nameInput: {
  height: 48,
  backgroundColor: "#0C1D21",
  borderWidth: 1,
  borderColor: "#29464C",
  borderRadius: 14,
  color: "#F3F4EF",
  paddingHorizontal: 14,
  fontSize: 13,
  marginBottom: 12,
  outlineStyle: "none",
} as any,

optionGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 10,
},

preferenceOption: {
  backgroundColor: "#0C1D21",
  borderWidth: 1,
  borderColor: "#1D383D",
  borderRadius: 12,
  paddingHorizontal: 13,
  paddingVertical: 10,
},

preferenceOptionActive: {
  backgroundColor: "#292515",
  borderColor: "#D4A72C",
},

preferenceOptionText: {
  color: "#71878A",
  fontSize: 11,
  fontWeight: "700",
},

preferenceOptionTextActive: {
  color: "#E1B94D",
},
    voiceSetting: {
  minHeight: 82,
  flexDirection: "row",
  alignItems: "center",
},

voiceChevron: {
  color: "#D4A72C",
  fontSize: 20,
  marginLeft: 10,
},

voiceOptions: {
  paddingBottom: 14,
  marginLeft: 56,
},

voiceOption: {
  minHeight: 64,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#0C1D21",
  borderWidth: 1,
  borderColor: "#193237",
  borderRadius: 15,
  paddingHorizontal: 14,
  marginBottom: 8,
},

voiceOptionActive: {
  backgroundColor: "#10282E",
  borderColor: "#2C625F",
},

voiceOptionContent: {
  flex: 1,
},

voiceOptionTitle: {
  color: "#EDF2EF",
  fontSize: 13,
  fontWeight: "800",
},

voiceOptionSubtitle: {
  color: "#657A7D",
  fontSize: 10,
  marginTop: 4,
},

radioOuter: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: "#40575A",
  justifyContent: "center",
  alignItems: "center",
},

radioOuterActive: {
  borderColor: "#D4A72C",
},

radioInner: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "#D4A72C",
},
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

  goldGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(212, 167, 44, 0.025)",
    left: -190,
    top: 500,
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
    marginBottom: 35,
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
    maxWidth: 550,
  },

  sectionLabel: {
    color: "#10E0D4",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 11,
    marginTop: 10,
  },

  settingsCard: {
    backgroundColor: "#09171B",
    borderWidth: 1,
    borderColor: "#162B30",
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 30,
    overflow: "hidden",
  },

  settingItem: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
  },

  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#10282E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  settingIconText: {
    color: "#D4A72C",
    fontSize: 18,
    fontWeight: "800",
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    color: "#EEF2EF",
    fontSize: 15,
    fontWeight: "800",
  },

  settingSubtitle: {
    color: "#657A7D",
    fontSize: 11,
    marginTop: 5,
  },

  arrow: {
    color: "#536B6F",
    fontSize: 19,
    marginLeft: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#15292E",
    marginLeft: 56,
  },

  infoRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoLabel: {
    color: "#71878A",
    fontSize: 12,
  },

  infoValue: {
    color: "#D6DFDB",
    fontSize: 12,
    fontWeight: "700",
  },

  kinxValue: {
    color: "#D4A72C",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
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