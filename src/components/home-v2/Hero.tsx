import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import { heroSlides } from "./heroData";

type HeroSlide = (typeof heroSlides)[number];

const SLIDE_DISPLAY_DURATION = 7000;
const TRANSITION_DURATION = 1200;
const ZOOM_SCALE = 1.05;

const getGreeting = (hour: number): string => {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Hero(): React.ReactElement {
  const slideCount = heroSlides.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(slideCount > 1 ? 1 : 0);

  const currentOpacity = useRef(new Animated.Value(1)).current;
  const nextOpacity = useRef(new Animated.Value(0)).current;
  const currentScale = useRef(new Animated.Value(1)).current;
  const nextScale = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAnimationValues = useCallback(() => {
    currentOpacity.setValue(1);
    nextOpacity.setValue(0);
    currentScale.setValue(1);
    nextScale.setValue(1);
  }, [currentOpacity, nextOpacity, currentScale, nextScale]);

  const runTransition = useCallback(() => {
    if (slideCount <= 1) {
      return;
    }

    const upcomingIndex = (currentIndex + 1) % slideCount;
    const followingIndex = (upcomingIndex + 1) % slideCount;

    Animated.parallel([
      Animated.timing(currentOpacity, {
        toValue: 0,
        duration: TRANSITION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(nextOpacity, {
        toValue: 1,
        duration: TRANSITION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(currentScale, {
        toValue: ZOOM_SCALE,
        duration: SLIDE_DISPLAY_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(nextScale, {
        toValue: ZOOM_SCALE,
        duration: SLIDE_DISPLAY_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }

      resetAnimationValues();
      setCurrentIndex(upcomingIndex);
      setNextIndex(followingIndex);
    });
  }, [
    currentIndex,
    currentOpacity,
    currentScale,
    nextOpacity,
    nextScale,
    resetAnimationValues,
    slideCount,
  ]);

  useEffect(() => {
    if (slideCount <= 1) {
      setNextIndex(0);
      return;
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(runTransition, SLIDE_DISPLAY_DURATION);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, runTransition, slideCount]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const currentSlide: HeroSlide | undefined =
    slideCount > 0 ? heroSlides[currentIndex] : undefined;
  const greeting = getGreeting(new Date().getHours());

  return (
    <View style={styles.container}>
      <HeroBackground
        currentIndex={currentIndex}
        nextIndex={nextIndex}
        currentOpacity={currentOpacity}
        nextOpacity={nextOpacity}
        currentScale={currentScale}
        nextScale={nextScale}
      />
      {currentSlide ? (
        <HeroContent greeting={greeting} slide={currentSlide} />
      ) : null}
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
  position: "relative",
  backgroundColor: "#071114",
},
});