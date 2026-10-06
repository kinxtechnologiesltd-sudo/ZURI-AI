import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { VideoView, useVideoPlayer } from "expo-video";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { saveGeneratedImage } from "./generatedImageDownload";

type ResearchImage = {
  url: string;
  title?: string | null;
  sourceUrl?: string | null;
};

type MessageBubbleProps = {
  sender: "user" | "ai";
  text: string;

  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;

  pdfUrl?: string;
  pdfName?: string;

  researchImages?: ResearchImage[];
};

type MarkdownPart = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: string;
};

function parseInlineMarkdown(
  input: string
): MarkdownPart[] {
  const parts: MarkdownPart[] = [];

  const regex =
    /(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*([^*]+)\*|_([^_]+)_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: input.slice(lastIndex, match.index),
      });
    }

    if (match[2] || match[3]) {
      parts.push({
        text: match[2] || match[3],
        bold: true,
      });
    } else if (match[4]) {
      parts.push({
        text: match[4],
        code: true,
      });
    } else if (match[5] && match[6]) {
      parts.push({
        text: match[5],
        link: match[6],
      });
    } else if (match[7] || match[8]) {
      parts.push({
        text: match[7] || match[8],
        italic: true,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push({
      text: input.slice(lastIndex),
    });
  }

  if (parts.length === 0) {
    return [{ text: input }];
  }

  return parts;
}

function renderInlineMarkdown(
  text: string,
  isUser: boolean
) {
  const parts = parseInlineMarkdown(text);

  return parts.map((part, index) => {
    const style = [
      isUser ? styles.userMessage : styles.aiMessage,
      part.bold && styles.markdownBold,
      part.italic && styles.markdownItalic,
      part.code && styles.inlineCode,
      part.link && styles.markdownLink,
    ];

    if (part.link) {
      return (
        <Text
          key={`link-${index}`}
          style={style}
          onPress={() => {
            void Linking.openURL(part.link!);
          }}
        >
          {part.text}
        </Text>
      );
    }

    return (
      <Text key={`text-${index}`} style={style}>
        {part.text}
      </Text>
    );
  });
}

function renderMarkdown(
  text: string,
  isUser: boolean
) {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const lines = normalized.split("\n");

  const elements: React.ReactNode[] = [];

  let index = 0;
  let codeLines: string[] = [];
  let insideCodeBlock = false;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim().startsWith("```")) {
      if (!insideCodeBlock) {
        insideCodeBlock = true;
        codeLines = [];
      } else {
        insideCodeBlock = false;

        elements.push(
          <View
            key={`code-${index}`}
            style={styles.codeBlock}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Text style={styles.codeText}>
                {codeLines.join("\n")}
              </Text>
            </ScrollView>
          </View>
        );

        codeLines = [];
      }

      index += 1;
      continue;
    }

    if (insideCodeBlock) {
      codeLines.push(line);
      index += 1;
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(
        <View
          key={`space-${index}`}
          style={styles.markdownSpacer}
        />
      );

      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(
      /^(#{1,4})\s+(.+)$/
    );

    if (headingMatch) {
      const level = headingMatch[1].length;

      elements.push(
        <Text
          key={`heading-${index}`}
          style={[
            styles.markdownHeading,
            level === 1 && styles.headingOne,
            level === 2 && styles.headingTwo,
            level >= 3 && styles.headingThree,
            isUser && styles.userMarkdownHeading,
          ]}
        >
          {renderInlineMarkdown(
            headingMatch[2],
            isUser
          )}
        </Text>
      );

      index += 1;
      continue;
    }

    const bulletMatch = trimmed.match(
      /^[-*•]\s+(.+)$/
    );

    if (bulletMatch) {
      elements.push(
        <View
          key={`bullet-${index}`}
          style={styles.listRow}
        >
          <Text style={styles.bullet}>
            •
          </Text>

          <Text
            style={[
              styles.listText,
              isUser
                ? styles.userMessage
                : styles.aiMessage,
            ]}
          >
            {renderInlineMarkdown(
              bulletMatch[1],
              isUser
            )}
          </Text>
        </View>
      );

      index += 1;
      continue;
    }

    const numberedMatch = trimmed.match(
      /^(\d+)[.)]\s+(.+)$/
    );

    if (numberedMatch) {
      elements.push(
        <View
          key={`number-${index}`}
          style={styles.listRow}
        >
          <Text style={styles.numberBullet}>
            {numberedMatch[1]}.
          </Text>

          <Text
            style={[
              styles.listText,
              isUser
                ? styles.userMessage
                : styles.aiMessage,
            ]}
          >
            {renderInlineMarkdown(
              numberedMatch[2],
              isUser
            )}
          </Text>
        </View>
      );

      index += 1;
      continue;
    }

    const quoteMatch = trimmed.match(
      /^>\s*(.+)$/
    );

    if (quoteMatch) {
      elements.push(
        <View
          key={`quote-${index}`}
          style={styles.quoteBlock}
        >
          <Text
            style={[
              styles.quoteText,
              isUser
                ? styles.userMessage
                : styles.aiMessage,
            ]}
          >
            {renderInlineMarkdown(
              quoteMatch[1],
              isUser
            )}
          </Text>
        </View>
      );

      index += 1;
      continue;
    }

    if (
      /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)
    ) {
      elements.push(
        <View
          key={`rule-${index}`}
          style={styles.markdownRule}
        />
      );

      index += 1;
      continue;
    }

    elements.push(
      <Text
        key={`paragraph-${index}`}
        style={[
          styles.message,
          isUser
            ? styles.userMessage
            : styles.aiMessage,
          styles.markdownParagraph,
        ]}
      >
        {renderInlineMarkdown(
          line,
          isUser
        )}
      </Text>
    );

    index += 1;
  }

  if (insideCodeBlock && codeLines.length > 0) {
    elements.push(
      <View
        key="unfinished-code"
        style={styles.codeBlock}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.codeText}>
            {codeLines.join("\n")}
          </Text>
        </ScrollView>
      </View>
    );
  }

  return elements;
}

