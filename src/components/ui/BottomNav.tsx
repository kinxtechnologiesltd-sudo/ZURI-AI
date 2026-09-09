import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const TABS = [
  { key: "home", label: "Home", route: "/", icon: "home", iconOutline: "home-outline" },
  { key: "chat", label: "Chat", route: "/chat", icon: "chatbubble", iconOutline: "chatbubble-outline" },
{
  key: "memory",
  label: "Memory",
  route: "/memory",
  icon: "albums",
  iconOutline: "albums-outline",
},
  { key: "profile", label: "Profile", route: "/profile", icon: "person", iconOutline: "person-outline" },
] as const;

export default function BottomNav(): React.ReactElement {
  const pathname = usePathname() ?? "/";
  const { width } = useWindowDimensions();
  const showLabels = width >= 768;
  const containerWidth = Math.min(width - 40, Dimensions.get("window").width - 40);
  const itemCount = TABS.length;
  const itemWidth = containerWidth / itemCount;

  const activeIndex = useMemo(() => {
    const idx = TABS.findIndex((t) => t.route === pathname);
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  // Indicator position
  const indicatorWidth = 44;
  const indicatorOffset = (itemWidth - indicatorWidth) / 2;
  const translateX = useRef(new Animated.Value(activeIndex * itemWidth + indicatorOffset)).current;

  // scales for press animation
  const scales = useRef(TABS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const toValue = activeIndex * itemWidth + indicatorOffset;
    Animated.timing(translateX, {
      toValue,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, itemWidth, indicatorOffset, translateX]);

  const onPressIn = (i: number) => {
    Animated.spring(scales[i], {
      toValue: 0.92,
      useNativeDriver: true,
      stiffness: 300,
      damping: 18,
    }).start();
  };

  const onPressOut = (i: number) => {
    Animated.spring(scales[i], {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 300,
      damping: 18,
    }).start();
  };

const onPress = (route: string) => {
  if (pathname !== route) {
    router.push(route as any);
  }
};

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.container}>
        {/* cyan glow */}
        <View style={styles.glow} pointerEvents="none" />

        <View style={[styles.inner, { width: containerWidth }]}>
          <Animated.View
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                transform: [{ translateX }],
              },
            ]}
          />

          {TABS.map((tab, i) => {
            const isActive = i === activeIndex;
            const scaleStyle = { transform: [{ scale: scales[i] }] };
            const iconName = isActive ? tab.icon : tab.iconOutline;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onPress(tab.route)}
                onPressIn={() => onPressIn(i)}
                onPressOut={() => onPressOut(i)}
                style={styles.tab}
                accessibilityLabel={tab.label}
              >
                <Animated.View style={[styles.iconWrapper, scaleStyle]}>
                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={isActive ? "#F2C94C" : "#FFFFFF"}
                    style={isActive ? styles.iconActive : styles.iconInactive}
                  />
                </Animated.View>
               {showLabels && (
  <Text
    style={[
      styles.label,
      isActive && styles.labelActive,
    ]}
  >
    {tab.label}
  </Text>
)}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
    height: 76,
    alignItems: "center",
    zIndex: 999,
  },
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    backgroundColor: "rgba(8,12,16,0.64)",
    borderWidth: 1,
    borderColor: "rgba(255,215,140,0.06)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10D7CB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
    overflow: "visible",
  },
  glow: {
    position: "absolute",
    top: -8,
    left: -16,
    right: -16,
    bottom: -8,
    borderRadius: 34,
    backgroundColor: "rgba(16,215,203,0.04)",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    position: "relative",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconActive: {
    textShadowColor: "rgba(242,201,76,0.14)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  iconInactive: {
    opacity: 0.92,
  },
  label: {
    fontSize: 11,
    color: "#D1EDEA",
    opacity: 0.9,
  },
  labelActive: {
    color: "#F2C94C",
    fontWeight: "700",
  },
  indicator: {
    position: "absolute",
    bottom: 10,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#10D7CB",
    shadowColor: "#10D7CB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
});