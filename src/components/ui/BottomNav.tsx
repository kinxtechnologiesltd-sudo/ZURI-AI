import { router, usePathname } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Home",
      icon: "🏠",
      route: "/home",
    },
    {
  label: "Chat",
  icon: "💬",
  route: "/chat",
},
{
  label: "History",
  icon: "📜",
  route: "/history",
},
{
  label: "Profile",
  icon: "👤",
  route: "/profile",
},
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = pathname === tab.route;

        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
          >
            <Text
              style={[
                styles.icon,
                active && styles.active,
              ]}
            >
              {tab.icon}
            </Text>

            <Text
              style={[
                styles.label,
                active && styles.active,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",

  backgroundColor: "#0B1120",

  paddingVertical: 14,
  paddingHorizontal: 12,

  borderTopWidth: 1,
  borderTopColor: "#1E293B",

  shadowColor: "#38BDF8",
  shadowOpacity: 0.15,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: -3,
  },

  elevation: 10,
},

  tab: {
    alignItems: "center",
  },

  icon: {
  fontSize: 22,
  color: "#94a3b8",
},

  label: {
  marginTop: 5,
  color: "#94A3B8",
  fontSize: 12,
  fontWeight: "600",
},

 active: {
  color: "#38BDF8",
  fontWeight: "800",
},
});