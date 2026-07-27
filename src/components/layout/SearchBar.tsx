import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          placeholder="Search conversations"
          placeholderTextColor="#60777A"
          style={styles.input}
        />

        <View style={styles.shortcut}>
          <Text style={styles.shortcutText}>⌘ K</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  searchBox: {
    height: 48,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#0B191E",

    borderRadius: 15,

    borderWidth: 1,
    borderColor: "#1C353A",

    paddingHorizontal: 13,
  },

  searchIcon: {
    color: "#19BDB3",
    fontSize: 20,
    marginRight: 9,
  },

  input: {
    flex: 1,
    height: "100%",

    color: "#EDF1EE",

    fontSize: 13,

    outlineStyle: "none",
  } as any,

  shortcut: {
    backgroundColor: "#10272C",

    borderWidth: 1,
    borderColor: "#263F44",

    borderRadius: 7,

    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  shortcutText: {
    color: "#71888B",

    fontSize: 8,
    fontWeight: "700",
  },
});