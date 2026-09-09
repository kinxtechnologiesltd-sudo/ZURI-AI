import { StyleSheet, Text, View } from "react-native";

type FeatureCardProps = {
  title: string;
  subtitle: string;
};

export default function FeatureCard({
  title,
  subtitle,
}: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
  width: "31%",
  backgroundColor: "#111827",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#1E293B",
  padding: 16,
  marginBottom: 16,
  minHeight: 110,
},

 title: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
  marginBottom: 6,
},

subtitle: {
  color: "#94A3B8",
  fontSize: 13,
  lineHeight: 20,
},
});