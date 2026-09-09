import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SearchBarProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  onSend?: () => void;
  onVoice?: () => void;
};

export default function SearchBar({
  value = "",
  onChangeText,
  onSend,
  onVoice,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>

        <Text style={styles.searchIcon}>
          ✨
        </Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="What shall we create today?"
          placeholderTextColor="#70888C"
          style={styles.input}
          multiline
        />

        {value.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={onSend}
          >
            <Text style={styles.actionIcon}>
              ↑
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.voiceButton}
            activeOpacity={0.85}
            onPress={onVoice}
          >
            <Text style={styles.voiceIcon}>
              🎙
            </Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 22,
    marginBottom: 24,
  },

  searchBox: {
    minHeight: 62,

    flexDirection: "row",
    alignItems: "flex-end",

    backgroundColor: "#0B191E",

    borderRadius: 24,

    borderWidth: 1,
    borderColor: "#1C353A",

    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 8,
  },

  searchIcon: {
    color: "#19BDB3",
    fontSize: 20,
    marginRight: 12,
    marginBottom: 14,
  },

  input: {
    flex: 1,

    color: "#EDF1EE",

    fontSize: 16,

    maxHeight: 120,

    paddingTop: 10,
    paddingBottom: 10,

    outlineStyle: "none",
  } as any,

  actionButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: "#D9A441",

    justifyContent: "center",
    alignItems: "center",
  },

  actionIcon: {
    color: "#061014",
    fontSize: 22,
    fontWeight: "900",
  },

  voiceButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: "#10272C",

    borderWidth: 1,
    borderColor: "#23454A",

    justifyContent: "center",
    alignItems: "center",
  },

  voiceIcon: {
    fontSize: 18,
  },
});