import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Animated,
    Easing,
    StyleSheet,
} from "react-native";

import { heroSlides } from "./heroData";

export default function HeroBackground() {

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [nextIndex, setNextIndex] =
    useState(1);

  const currentOpacity =
    useRef(
      new Animated.Value(1)
    ).current;

  const nextOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const currentScale =
    useRef(
      new Animated.Value(1)
    ).current;

  const nextScale =
    useRef(
      new Animated.Value(1)
    ).current;

  useEffect(() => {

    const interval = setInterval(() => {

      nextScale.setValue(1);

      Animated.timing(nextScale, {

        toValue: 1.08,

        duration: 7000,

        easing: Easing.linear,

        useNativeDriver: true,

      }).start();

      Animated.parallel([

        Animated.timing(currentOpacity, {

          toValue: 0,

          duration: 1400,

          easing: Easing.inOut(Easing.ease),

          useNativeDriver: true,

        }),

        Animated.timing(nextOpacity, {

          toValue: 1,

          duration: 1400,

          easing: Easing.inOut(Easing.ease),

          useNativeDriver: true,

        }),

      ]).start(() => {

setCurrentIndex((prev) => {

  const newCurrent = nextIndex;

  setNextIndex(
    (newCurrent + 1) %
    heroSlides.length
  );

  return newCurrent;

});
        currentOpacity.setValue(1);

        nextOpacity.setValue(0);

      });

    }, 7000);

    return () =>
      clearInterval(interval);

}, [nextIndex]);

return (

  <>
    <Animated.Image
      source={
        heroSlides[currentIndex].image
      }
      resizeMode="cover"
      style={[
        styles.background,

        {
          opacity:
            currentOpacity,

          transform: [
            {
              scale:
                currentScale,
            },
          ],
        },
      ]}
    />

    <Animated.Image
      source={
        heroSlides[nextIndex].image
      }
      resizeMode="cover"
      style={[
        styles.background,

        {
          opacity:
            nextOpacity,

          transform: [
            {
              scale:
                nextScale,
            },
          ],
        },
      ]}
    />

    <Animated.View
      style={styles.overlay}
    />

  </>

);
}
const styles = StyleSheet.create({
 background: {
  ...StyleSheet.absoluteFill,

  width: "100%",
  height: "100%",
},

 overlay: {
  ...StyleSheet.absoluteFill,

  backgroundColor: "rgba(6,16,20,0.68)",

  },

});