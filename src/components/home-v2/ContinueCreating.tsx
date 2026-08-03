import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const projects = [
  {
    title: "Luxury Perfume Advert",
    type: "Image",
    time: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
  },

  {
    title: "Afrobeats Album Cover",
    type: "Music",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  },

  {
    title: "Restaurant Website",
    type: "Website",
    time: "3 days ago",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  },
];

export default function ContinueCreating() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Continue Creating
      </Text>

      <Text style={styles.subtitle}>
        Jump back into your recent creations.
      </Text>      {projects.map((project) => (

        <Pressable
          key={project.title}
          style={styles.card}
        >

          <Image
            source={{ uri: project.image }}
            style={styles.thumbnail}
          />

          <View style={styles.content}>

            <View style={styles.badge}>

              <Text style={styles.badgeText}>
                {project.type}
              </Text>

            </View>

            <Text
              numberOfLines={1}
              style={styles.projectTitle}
            >
              {project.title}
            </Text>

            <Text style={styles.time}>
              {project.time}
            </Text>

            <Pressable style={styles.continueButton}>

              <Text style={styles.continueText}>
                Continue →
              </Text>

            </Pressable>

          </View>

        </Pressable>

      ))}

        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 42,
    marginBottom: 30,
  },

  title: {
    color: "#F5F7F5",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },

  subtitle: {
    color: "#8DA2A6",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },

  card: {
    flexDirection: "row",

    backgroundColor: "#0B171B",

    borderRadius: 24,

    borderWidth: 1,
    borderColor: "#1B353A",

    overflow: "hidden",

    marginBottom: 18,
  },

  thumbnail: {
    width: 180,
    height: 160,

    backgroundColor: "#16282D",
  },

  content: {
    flex: 1,

    padding: 20,

    justifyContent: "space-between",
  },

  badge: {
    alignSelf: "flex-start",

    backgroundColor: "#102126",

    borderRadius: 999,

    borderWidth: 1,
    borderColor: "#214045",

    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    color: "#D9A441",

    fontWeight: "800",

    fontSize: 12,
  },

  projectTitle: {
    color: "#F5F7F5",

    fontSize: 22,

    fontWeight: "800",

    marginTop: 16,
  },

  time: {
    color: "#8DA2A6",

    fontSize: 14,

    marginTop: 8,
  },

  continueButton: {
    alignSelf: "flex-start",

    marginTop: 20,

    backgroundColor: "#D9A441",

    borderRadius: 14,

    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  continueText: {
    color: "#061014",

    fontWeight: "900",

    fontSize: 14,
  },
});