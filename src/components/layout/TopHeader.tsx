import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import useUserPlan from "../../hooks/useUserPlan";

type TopHeaderProps = {
  onMenuPress?: () => void;
};

export default function TopHeader({ onMenuPress }: TopHeaderProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width < 600;
  const isSmallPhone = width < 390;

  const { plan, planLoading } = useUserPlan();

  const getPlanLabel = () => {
    if (planLoading) return "LOADING...";
    if (plan === "ultra") return "ZURI ULTRA";
    if (plan === "pro") return "ZURI PRO";
    return "UPGRADE";
  };

  const getMemberLabel = () => {
    if (planLoading) return "Loading...";
    if (plan === "ultra") return "Ultra Member";
    if (plan === "pro") return "Pro Member";
    return "Free Member";
  };

  const handlePlanPress = () => {
    router.push("/pro");
  };

  return (
    <View
      style={[
        styles.container,
        isMobile && styles.mobileContainer,
        isSmallPhone && styles.smallPhoneContainer,
      ]}
    >
      {/* LEFT */}
      <View style={styles.left}>
        <View
          style={[
            styles.statusIcon,
            isMobile && styles.mobileStatusIcon,
            isSmallPhone && styles.smallPhoneStatusIcon,
          ]}
        >
          <Text style={styles.statusLetter}>Z</Text>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.leftInfo}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                isMobile && styles.mobileTitle,
                isSmallPhone && styles.smallPhoneTitle,
              ]}
            >
              Zuri
            </Text>

            <TouchableOpacity
              style={[
                styles.modelBadge,
                isMobile && styles.mobileModelBadge,
                isSmallPhone && styles.smallPhoneModelBadge,
              ]}
              activeOpacity={0.75}
              onPress={handlePlanPress}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Text
                style={[
                  styles.modelText,
                  isSmallPhone && styles.smallPhoneModelText,
                ]}
                numberOfLines={1}
              >
                {getPlanLabel()}
              </Text>

              <Text style={styles.chevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          {!isMobile && (
            <Text style={styles.status}>
              Ready when you are
            </Text>
          )}
        </View>
      </View>

      {/* RIGHT */}
      <View
        style={[
          styles.right,
          isMobile && styles.mobileRight,
          isSmallPhone && styles.smallPhoneRight,
        ]}
      >
        {/* Theme */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isMobile && styles.mobileIconButton,
            isSmallPhone && styles.smallPhoneIconButton,
          ]}
          activeOpacity={0.7}
          hitSlop={6}
        >
          <Text
            style={[
              styles.icon,
              isSmallPhone && styles.smallPhoneIcon,
            ]}
          >
            ☀
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            isMobile && styles.mobileIconButton,
            isSmallPhone && styles.smallPhoneIconButton,
          ]}
          activeOpacity={0.7}
          hitSlop={6}
        >
          <Text
            style={[
              styles.icon,
              isSmallPhone && styles.smallPhoneIcon,
            ]}
          >
            ♢
          </Text>

          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            isMobile && styles.mobileDivider,
            isSmallPhone && styles.smallPhoneDivider,
          ]}
        />

        {/* Profile */}
        <TouchableOpacity
          style={styles.profile}
          activeOpacity={0.8}
          hitSlop={6}
        >
          <View
            style={[
              styles.avatarOuter,
              isMobile && styles.mobileAvatarOuter,
              isSmallPhone && styles.smallPhoneAvatarOuter,
            ]}
          >
            <View
              style={[
                styles.avatar,
                isMobile && styles.mobileAvatar,
                isSmallPhone && styles.smallPhoneAvatar,
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  isSmallPhone && styles.smallPhoneAvatarText,
                ]}
              >
                J
              </Text>
            </View>
          </View>

          {!isMobile && (
            <View style={styles.profileInfo}>
              <Text style={styles.name}>Joseph</Text>

              <Text style={styles.plan}>
                {getMemberLabel()}
              </Text>
            </View>
          )}

          {!isMobile && (
            <Text style={styles.profileArrow}>
              ⌄
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 76,
    paddingHorizontal: 26,
    backgroundColor: "#081216",
    borderBottomWidth: 1,
    borderBottomColor: "#182A30",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  mobileContainer: {
    height: 64,
    paddingHorizontal: 12,
  },

  smallPhoneContainer: {
    height: 60,
    paddingHorizontal: 10,
  },

  /* LEFT */

  left: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },

  statusIcon: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#102A30",
    borderWidth: 1,
    borderColor: "#715C35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  mobileStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    marginRight: 8,
  },

  smallPhoneStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginRight: 7,
  },

  statusLetter: {
    color: "#E4B962",
    fontSize: 20,
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#19D3C5",
    right: -2,
    bottom: 3,
    borderWidth: 2,
    borderColor: "#081216",
  },

  leftInfo: {
    flexShrink: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  title: {
    color: "#F5F3EC",
    fontSize: 17,
    fontWeight: "800",
    marginRight: 9,
  },

  mobileTitle: {
    fontSize: 16,
    marginRight: 7,
  },

  smallPhoneTitle: {
    fontSize: 15,
    marginRight: 6,
  },

  /*
   * PLAN / UPGRADE
   *
   * The visible badge stays compact,
   * while hitSlop makes it comfortable to tap.
   */

  modelBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    backgroundColor: "#10272C",
    borderWidth: 1,
    borderColor: "#5C4C2E",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  mobileModelBadge: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
  },

  smallPhoneModelBadge: {
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  modelText: {
    color: "#DDB35E",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  smallPhoneModelText: {
    fontSize: 7,
    letterSpacing: 0.8,
  },

  chevron: {
    color: "#758C8F",
    fontSize: 11,
    marginLeft: 5,
  },

  status: {
    color: "#71878A",
    fontSize: 11,
    marginTop: 3,
  },

  /* RIGHT */

  right: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },

  mobileRight: {
    marginLeft: 6,
  },

  smallPhoneRight: {
    marginLeft: 4,
  },

  iconButton: {
    position: "relative",
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#0D1D22",
    borderWidth: 1,
    borderColor: "#1B3036",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  mobileIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginLeft: 4,
  },

  smallPhoneIconButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    marginLeft: 3,
  },

  icon: {
    color: "#9FB0B2",
    fontSize: 17,
  },

  smallPhoneIcon: {
    fontSize: 15,
  },

  notificationDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0B45D",
    right: 6,
    top: 6,
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#1A2C31",
    marginHorizontal: 15,
  },

  mobileDivider: {
    height: 24,
    marginHorizontal: 5,
  },

  smallPhoneDivider: {
    height: 22,
    marginHorizontal: 4,
  },

  /* PROFILE */

  profile: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#8A6C36",
    justifyContent: "center",
    alignItems: "center",
  },

  mobileAvatarOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  smallPhoneAvatarOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#123037",
    justifyContent: "center",
    alignItems: "center",
  },

  mobileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  smallPhoneAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },

  avatarText: {
    color: "#E8BE6B",
    fontSize: 14,
    fontWeight: "800",
  },

  smallPhoneAvatarText: {
    fontSize: 12,
  },

  profileInfo: {
    marginLeft: 10,
  },

  name: {
    color: "#EEF1ED",
    fontSize: 13,
    fontWeight: "700",
  },

  plan: {
    color: "#71878A",
    fontSize: 10,
    marginTop: 2,
  },

  profileArrow: {
    color: "#71878A",
    fontSize: 13,
    marginLeft: 10,
  },
});