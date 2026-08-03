import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const inspiration = [
  {
    title: "Luxury Brands",
    category: "Premium",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900",
  },

  {
    title: "Church Flyers",
    category: "Faith",
    image:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=900",
  },

  {
    title: "Fashion Posters",
    category: "Style",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900",
  },

  {
    title: "Restaurant Ads",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900",
  },

  {
    title: "Tech Startups",
    category: "Technology",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900",
  },

  {
    title: "Social Media",
    category: "Content",
    image:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=900",
  },
];

export default function Inspiration() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Inspiration
      </Text>

      <Text style={styles.subtitle}>
        Explore beautiful ideas to spark
        your next creation.
      </Text>      <View style={styles.grid}>

        {inspiration.map((item) => (

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

              <Pressable style={styles.button}>

                <Text style={styles.buttonText}>
                  Explore →
                </Text>

              </Pressable>

            </View>

          </Pressable>

        ))}

      </View>

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
    maxWidth: 600,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48.5%",
    height: 240,

    borderRadius: 24,

    overflow: "hidden",

    marginBottom: 18,

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

  backgroundColor: "rgba(6,16,20,0.55)",
},

  content: {
    flex: 1,
    justifyContent: "space-between",

    padding: 22,
  },

  badge: {
    alignSelf: "flex-start",

    backgroundColor: "rgba(217,164,65,0.15)",

    borderRadius: 999,

    borderWidth: 1,
    borderColor: "#D9A441",

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
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 20,
  },

  button: {
    alignSelf: "flex-start",

    backgroundColor: "#D9A441",

    borderRadius: 14,

    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  buttonText: {
    color: "#061014",
    fontSize: 14,
    fontWeight: "900",
  },
});