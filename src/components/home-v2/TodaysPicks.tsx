import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const picks = [
  {
    title: "Afrofuturistic Lion King",
    description:
      "Create a royal African fantasy artwork with gold armor and cinematic lighting.",
    image:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=900",
    category: "Image",
  },

  {
    title: "Luxury Burger Campaign",
    description:
      "Design a premium food advert with dramatic lighting and rich colors.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900",
    category: "Food",
  },

  {
    title: "Afrobeats Love Song",
    description:
      "Compose a modern Afrobeats hit with emotional lyrics and catchy hooks.",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900",
    category: "Music",
  },
];

export default function TodaysPicks() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Today's AI Picks
      </Text>

      <Text style={styles.subtitle}>
        Fresh ideas curated by Zuri to inspire your next masterpiece.
      </Text>      {picks.map((item) => (

        <Pressable
          key={item.title}
          style={styles.card}
        >

          <Image
            source={{ uri: item.image }}
            style={styles.image}
          />

          <View style={styles.overlay} />

          <View style={styles.content}>

            <View style={styles.badge}>

              <Text style={styles.badgeText}>
                {item.category}
              </Text>

            </View>

            <Text style={styles.cardTitle}>
              {item.title}
            </Text>

            <Text
              numberOfLines={2}
              style={styles.description}
            >
              {item.description}
            </Text>

            <Pressable
              style={styles.createButton}
            >

              <Text style={styles.createText}>
                ✨ Create
              </Text>

            </Pressable>

          </View>

        </Pressable>

      ))}

    </View>
  );
}const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 44,
    marginBottom: 40,
  },

  title: {
    color: "#F5F7F5",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },

  subtitle: {
    color: "#8EA3A6",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 620,
  },

  card: {
    height: 240,

    borderRadius: 24,

    overflow: "hidden",

    marginBottom: 20,

    backgroundColor: "#0B171B",

    borderWidth: 1,
    borderColor: "#1B353A",
  },

  image: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "rgba(6,16,20,0.58)",
  },

  content: {
    flex: 1,
    justifyContent: "space-between",

    padding: 24,
  },

  badge: {
    alignSelf: "flex-start",

    backgroundColor: "rgba(217,164,65,0.15)",

    borderWidth: 1,
    borderColor: "#D9A441",

    borderRadius: 999,

    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    color: "#D9A441",
    fontWeight: "800",
    fontSize: 12,
  },

  cardTitle: {
    color: "#FFFFFF",

    fontSize: 26,

    fontWeight: "900",

    lineHeight: 32,

    marginTop: 18,
  },

  description: {
    color: "#D5DEDF",

    fontSize: 15,

    lineHeight: 24,

    marginTop: 10,

    maxWidth: 500,
  },

  createButton: {
    alignSelf: "flex-start",

    backgroundColor: "#D9A441",

    borderRadius: 14,

    paddingHorizontal: 22,
    paddingVertical: 12,
  },

  createText: {
    color: "#071114",

    fontSize: 15,

    fontWeight: "900",
  },
});