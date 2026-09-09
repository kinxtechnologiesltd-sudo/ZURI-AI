import {
  cloneElement,
  createElement,
  type AnchorHTMLAttributes,
  type AudioHTMLAttributes,
  type VideoHTMLAttributes,
} from "react";

import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ResearchImage = {
  url: string;
  title?: string | null;
  sourceUrl?: string | null;
};

type WebVideoProps =
  VideoHTMLAttributes<HTMLVideoElement>;

type WebAudioProps =
  AudioHTMLAttributes<HTMLAudioElement>;

type WebAudioDownloadProps =
  AnchorHTMLAttributes<HTMLAnchorElement>;

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

  /**
   * =====================================================
   * VIDEO URL
   * =====================================================
   *
   * Keep the URL exactly as returned by the backend.
   *
   * Render should return a publicly accessible HTTPS
   * MP4 URL such as:
   *
   * https://zuri-ai-v1.onrender.com/generated/zuri-xxx.mp4
   */

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
      {/* =================================================
          ZURI AVATAR
          ================================================= */}

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

      {/* =================================================
          MESSAGE CONTENT
          ================================================= */}

      <View
        style={[
          styles.messageWrapper,
          isUser
            ? styles.userMessageWrapper
            : styles.aiMessageWrapper,
        ]}
      >
        {/* =================================================
            SENDER
            ================================================= */}

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

        {/* =================================================
            TEXT
            ================================================= */}

        {!!text && (
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
        )}

        {/* =================================================
            GENERATED PDF
            ================================================= */}

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

        {/* =================================================
            RESEARCH IMAGES
            ================================================= */}

        {!isUser &&
          researchImages.length > 0 && (
            <View style={styles.researchGallery}>
              <View style={styles.researchHeader}>
                <View
                  style={styles.researchHeaderDot}
                />

                <Text
                  style={styles.researchHeaderText}
                >
                  RESEARCH IMAGES
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
                  (item, index) => {
                    const imageContent = (
                      <View
                        style={styles.researchCard}
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
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
                      </View>
                    );

                    const sourceUrl =
                      item.sourceUrl;

                    if (sourceUrl) {
                      return (
                        <TouchableOpacity
                          key={`${item.url}-${index}-link`}
                          activeOpacity={0.85}
                          onPress={() => {
                            void Linking.openURL(
                              sourceUrl
                            );
                          }}
                        >
                          {imageContent}
                        </TouchableOpacity>
                      );
                    }

                    return cloneElement(
                      imageContent,
                      {
                        key: `${item.url}-${index}`,
                      }
                    );
                  }
                )}
              </ScrollView>
            </View>
          )}

        {/* =================================================
            GENERATED IMAGE
            ================================================= */}

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

            {createElement(
              "a",
              {
                href: safeImageUrl.replace(
                  "/image/upload/",
                  "/image/upload/fl_attachment:zuri-generated-image/"
                ),

                download:
                  "zuri-generated-image",

                target: "_blank",

                rel:
                  "noopener noreferrer",

                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  backgroundColor:
                    "#12383D",
                  border:
                    "1px solid #31565B",
                  color: "#E8F2F0",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: "700",
                  boxSizing: "border-box",
                  cursor: "pointer",
                },
              } satisfies AnchorHTMLAttributes<HTMLAnchorElement>,
              "⬇ Download Image"
            )}
          </View>
        )}
{/* Generated Video */}
{videoUrl && (
  <View style={styles.videoContainer}>
    {createElement("video", {
      src: videoUrl,
      controls: true,
      playsInline: true,
      preload: "metadata",

      style: {
        width: "100%",
        height: 360,
        display: "block",
        objectFit: "contain",
        backgroundColor: "#050A0D",
        borderRadius: 12,
      },

      onLoadedMetadata: () => {
        console.log(
          "✅ ZURI VIDEO METADATA LOADED:",
          videoUrl
        );
      },

      onCanPlay: () => {
        console.log(
          "▶️ ZURI VIDEO CAN PLAY:",
          videoUrl
        );
      },

      onError: () => {
        /**
         * IMPORTANT:
         * Do NOT log the React/DOM event object.
         *
         * HTMLVideoElement events contain circular
         * React internals and cannot safely be
         * JSON serialized.
         */

        console.error(
          "❌ ZURI VIDEO PLAYBACK ERROR:",
          {
            videoUrl,
            message:
              "The browser could not load or play the generated video.",
          }
        );
      },
    } satisfies WebVideoProps)}

    <View style={styles.videoLabel}>
      <View style={styles.videoLabelDot} />

      <Text style={styles.videoLabelText}>
        CREATED WITH ZURI
      </Text>
    </View>

    {/* Download Video */}
    {createElement(
      "a",
      {
        href: videoUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        download: true,

        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          marginTop: 4,
          marginBottom: 10,
          padding: "11px 14px",
          borderRadius: 12,
          backgroundColor: "#12383D",
          border: "1px solid #31565B",
          color: "#E8F2F0",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: "700",
          boxSizing: "border-box",
          cursor: "pointer",
        },
      } satisfies AnchorHTMLAttributes<HTMLAnchorElement>,
      "⬇ Download Video"
    )}
  </View>
)}
        {/* =================================================
            GENERATED MUSIC
            ================================================= */}

        {!!safeAudioUrl && (
          <View style={styles.audioContainer}>
            <View style={styles.audioHeader}>
              <View style={styles.audioIcon}>
                <Text
                  style={styles.audioIconText}
                >
                  ♪
                </Text>
              </View>

              <View
                style={
                  styles.audioTitleContainer
                }
              >
                <Text
                  style={styles.audioTitle}
                >
                  ZURI MUSIC
                </Text>

                <Text
                  style={styles.audioSubtitle}
                >
                  AI-generated audio
                </Text>
              </View>
            </View>

            {createElement(
              "audio",
              {
                src: safeAudioUrl,

                controls: true,

                preload:
                  "metadata",

                style: {
                  width: "100%",
                  display: "block",
                },

                onError: (event) => {
                  console.error(
                    "❌ ZURI AUDIO PLAYBACK ERROR:",
                    {
                      audioUrl:
                        safeAudioUrl,
                      event,
                    }
                  );
                },

                onCanPlay: () => {
                  console.log(
                    "▶️ ZURI AUDIO CAN PLAY:",
                    safeAudioUrl
                  );
                },
              } satisfies WebAudioProps
            )}

            {createElement(
              "a",
              {
                href:
                  safeAudioUrl,

                download:
                  "zuri-music.mp3",

                target:
                  "_blank",

                rel:
                  "noopener noreferrer",

                style: {
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  width:
                    "100%",
                  marginTop:
                    12,
                  padding:
                    "11px 14px",
                  borderRadius:
                    12,
                  backgroundColor:
                    "#12383D",
                  border:
                    "1px solid #31565B",
                  color:
                    "#E8F2F0",
                  textDecoration:
                    "none",
                  fontSize:
                    13,
                  fontWeight:
                    "700",
                  boxSizing:
                    "border-box",
                  cursor:
                    "pointer",
                },
              } satisfies WebAudioDownloadProps,
              "⬇ Download Music"
            )}

            <View style={styles.audioFooter}>
              <View
                style={
                  styles.audioFooterDot
                }
              />

              <Text
                style={
                  styles.audioFooterText
                }
              >
                CREATED WITH ZURI • SUNO
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* =================================================
          USER AVATAR
          ================================================= */}

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

/* =======================================================
   STYLES
   ======================================================= */

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

  /* =====================================================
     ZURI AVATAR
     ===================================================== */

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

  /* =====================================================
     USER AVATAR
     ===================================================== */

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

  /* =====================================================
     MESSAGE LAYOUT
     ===================================================== */

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

  /* =====================================================
     MESSAGE BUBBLES
     ===================================================== */

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

  /* =====================================================
     PDF
     ===================================================== */

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

  /* =====================================================
     RESEARCH IMAGES
     ===================================================== */

  researchGallery: {
    width: 420,
    maxWidth: "100%",
    marginTop: 11,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#0B191E",
    borderWidth: 1,
    borderColor: "#213B40",
  },

  researchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  researchHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D7AD5A",
    marginRight: 7,
  },

  researchHeaderText: {
    color: "#71888B",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  researchScrollContent: {
    paddingRight: 8,
  },

  researchCard: {
    width: 150,
    marginRight: 10,
    backgroundColor: "#0D2025",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2B3F42",
    overflow: "hidden",
  },

  researchImage: {
    width: 150,
    height: 160,
    backgroundColor: "#102B31",
  },

  researchTitle: {
    color: "#E5E7EB",
    fontSize: 10,
    lineHeight: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  /* =====================================================
     GENERATED IMAGE
     ===================================================== */

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

  /* =====================================================
     GENERATED VIDEO
     ===================================================== */

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

  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 10,
  },

  videoTitle: {
    color: "#D7AD5A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  videoSubtitle: {
    color: "#71888B",
    fontSize: 11,
    marginTop: 3,
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

  /* =====================================================
     GENERATED MUSIC
     ===================================================== */

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