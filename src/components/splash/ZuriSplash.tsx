import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import AthenaLogo from "../ui/AthenaLogo";

export default function ZuriSplash() {
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const glowOpacity = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.03,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();

  Animated.sequence([
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),

      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]),

    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),

    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),
  ]).start();
}, []));

  return (
    <View style={styles.container}>
<Animated.View
  style={[
    styles.glow,
    {
      opacity: glowOpacity,
      transform: [
        {
          scale: logoScale,
        },
      ],
    },
  ]}
/>

<View style={styles.glow2} />

<View style={styles.glow3} />

      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [
            {
              scale: logoScale,
            },
          ],
        }}
      >
        <AthenaLogo />
      </Animated.View>

      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
          },
        ]}
      >
        ZURI
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleOpacity,
          },
        ]}
      >
        Intelligence • Beauty • Purpose
      </Animated.Text>

      <Animated.Text
        style={[
          styles.powered,
          {
            opacity: subtitleOpacity,
          },
        ]}
      >
        Powered by KinX
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050608",
    justifyContent: "center",
    alignItems: "center",
  },

glow: {
  position: "absolute",
  width: 320,
  height: 320,
  borderRadius: 160,
  backgroundColor: "rgba(16,224,212,0.10)",
},

glow2: {
  position: "absolute",
  top: -120,
  right: -80,
  width: 260,
  height: 260,
  borderRadius: 130,
  backgroundColor: "rgba(245,185,66,0.06)",
},

glow3: {
  position: "absolute",
  bottom: -140,
  left: -100,
  width: 300,
  height: 300,
  borderRadius: 150,
  backgroundColor: "rgba(16,224,212,0.05)",
},
title: {
  color: "#FFFFFF",
  fontSize: 46,
  fontWeight: "900",
  letterSpacing: 12,
  marginTop: 28,
},

subtitle: {
  color: "#10E0D4",
  marginTop: 14,
  fontSize: 14,
  letterSpacing: 3,
  textTransform: "uppercase",
},

  powered: {
    color: "#7E8A94",
    marginTop: 60,
    fontSize: 13,
    letterSpacing: 1,
  },
});