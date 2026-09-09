import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

interface HeroContentProps {
  greeting: string;
  slide: {
    title: string;
    subtitle: string;
    accent: string;
  };
}

export default function HeroContent({
  greeting,
  slide,
}: HeroContentProps): React.ReactElement {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // run sequence when slide changes
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [slide, opacity, translateY]);

  const animatedStyle = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.greeting, animatedStyle]}>
        {greeting},  👋
      </Animated.Text>

      <Animated.Text style={[styles.title, animatedStyle]}>
        {slide.title}
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, animatedStyle]}>
        {slide.subtitle}
      </Animated.Text>

      <Animated.View
        style={[styles.accentLine, animatedStyle, { backgroundColor: slide.accent }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    zIndex: 10,
  },

  greeting: {
    color: "#D9A441",
    fontSize: width > 900 ? 20 : 17,
    fontWeight: "700",
    marginBottom: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: width > 900 ? 54 : 38,
    fontWeight: "900",
    textAlign: "center",
    maxWidth: 900,
  },

  subtitle: {
    color: "#E3ECEC",
    textAlign: "center",
    marginTop: 20,
    fontSize: width > 900 ? 20 : 17,
    lineHeight: width > 900 ? 32 : 28,
    maxWidth: 760,
  },

  accentLine: {
    width: 120,
    height: 4,
    borderRadius: 999,
    marginTop: 32,
  },
});