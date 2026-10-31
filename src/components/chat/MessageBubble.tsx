import {
  AccessibilityInfo,
  Animated,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { VideoView, useVideoPlayer } from "expo-video";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { saveGeneratedImage } from "./generatedImageDownload";
import ReportModal from "../report/ReportModal";

type ResearchImage = {
  url: string;
  title?: string | null;
  sourceUrl?: string | null;
  creator?: string | null;
};

type ResearchVideo = {
  id?: string;
  title: string;
  channel?: string | null;
  source: string;
  url: string;
  thumbnailUrl?: string | null;
};

type SourceLink = {
  title?: string | null;
  url?: string | null;
  content?: string | null;
  publishedDate?: string | null;
};

type MessageBubbleProps = {
  sender: "user" | "ai";
  text: string;

  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;

  pdfUrl?: string;
  pdfName?: string;

  attachment?: {
    name: string;
    uri: string;
    mimeType?: string;
    size?: number;
  };

  researchImages?: ResearchImage[];
  researchVideos?: ResearchVideo[];
  sources?: SourceLink[];
  messageId?: string;
  conversationId?: string;
  imageKind?: "image" | "comic";
};

type MarkdownPart = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: string;
};

function splitPlainUrls(text: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [];
  const regex = /(https?:\/\/[^\s<]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
      });
    }

    let url = match[0];
    const trailingMatch = url.match(/[.,;:!?)]+$/);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    if (trailing) {
      url = url.slice(0, -trailing.length);
    }

    if (url) {
      parts.push({
        text: url,
        link: url,
      });
    }

    if (trailing) {
      parts.push({
        text: trailing,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
    });
  }

  if (parts.length === 0) {
    return [{ text }];
  }

  return parts;
}


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
      parts.push(
        ...splitPlainUrls(
          input.slice(lastIndex, match.index)
        )
      );
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
    parts.push(
      ...splitPlainUrls(
        input.slice(lastIndex)
      )
    );
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
  attachment,
  researchImages = [],
  researchVideos = [],
  sources = [],
  messageId,
  conversationId,
}: MessageBubbleProps) {
  const isUser = sender === "user";

  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslate = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (cancelled) return;

        if (reduceMotion) {
          entranceOpacity.setValue(1);
          entranceTranslate.setValue(0);
          return;
        }

        Animated.parallel([
          Animated.timing(entranceOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(entranceTranslate, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      })
      .catch(() => {
        if (cancelled) return;
        entranceOpacity.setValue(1);
        entranceTranslate.setValue(0);
      });

    return () => {
      cancelled = true;
    };
  }, [entranceOpacity, entranceTranslate]);
const [copied, setCopied] = useState(false);
const [reportOpen, setReportOpen] = useState(false);
const [reportContext, setReportContext] = useState<null | {
  contentType: "text" | "image" | "comic" | "video" | "music";
  contentUrl?: string | null;
  contentSnippet?: string | null;
}>(null);

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
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
        {
          opacity: entranceOpacity,
          transform: [{ translateY: entranceTranslate }],
        },
      ]}
    >
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
                KYNX AI
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
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.copyButton}
          activeOpacity={0.7}
          onPress={handleCopy}
        >
          <Text style={styles.copyButtonText}>
            {copied ? "? Copied" : "? Copy"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportButton}
          activeOpacity={0.7}
          onPress={() => {
            setReportContext({
              contentType: "text",
              contentSnippet: text.slice(0, 500),
            });
            setReportOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Report this message"
        >
          <Text style={styles.reportButtonText}>
            Report
          </Text>
        </TouchableOpacity>
      </View>
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
          (sources.length > 0 ||
            researchImages.length > 0 ||
            researchVideos.length > 0) && (
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
                  {Math.max(
                    sources.length,
                    researchImages.length,
                    researchVideos.length
                  )}
                </Text>
              </View>

              {sources.length > 0 && (
                <View style={styles.sourcesList}>
                  {sources.map((source, index) => (
                    <TouchableOpacity
                      key={`${source.url || index}-source`}
                      style={styles.sourceRow}
                      activeOpacity={0.75}
                      onPress={() => {
                        if (source.url) {
                          void Linking.openURL(source.url);
                        }
                      }}
                    >
                      <Text style={styles.sourceIndex}>[{index + 1}]</Text>
                      <View style={styles.sourceTextWrap}>
                        <Text style={styles.sourceTitle} numberOfLines={2}>
                          {source.title || source.url || `Source ${index + 1}`}
                        </Text>
                        {!!source.content && (
                          <Text style={styles.sourceExcerpt} numberOfLines={2}>
                            {source.content}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {researchImages.length > 0 && (
                <View style={styles.researchImageGrid}>
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
                </View>
              )}

              {researchVideos.length > 0 && (
                <View style={styles.sourcesList}>
                  {researchVideos.map((video, index) => (
                    <TouchableOpacity
                      key={`${video.url}-${index}`}
                      style={styles.sourceRow}
                      activeOpacity={0.75}
                      onPress={() => {
                        if (video.url) {
                          void Linking.openURL(video.url);
                        }
                      }}
                    >
                      <Text style={styles.sourceIndex}>
                        {index + 1}
                      </Text>
                      <View style={styles.sourceTextWrap}>
                        <Text style={styles.sourceTitle} numberOfLines={2}>
                          {video.title}
                        </Text>
                        {!!video.channel && (
                          <Text style={styles.sourceExcerpt} numberOfLines={1}>
                            {video.channel} · {video.source}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

        {attachment && (
          <View style={styles.attachmentCard}>
            {attachment.mimeType?.startsWith("image/") ? (
              <Image
                source={{ uri: attachment.uri }}
                style={styles.attachmentImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.attachmentIconBox}>
                <Text style={styles.attachmentIconText}>
                  {attachment.mimeType?.includes("pdf")
                    ? "PDF"
                    : attachment.mimeType?.startsWith("video/")
                    ? "▶"
                    : attachment.mimeType?.startsWith("audio/")
                    ? "♪"
                    : "FILE"}
                </Text>
              </View>
            )}
            <View style={styles.attachmentMeta}>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.name}
              </Text>
              {typeof attachment.size === "number" ? (
                <Text style={styles.attachmentSize}>
                  {attachment.size >= 1024 * 1024
                    ? `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.max(1, Math.round(attachment.size / 1024))} KB`}
                </Text>
              ) : null}
            </View>
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

            <ReportModal
        visible={reportOpen}
        contentType={reportContext?.contentType || "text"}
        contentId={messageId || null}
        messageId={messageId || null}
        conversationId={conversationId || null}
        contentUrl={reportContext?.contentUrl || null}
        contentSnippet={reportContext?.contentSnippet || null}
        onClose={() => {
          setReportOpen(false);
          setReportContext(null);
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
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
    borderColor: "#5D4C2D",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },

  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#151F25",
    justifyContent: "center",
    alignItems: "center",
  },

  aiAvatarText: {
    color: "#FFC928",
    fontSize: 18,
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#00D9E8",
    right: -2,
    bottom: 3,
    borderWidth: 2,
    borderColor: "#080B0E",
  },

  aiLabelRow: {
    marginBottom: 4,
  },

  aiLabel: {
    color: "#FFC928",
    fontSize: 12,
    fontWeight: "700",
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
    backgroundColor: "#1B2830",
    justifyContent: "center",
    alignItems: "center",
  },

  userAvatarText: {
    color: "#EAF3F1",
    fontSize: 14,
    fontWeight: "800",
  },

  messageWrapper: {
    maxWidth: "82%",
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
    color: "#FFC928",
  },

  aiBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#22343F",
  },

  aiBadgeText: {
    color: "#00D9E8",
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
    backgroundColor: "#17323A",
    borderWidth: 1,
    borderColor: "#2E5A62",
    borderTopRightRadius: 6,
  },

  aiBubble: {
    backgroundColor: "#121A21",
    borderWidth: 1,
    borderColor: "#22343F",
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
    color: "#F5F5F0",
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
    color: "#FFC928",
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
    color: "#FFC928",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
  },

  numberBullet: {
    width: 25,
    color: "#FFC928",
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
    borderLeftColor: "#FFC928",
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
    backgroundColor: "#121A21",
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
    color: "#00D9E8",
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
  color: "#00D9E8",
  fontSize: 11,
  fontWeight: "700",
},
  researchHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFC928",
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
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#29494D",
    color: "#00D9E8",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 20,
  },

  researchImageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  researchCard: {
    width: "48%",
    backgroundColor: "#10171C",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#294348",
    overflow: "hidden",
  },

  researchImage: {
    width: 168,
    height: 145,
    backgroundColor: "#151F25",
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
    color: "#00D9E8",
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
    backgroundColor: "#10171C",
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
    backgroundColor: "#FFC928",
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
    backgroundColor: "#17323A",
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
    width: "100%",
     maxWidth: 520,
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
    backgroundColor: "#FFC928",
    marginRight: 7,
  },

  videoLabelText: {
    color: "#71888B",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  audioContainer: {
    width: "100%",
     maxWidth: 520,
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
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#5D4C2D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  audioIconText: {
    color: "#FFC928",
    fontSize: 25,
    fontWeight: "900",
  },

  audioTitleContainer: {
    flex: 1,
  },

  audioTitle: {
    color: "#FFC928",
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
    backgroundColor: "#00D9E8",
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
    backgroundColor: "#22343F",
    overflow: "hidden",
  },

  audioTrackProgress: {
    height: "100%",
    backgroundColor: "#00D9E8",
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
    backgroundColor: "#00D9E8",
    marginRight: 7,
  },

  audioFooterText: {
    color: "#71888B",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 7,
    flexWrap: "wrap",
  },

  reportButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#2A1A1A",
    borderWidth: 1,
    borderColor: "#5C3A3A",
  },

  reportButtonText: {
    color: "#E07A7A",
    fontSize: 11,
    fontWeight: "700",
  },

  sourcesList: {
    marginTop: 8,
    gap: 6,
  },

  sourceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#10171C",
    borderWidth: 1,
    borderColor: "#22343F",
    gap: 8,
  },

  sourceIndex: {
    width: 24,
    color: "#FFC928",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 1,
  },

  sourceTextWrap: {
    flex: 1,
    flexDirection: "column",
  },

  sourceTitle: {
    color: "#DCE7E8",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },

  sourceExcerpt: {
    color: "#8EA1A3",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#151F25",
    borderWidth: 1,
    borderColor: "#22343F",
    gap: 10,
  },

  attachmentImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },

  attachmentIconBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#0A1418",
    borderWidth: 1,
    borderColor: "#22343F",
    justifyContent: "center",
    alignItems: "center",
  },

  attachmentIconText: {
    color: "#FFC928",
    fontSize: 12,
    fontWeight: "900",
  },

  attachmentMeta: {
    flex: 1,
  },

  attachmentName: {
    color: "#F5F5F0",
    fontSize: 13,
    fontWeight: "700",
  },

  attachmentSize: {
    color: "#A7B3BA",
    fontSize: 11,
    marginTop: 2,
  },});
