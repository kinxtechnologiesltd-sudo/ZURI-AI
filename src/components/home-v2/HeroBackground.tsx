import React from "react";
import { Animated, ImageSourcePropType, StyleSheet, View } from "react-native";

import { heroSlides } from "./heroData";

interface HeroBackgroundProps {
  currentIndex: number;
  nextIndex: number;
  currentOpacity: Animated.Value;
  nextOpacity: Animated.Value;
  currentScale: Animated.Value;
  nextScale: Animated.Value;
}

type HeroSlide = { image: ImageSourcePropType };

const getSlideSource = (slide: HeroSlide): ImageSourcePropType => slide.image;

export default function HeroBackground({
  currentIndex,
  nextIndex,
  currentOpacity,
  nextOpacity,
  currentScale,
  nextScale,
}: HeroBackgroundProps): React.ReactElement {
  const slideCount = heroSlides.length;

  if (slideCount === 0) {
    return <View style={styles.container} />;
  }

  const activeCurrentIndex =
    ((currentIndex % slideCount) + slideCount) % slideCount;
  const activeNextIndex =
    slideCount > 1
      ? ((nextIndex % slideCount) + slideCount) % slideCount
      : activeCurrentIndex;

  return (
    <View style={styles.container}>
      <Animated.Image
        source={getSlideSource(heroSlides[activeCurrentIndex])}
        resizeMode="cover"
        style={[
          styles.image,
          {
            opacity: currentOpacity,
            transform: [{ scale: currentScale }],
          },
        ]}
      />
      <Animated.Image
        source={getSlideSource(heroSlides[activeNextIndex])}
        resizeMode="cover"
        style={[
          styles.image,
          {
            opacity: nextOpacity,
            transform: [{ scale: nextScale }],
          },
        ]}
      />
      <View style={styles.darkOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 720,
    overflow: "hidden",
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    backgroundColor: "#071114",
    position: "relative",
  },
 image: {
  ...StyleSheet.absoluteFill,
},
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6, 16, 20, 0.68)",
  },
});