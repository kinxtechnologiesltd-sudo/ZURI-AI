import { StyleSheet, Text } from "react-native";

type Props = {
  title: string;
};

export default function SectionTitle({
  title,
}: Props) {
  return (
    <Text style={styles.title}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 10,
  },
});