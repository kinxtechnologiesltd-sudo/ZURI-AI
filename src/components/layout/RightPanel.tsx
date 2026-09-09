import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RightPanel() {
  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.glow} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            INTELLIGENCE PANEL
          </Text>

          <Text style={styles.heading}>
            Zuri
          </Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Text style={styles.menuText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* System Status */}
      <View style={styles.statusCard}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>✦</Text>
          </View>

          <Text style={styles.cardLabel}>
            SYSTEM STATUS
          </Text>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        <Text style={styles.statusTitle}>
          Zuri is online
        </Text>

        <Text style={styles.description}>
          Intelligence systems are ready for your next request.
        </Text>

        <View style={styles.systemRow}>
          <View style={styles.systemItem}>
            <View style={styles.systemDot} />
            <Text style={styles.systemText}>
              Chat
            </Text>
          </View>

          <View style={styles.systemItem}>
            <View style={styles.systemDot} />
            <Text style={styles.systemText}>
              Vision
            </Text>
          </View>

          <View style={styles.systemItem}>
            <View style={styles.systemDot} />
            <Text style={styles.systemText}>
              Files
            </Text>
          </View>
        </View>
      </View>

      {/* Memory */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.goldIcon}>
            <Text style={styles.goldIconText}>∞</Text>
          </View>

          <View style={styles.cardHeadingArea}>
            <Text style={styles.cardLabel}>
              MEMORY
            </Text>

            <Text style={styles.cardTitle}>
              Context awareness
            </Text>
          </View>
        </View>

        <Text style={styles.description}>
          Zuri can remember important context from your conversations.
        </Text>

        <View style={styles.memoryStatus}>
          <View style={styles.memoryLine}>
            <View style={styles.memoryProgress} />
          </View>

          <Text style={styles.memoryText}>
            READY
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>◈</Text>
          </View>

          <View style={styles.cardHeadingArea}>
            <Text style={styles.cardLabel}>
              RECENT ACTIVITY
            </Text>

            <Text style={styles.cardTitle}>
              Your workspace
            </Text>
          </View>
        </View>

        <View style={styles.activity}>
          <View style={styles.activityTimeline}>
            <View style={styles.activityDot} />
            <View style={styles.activityLine} />
          </View>

          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>
              Ready for your next idea
            </Text>

            <Text style={styles.activityText}>
              Start a conversation, upload a file or explore something new.
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Zuri Identity */}
      <View style={styles.footer}>
        <View style={styles.footerSymbol}>
          <Text style={styles.footerLetter}>Z</Text>
        </View>

        <View>
          <Text style={styles.footerTitle}>
            ZURI
          </Text>

          <Text style={styles.footerSub}>
            AI BY KINX
          </Text>
        </View>

        <View style={styles.footerStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    position: "relative",
    overflow: "hidden",

    backgroundColor: "#071014",

    borderLeftWidth: 1,
    borderLeftColor: "#182A30",

    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 20,
  },

  glow: {
    position: "absolute",

    width: 220,
    height: 220,

    borderRadius: 110,

    backgroundColor: "#0A3B3D",

    opacity: 0.16,

    top: -130,
    right: -100,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 24,
  },

  eyebrow: {
    color: "#846B3C",

    fontSize: 8,
    fontWeight: "800",

    letterSpacing: 2,
  },

  heading: {
    color: "#F5F3EC",

    fontSize: 25,
    fontWeight: "800",

    marginTop: 4,
  },

  menuButton: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: "#0D2025",

    borderWidth: 1,
    borderColor: "#1B353A",

    justifyContent: "center",
    alignItems: "center",
  },

  menuText: {
    color: "#71878A",
    fontSize: 12,
    letterSpacing: 2,
  },

  statusCard: {
    backgroundColor: "#0D2025",

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#285056",

    padding: 17,

    marginBottom: 14,
  },

  card: {
    backgroundColor: "#0B191E",

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#182F35",

    padding: 17,

    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 14,
  },

  cardIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#103035",

    borderWidth: 1,
    borderColor: "#23565A",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,
  },

  cardIconText: {
    color: "#19D3C5",
    fontSize: 14,
  },

  goldIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: "#292318",

    borderWidth: 1,
    borderColor: "#62502D",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,
  },

  goldIconText: {
    color: "#DDB35E",
    fontSize: 16,
    fontWeight: "700",
  },

  cardHeadingArea: {
    flex: 1,
  },

  cardLabel: {
    color: "#668084",

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1.6,
  },

  cardTitle: {
    color: "#E9ECE8",

    fontSize: 13,
    fontWeight: "700",

    marginTop: 3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#102E2D",

    borderRadius: 20,

    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  liveDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#19D3C5",

    marginRight: 5,
  },

  liveText: {
    color: "#19D3C5",

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 1,
  },

  statusTitle: {
    color: "#F3F3ED",

    fontSize: 17,
    fontWeight: "800",

    marginBottom: 7,
  },

  description: {
    color: "#789094",

    fontSize: 11,
    lineHeight: 18,
  },

  systemRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 16,
  },

  systemItem: {
    flexDirection: "row",
    alignItems: "center",

    marginRight: 13,
  },

  systemDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#19D3C5",

    marginRight: 5,
  },

  systemText: {
    color: "#93A7A9",
    fontSize: 9,
    fontWeight: "600",
  },

  memoryStatus: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 15,
  },

  memoryLine: {
    flex: 1,
    height: 3,

    borderRadius: 2,

    backgroundColor: "#182E32",

    overflow: "hidden",

    marginRight: 10,
  },

  memoryProgress: {
    width: "82%",
    height: "100%",

    borderRadius: 2,

    backgroundColor: "#B38B44",
  },

  memoryText: {
    color: "#C99D4D",

    fontSize: 7,
    fontWeight: "900",

    letterSpacing: 1.2,
  },

  activity: {
    flexDirection: "row",

    marginTop: 3,
  },

  activityTimeline: {
    width: 16,
    alignItems: "center",

    marginRight: 8,
  },

  activityDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#19D3C5",
  },

  activityLine: {
    width: 1,
    flex: 1,

    minHeight: 45,

    backgroundColor: "#1B373B",

    marginTop: 5,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    color: "#E5E9E5",

    fontSize: 12,
    fontWeight: "700",

    marginBottom: 5,
  },

  activityText: {
    color: "#70878A",

    fontSize: 10,
    lineHeight: 16,
  },

  footer: {
    marginTop: "auto",

    flexDirection: "row",
    alignItems: "center",

    paddingTop: 17,

    borderTopWidth: 1,
    borderTopColor: "#172A2F",
  },

  footerSymbol: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: "#102A30",

    borderWidth: 1,
    borderColor: "#745D34",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,
  },

  footerLetter: {
    color: "#DDB35E",

    fontSize: 17,
    fontWeight: "900",
  },

  footerTitle: {
    color: "#EDEDE7",

    fontSize: 11,
    fontWeight: "900",

    letterSpacing: 2,
  },

  footerSub: {
    color: "#5F777A",

    fontSize: 7,
    fontWeight: "700",

    letterSpacing: 1.3,

    marginTop: 2,
  },

  footerStatus: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#19D3C5",

    marginLeft: "auto",
  },
});