/* =========================================================
   NATIVE VIDEO
   ========================================================= */

function GeneratedVideo({
  videoUrl,
}: {
  videoUrl: string;
}) {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.nativeVideo}
        contentFit="contain"
        nativeControls
      />

      <View style={styles.videoLabel}>
        <View style={styles.videoLabelDot} />

        <Text style={styles.videoLabelText}>
          CREATED WITH ZURI
        </Text>
      </View>

      <TouchableOpacity
        style={styles.nativeDownloadButton}
        activeOpacity={0.8}
        onPress={() => {
          void Linking.openURL(videoUrl);
        }}
      >
        <Text style={styles.nativeDownloadText}>
          ↗ Open / Download Video
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   NATIVE AUDIO
   ========================================================= */

function GeneratedAudio({
  audioUrl,
}: {
  audioUrl: string;
}) {
  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;

  return (
    <View style={styles.audioContainer}>
      <View style={styles.audioHeader}>
        <View style={styles.audioIcon}>
          <Text style={styles.audioIconText}>
            ♪
          </Text>
        </View>

        <View style={styles.audioTitleContainer}>
          <Text style={styles.audioTitle}>
            ZURI MUSIC
          </Text>

          <Text style={styles.audioSubtitle}>
            AI-generated audio
          </Text>
        </View>
      </View>

      <View style={styles.audioPlayerRow}>
        <TouchableOpacity
          style={styles.audioPlayButton}
          activeOpacity={0.8}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
        >
          <Text style={styles.audioPlayText}>
            {isPlaying ? "Ⅱ" : "▶"}
          </Text>
        </TouchableOpacity>

        <View style={styles.audioTrack}>
          <View
            style={[
              styles.audioTrackProgress,
              {
                width:
                  status.duration > 0
                    ? `${Math.min(
                        100,
                        (status.currentTime /
                          status.duration) *
                          100
                      )}%`
                    : "0%",
              },
            ]}
          />
        </View>

        <Text style={styles.audioTime}>
          {formatAudioTime(
            status.currentTime
          )}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.nativeDownloadButton}
        activeOpacity={0.8}
        onPress={() => {
          void Linking.openURL(audioUrl);
        }}
      >
        <Text style={styles.nativeDownloadText}>
          ↗ Open / Download Music
        </Text>
      </TouchableOpacity>

      <View style={styles.audioFooter}>
        <View style={styles.audioFooterDot} />

        <Text style={styles.audioFooterText}>
          CREATED WITH ZURI 
        </Text>
      </View>
    </View>
  );
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(
    seconds % 60
  );

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

