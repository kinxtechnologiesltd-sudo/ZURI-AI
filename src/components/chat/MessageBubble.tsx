import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MessageBubbleProps = {
  sender: "user" | "ai";
  text: string;
  imageUrl?: string;
};

export default function MessageBubble({
  sender,
  text,
  imageUrl,
}: MessageBubbleProps) {
  const isUser = sender === "user";

  return (
    <View
      style={[
        styles.container,
        isUser
          ? styles.userContainer
          : styles.aiContainer,
      ]}
    >
      {/* Zuri Avatar */}
      {!isUser && (
        <View style={styles.aiAvatarOuter}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>Z</Text>
          </View>

          <View style={styles.onlineDot} />
        </View>
      )}

      {/* Message Content */}
      <View
        style={[
          styles.messageWrapper,
          isUser
            ? styles.userMessageWrapper
            : styles.aiMessageWrapper,
        ]}
      >
        <View
          style={[
            styles.senderRow,
            isUser && styles.userSenderRow,
          ]}
        >
          <Text
            style={[
              styles.sender,
              isUser
                ? styles.userSender
                : styles.zuriSender,
            ]}
          >
            {isUser ? "You" : "Zuri"}
          </Text>

          {!isUser && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>
                KINX AI
              </Text>
            </View>
          )}
        </View>

        {/* Message Bubble */}
        <View
          style={[
            styles.bubble,
            isUser
              ? styles.userBubble
              : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.message,
              isUser
                ? styles.userMessage
                : styles.aiMessage,
            ]}
          >
            {text}
          </Text>
        </View>

        {/* Generated Image */}
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.generatedImage}
              resizeMode="cover"
            />

            <View style={styles.imageLabel}>
              <View style={styles.imageLabelDot} />

              <Text style={styles.imageLabelText}>
                CREATED WITH ZURI
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* User Avatar */}
      {isUser && (
        <View style={styles.userAvatarOuter}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>J</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 26,
  },

  userContainer: {
    justifyContent: "flex-end",
  },

  aiContainer: {
    justifyContent: "flex-start",
  },

  /* Zuri Avatar */

  aiAvatarOuter: {
    position: "relative",

    width: 42,
    height: 42,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "#8A6C36",

    justifyContent: "center",
    alignItems: "center",

    marginHorizontal: 10,
  },

  aiAvatar: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: "#102B31",

    justifyContent: "center",
    alignItems: "center",
  },

  aiAvatarText: {
    color: "#E3B75E",
    fontSize: 18,
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",

    width: 9,
    height: 9,

    borderRadius: 5,

    backgroundColor: "#19D3C5",

    right: -2,
    bottom: 3,

    borderWidth: 2,
    borderColor: "#081216",
  },

  /* User Avatar */

  userAvatarOuter: {
    width: 42,
    height: 42,

    borderRadius: 21,

    borderWidth: 1,
    borderColor: "#31565B",

    justifyContent: "center",
    alignItems: "center",

    marginHorizontal: 10,
  },

  userAvatar: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "#12343A",

    justifyContent: "center",
    alignItems: "center",
  },

  userAvatarText: {
    color: "#EAF3F1",
    fontSize: 14,
    fontWeight: "800",
  },

  /* Message Layout */

  messageWrapper: {
    maxWidth: "75%",
  },

  userMessageWrapper: {
    alignItems: "flex-end",
  },

  aiMessageWrapper: {
    alignItems: "flex-start",
  },

  senderRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 7,
    marginHorizontal: 4,
  },

  userSenderRow: {
    justifyContent: "flex-end",
  },

  sender: {
    fontSize: 11,
    fontWeight: "800",
  },

  userSender: {
    color: "#71888B",
  },

  zuriSender: {
    color: "#D7AD5A",
  },

  aiBadge: {
    marginLeft: 7,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 10,

    backgroundColor: "#102A2E",

    borderWidth: 1,
    borderColor: "#25474B",
  },

  aiBadgeText: {
    color: "#19C8BC",

    fontSize: 6,
    fontWeight: "900",

    letterSpacing: 1,
  },

  /* Message Bubbles */

  bubble: {
    borderRadius: 19,

    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  userBubble: {
    backgroundColor: "#12383D",

    borderWidth: 1,
    borderColor: "#28555A",

    borderTopRightRadius: 6,
  },

  aiBubble: {
    backgroundColor: "#0C1B20",

    borderWidth: 1,
    borderColor: "#1C363B",

    borderTopLeftRadius: 6,
  },

  message: {
    fontSize: 15,
    lineHeight: 24,
  },

  userMessage: {
    color: "#F0F5F3",
  },

  aiMessage: {
    color: "#E4E9E6",
  },

  /* Generated Images */

  imageContainer: {
    width: 420,
    maxWidth: "100%",

    marginTop: 11,

    backgroundColor: "#0B191E",

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#213B40",

    overflow: "hidden",
  },

  generatedImage: {
    width: "100%",
    height: 420,

    backgroundColor: "#0D2025",
  },

  imageLabel: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  imageLabelDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#D7AD5A",

    marginRight: 7,
  },

  imageLabelText: {
    color: "#71888B",

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 1.4,
  },
});