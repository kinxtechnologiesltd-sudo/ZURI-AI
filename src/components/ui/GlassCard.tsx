import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function GlassCard({
  children,
  style,
}: GlassCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16213A",
    borderRadius: 24,
    padding: 20,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#6366F1",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },
});