/* =========================================================
   MESSAGE BUBBLE
   ========================================================= */

export default function MessageBubble({
  sender,
  text,
  imageUrl,
  videoUrl,
  audioUrl,
  pdfUrl,
  pdfName,
  researchImages = [],
}: MessageBubbleProps) {
  const isUser = sender === "user";
const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  try {
    await Clipboard.setStringAsync(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch (error) {
    console.error("Failed to copy message:", error);
  }
};
  const safeVideoUrl =
    typeof videoUrl === "string"
      ? videoUrl.trim()
      : "";

  const safeAudioUrl =
    typeof audioUrl === "string"
      ? audioUrl.trim()
      : "";

  const safeImageUrl =
    typeof imageUrl === "string"
      ? imageUrl.trim()
      : "";

  const safePdfUrl =
    typeof pdfUrl === "string"
      ? pdfUrl.trim()
      : "";

  return (
    <View
      style={[
        styles.container,
        isUser
          ? styles.userContainer
          : styles.aiContainer,
      ]}
    >
      {!isUser && (
        <View style={styles.aiAvatarOuter}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>
              Z
            </Text>
          </View>

          <View style={styles.onlineDot} />
        </View>
      )}

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

   {!!text && (
  <>
    <View
      style={[
        styles.bubble,
        isUser
          ? styles.userBubble
          : styles.aiBubble,
      ]}
    >
      {renderMarkdown(text, isUser)}
    </View>

    {!isUser && (
      <TouchableOpacity
        style={styles.copyButton}
        activeOpacity={0.7}
        onPress={handleCopy}
      >
        <Text style={styles.copyButtonText}>
          {copied ? "✓ Copied" : "⧉ Copy"}
        </Text>
      </TouchableOpacity>
    )}
  </>
)}

        {!isUser && safePdfUrl && (
          <TouchableOpacity
            style={styles.pdfDownloadButton}
            onPress={() => {
              void Linking.openURL(
                safePdfUrl
              );
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.pdfIcon}>
              📄
            </Text>

            <View style={styles.pdfInfo}>
              <Text
                style={styles.pdfTitle}
                numberOfLines={1}
              >
                {pdfName || "Zuri PDF"}
              </Text>

              <Text style={styles.pdfSubtitle}>
                PDF document
              </Text>
            </View>

            <Text style={styles.pdfDownloadText}>
              Open
            </Text>
          </TouchableOpacity>
        )}

        {!isUser &&
          researchImages.length > 0 && (
            <View style={styles.researchGallery}>
              <View style={styles.researchHeader}>
                <View
                  style={styles.researchHeaderLeft}
                >
                  <View
                    style={
                      styles.researchHeaderDot
                    }
                  />

                  <Text
                    style={
                      styles.researchHeaderText
                    }
                  >
                    SOURCES & IMAGES
                  </Text>
                </View>

                <Text
                  style={
                    styles.researchCount
                  }
                >
                  {researchImages.length}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.researchScrollContent
                }
              >
                {researchImages.map(
                  (item, index) => (
                    <View
                      key={`${item.url}-${index}`}
                      style={styles.researchCard}
                    >
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          if (item.url) {
                            void Linking.openURL(
                              item.url
                            );
                          }
                        }}
                      >
                        <Image
                          source={{
                            uri: item.url,
                          }}
                          style={
                            styles.researchImage
                          }
                          resizeMode="cover"
                        />

                        <View
                          style={
                            styles.imageOverlay
                          }
                        >
                          <Text
                            style={
                              styles.imageOpenText
                            }
                          >
                            View ↗
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {!!item.title && (
                        <Text
                          style={
                            styles.researchTitle
                          }
                          numberOfLines={2}
                        >
                          {item.title}
                        </Text>
                      )}

                      {!!item.sourceUrl && (
                        <TouchableOpacity
                          style={
                            styles.sourceButton
                          }
                          activeOpacity={0.75}
                          onPress={() => {
                            void Linking.openURL(
                              item.sourceUrl!
                            );
                          }}
                        >
                          <Text
                            style={
                              styles.sourceButtonText
                            }
                          >
                            View source ↗
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                )}
              </ScrollView>
            </View>
          )}

        {!!safeImageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: safeImageUrl,
              }}
              style={styles.generatedImage}
              resizeMode="cover"
            />

            <View style={styles.imageLabel}>
              <View
                style={styles.imageLabelDot}
              />

              <Text
                style={styles.imageLabelText}
              >
                CREATED WITH ZURI
              </Text>
            </View>

            <TouchableOpacity
              style={styles.nativeDownloadButton}
              activeOpacity={0.8}
              onPress={() => {
                void saveGeneratedImage(safeImageUrl);
              }}
            >
              <Text
                style={styles.nativeDownloadText}
              >
                ↓ Download Image
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!!safeVideoUrl && (
          <GeneratedVideo
            videoUrl={safeVideoUrl}
          />
        )}

        {!!safeAudioUrl && (
          <GeneratedAudio
            audioUrl={safeAudioUrl}
          />
        )}
      </View>

      {isUser && (
        <View style={styles.userAvatarOuter}>
          <View style={styles.userAvatar}>
            <Text
              style={styles.userAvatarText}
            >
              J
            </Text>
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

  markdownParagraph: {
    marginBottom: 3,
  },

  markdownSpacer: {
    height: 7,
  },

  markdownHeading: {
    marginTop: 7,
    marginBottom: 8,
    color: "#F1F4F1",
    fontWeight: "800",
  },

  headingOne: {
    fontSize: 22,
    lineHeight: 29,
  },

  headingTwo: {
    fontSize: 19,
    lineHeight: 26,
  },

  headingThree: {
    fontSize: 16,
    lineHeight: 23,
  },

  userMarkdownHeading: {
    color: "#FFFFFF",
  },

  markdownBold: {
    fontWeight: "800",
  },

  markdownItalic: {
    fontStyle: "italic",
  },

  markdownLink: {
    color: "#22C9BE",
    textDecorationLine: "underline",
  },

  inlineCode: {
    fontFamily: "monospace",
    backgroundColor: "#10282D",
    color: "#D7AD5A",
    paddingHorizontal: 4,
    borderRadius: 4,
  },

  codeBlock: {
    marginVertical: 9,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#050D10",
    borderWidth: 1,
    borderColor: "#20383D",
  },

  codeText: {
    color: "#D7E2DF",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
  },

  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 3,
  },

  bullet: {
    width: 20,
    color: "#D7AD5A",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
  },

  numberBullet: {
    width: 25,
    color: "#D7AD5A",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "800",
  },

  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },

  quoteBlock: {
    marginVertical: 7,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#D7AD5A",
  },

  quoteText: {
    fontSize: 14,
    lineHeight: 23,
    fontStyle: "italic",
  },

  markdownRule: {
    height: 1,
    backgroundColor: "#294146",
    marginVertical: 10,
  },

  pdfDownloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C1B20",
    borderWidth: 1,
    borderColor: "#28474D",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
    width: "100%",
  },

  pdfIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  pdfInfo: {
    flex: 1,
  },

  pdfTitle: {
    color: "#F3F4EF",
    fontSize: 13,
    fontWeight: "700",
  },

  pdfSubtitle: {
    color: "#789094",
    fontSize: 11,
    marginTop: 2,
  },

  pdfDownloadText: {
    color: "#18BEB3",
    fontSize: 12,
    fontWeight: "800",
  },

  researchGallery: {
    width: 420,
    maxWidth: "100%",
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#09161A",
    borderWidth: 1,
    borderColor: "#213B40",
  },

  researchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  researchHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
copyButton: {
  alignSelf: "flex-start",
  marginTop: 7,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 9,
  backgroundColor: "#10282D",
  borderWidth: 1,
  borderColor: "#29474C",
},

copyButtonText: {
  color: "#19C8BC",
  fontSize: 11,
  fontWeight: "700",
},
  researchHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D7AD5A",
    marginRight: 7,
  },

  researchHeaderText: {
    color: "#9AAEB0",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  researchCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: "#102A2E",
    borderWidth: 1,
    borderColor: "#29494D",
    color: "#19C8BC",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 20,
  },

  researchScrollContent: {
    paddingRight: 8,
  },

  researchCard: {
    width: 168,
    marginRight: 10,
    backgroundColor: "#0D2025",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#294348",
    overflow: "hidden",
  },

  researchImage: {
    width: 168,
    height: 145,
    backgroundColor: "#102B31",
  },

  imageOverlay: {
    position: "absolute",
    right: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(4,12,15,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  imageOpenText: {
    color: "#F2F5F2",
    fontSize: 9,
    fontWeight: "800",
  },

  researchTitle: {
    color: "#E5E9E7",
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: 9,
    paddingTop: 9,
    paddingBottom: 5,
  },

  sourceButton: {
    alignSelf: "flex-start",
    marginHorizontal: 9,
    marginBottom: 9,
    marginTop: 2,
  },

  sourceButtonText: {
    color: "#19C8BC",
    fontSize: 9,
    fontWeight: "800",
  },

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

  nativeDownloadButton: {
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#12383D",
    borderWidth: 1,
    borderColor: "#31565B",
    justifyContent: "center",
    alignItems: "center",
  },

  nativeDownloadText: {
    color: "#E8F2F0",
    fontSize: 13,
    fontWeight: "700",
  },

  videoContainer: {
    width: 520,
    maxWidth: "100%",
    marginTop: 11,
    padding: 10,
    backgroundColor: "#0B191E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5C4C2E",
    overflow: "hidden",
  },

  nativeVideo: {
    width: "100%",
    height: 360,
    backgroundColor: "#050A0D",
    borderRadius: 12,
  },

  videoLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 10,
  },

  videoLabelDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D4A72C",
    marginRight: 7,
  },

  videoLabelText: {
    color: "#71888B",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  audioContainer: {
    width: 520,
    maxWidth: "100%",
    marginTop: 11,
    padding: 16,
    backgroundColor: "#0B191E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6A542B",
  },

  audioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  audioIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#102B31",
    borderWidth: 1,
    borderColor: "#8A6C36",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  audioIconText: {
    color: "#D7AD5A",
    fontSize: 25,
    fontWeight: "900",
  },

  audioTitleContainer: {
    flex: 1,
  },

  audioTitle: {
    color: "#D7AD5A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  audioSubtitle: {
    color: "#71888B",
    fontSize: 11,
    marginTop: 3,
  },

  audioPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  audioPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#18BEB3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  audioPlayText: {
    color: "#061315",
    fontSize: 16,
    fontWeight: "900",
  },

  audioTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#1B3439",
    overflow: "hidden",
  },

  audioTrackProgress: {
    height: "100%",
    backgroundColor: "#19D3C5",
  },

  audioTime: {
    width: 42,
    marginLeft: 8,
    color: "#8EA1A3",
    fontSize: 10,
    textAlign: "right",
  },

  audioFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  audioFooterDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#19C8BC",
    marginRight: 7,
  },

  audioFooterText: {
    color: "#71888B",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
});