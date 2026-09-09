import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { auth } from "../firebase/firebaseConfig";

type CurrencyOption = {
  flag: string;
  label: string;
};

type PlanCardProps = {
  name: string;
  price: string;
  period: string;
  description: string;
  currencies: readonly CurrencyOption[];
  popular?: boolean;
  isWide: boolean;
  onPress: () => void;
};

type FeatureItem = {
  icon: string;
  title: string;
  text: string;
};

type UltraPlan = {
  label: string;
  price: string;
  period: string;
  currency: CurrencyOption[];
};

const currencyCycle: CurrencyOption[] = [
  { flag: "🇳🇬", label: "NGN" },
  { flag: "🇬🇭", label: "GHS" },
  { flag: "🇰🇪", label: "KES" },
  { flag: "🇿🇦", label: "ZAR" },
  { flag: "🇪🇬", label: "EGP" },
];

const featureItems: FeatureItem[] = [
  {
    icon: "💬",
    title: "Unlimited AI Chat",
    text: "Chat more deeply with Zuri and tackle bigger ideas, projects, and conversations.",
  },
  {
    icon: "✨",
    title: "Advanced Image Generation",
    text: "Create more polished visuals with access to Zuri's enhanced creative capabilities.",
  },
  {
    icon: "🧠",
    title: "Enhanced Memory",
    text: "Zuri remembers more useful context and preferences for a more personalized experience.",
  },
  {
    icon: "🔎",
    title: "Deep Research",
    text: "Explore layered questions with broader and more insightful AI-powered research.",
  },
  {
    icon: "🎙️",
    title: "Premium AI Voice",
    text: "Experience natural conversations with Zuri's premium neural voice.",
  },
];

const plans = [
  {
    name: "Weekly",
    price: "$1.49",
    period: "week",
    description: "Full Pro access for 7 days.",
    currencies: [
      { flag: "🇳🇬", label: "₦2,000" },
      { flag: "🇬🇭", label: "GH₵21" },
      { flag: "🇰🇪", label: "KSh199" },
      { flag: "🇿🇦", label: "R28" },
      { flag: "🇪🇬", label: "E£73" },
    ],
    key: "weekly",
    popular: false,
  },
  {
    name: "Monthly",
    price: "$6.49",
    period: "month",
    description: "Full Pro access for one month.",
    currencies: [
      { flag: "🇳🇬", label: "₦8,500" },
      { flag: "🇬🇭", label: "GH₵68" },
      { flag: "🇰🇪", label: "KSh780" },
      { flag: "🇿🇦", label: "R120" },
      { flag: "🇪🇬", label: "E£2,500" },
    ],
    key: "monthly",
    popular: true,
  },
  {
    name: "Yearly",
    price: "$64.99",
    period: "year",
    description: "The best value for long-term creators.",
    currencies: [
      { flag: "🇳🇬", label: "₦85,000" },
      { flag: "🇬🇭", label: "GH₵690" },
      { flag: "🇰🇪", label: "KSh7,200" },
      { flag: "🇿🇦", label: "R1,050" },
      { flag: "🇪🇬", label: "E£24,500" },
    ],
    key: "yearly",
    popular: false,
  },
] as const;

const ultraPlans: UltraPlan[] = [
  {
    label: "Monthly",
    price: "$10.99",
    period: "month",
    currency: [
      { flag: "🇳🇬", label: "₦15,000" },
      { flag: "🇬🇭", label: "GH₵115" },
      { flag: "🇰🇪", label: "KSh1,500" },
      { flag: "🇿🇦", label: "R190" },
      { flag: "🇪🇬", label: "E£4,200" },
    ],
  },
  {
    label: "Yearly",
    price: "$109.99",
    period: "year",
    currency: [
      { flag: "🇳🇬", label: "₦150,000" },
      { flag: "🇬🇭", label: "GH₵1,150" },
      { flag: "🇰🇪", label: "KSh15,000" },
      { flag: "🇿🇦", label: "R1,900" },
      { flag: "🇪🇬", label: "E£42,000" },
    ],
  },
];

function CurrencyTicker({ currencies }: { currencies: readonly CurrencyOption[] }) {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      Animated.timing(slideAnim, {
  toValue: -14,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % currencies.length);
        fadeAnim.setValue(0);
      slideAnim.setValue(14);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [currencies.length, fadeAnim, slideAnim]);

  return (
    <Animated.View style={styles.currencyRow}>
      <Animated.Text
        style={[
          styles.currencyText,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {currencies[index].flag} {currencies[index].label}
      </Animated.Text>
    </Animated.View>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  currencies,
  popular = false,
  isWide,
  onPress,
}: PlanCardProps) {
  return (
    <View style={[styles.planCard, popular && styles.popularCard, isWide && styles.planCardWide]}>
      {popular ? (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      ) : null}

      <Text style={styles.planName}>{name}</Text>
{name === "Yearly" && (
  <View style={styles.bestValueBadge}>
    <Text style={styles.bestValueText}>
      BEST VALUE
    </Text>
  </View>
)}
      <View style={styles.priceBlock}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>/{period}</Text>
      </View>

<CurrencyTicker currencies={currencies} />

<Text style={styles.africaText}>
  Supporting creators across Africa 🌍
</Text>

<Text style={styles.description}>

      </Text>

      <TouchableOpacity
        style={[styles.subscribeButton, popular && styles.popularButton]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Text style={styles.subscribeButtonText}>Choose {name}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [checkoutLoading, setCheckoutLoading] =
  useState<string | null>(null);

 const choosePlan = async (
  plan:
    | "weekly"
    | "monthly"
    | "yearly"
    | "ultra-monthly"
    | "ultra-yearly"
) => {
  try {
    const user = auth.currentUser;
    const idToken =
  await user?.getIdToken();

    if (!user) {
      console.error(
        "No logged-in Firebase user."
      );

      alert(
        "Please log in before subscribing to Zuri."
      );

      return;
    }

    setCheckoutLoading(plan);

    console.log(
      "Selected Zuri subscription:",
      plan
    );

    console.log(
      "Firebase user:",
      user.uid,
      user.email
    );

   const response = await fetch(
  "https://zuri-ai-v1.onrender.com/subscription/create-checkout",
      {
        method: "POST",
headers: {
  "Content-Type":
    "application/json",

  Authorization:
    `Bearer ${idToken}`,
},
body: JSON.stringify({
  plan,

  email:
    user.email,

  name:
    user.displayName ||
    "Zuri User",
}),
      }
    );

    const data =
      await response.json();

    console.log(
      "Zuri checkout response:",
      data
    );

    if (!response.ok) {
      console.error(
        "Checkout error:",
        data
      );

      alert(
        data.message ||
          "Unable to prepare payment."
      );

      return;
    }

const checkoutUrl =
  data.checkoutUrl ||
  data.data?.link;

if (!checkoutUrl) {
  console.error(
    "No Flutterwave checkout URL:",
    data
  );

  alert(
    "Flutterwave did not return a checkout link."
  );

  return;
}

console.log(
  "🔥 Flutterwave checkout URL:",
  checkoutUrl
);

// Open Flutterwave's hosted checkout
await Linking.openURL(
  checkoutUrl
);

  } catch (error) {
    console.error(
      "Unable to connect to checkout:",
      error
    );

    alert(
      "Unable to connect to the payment service."
    );
  } finally {
    setCheckoutLoading(null);
  }
};
  const featureGrid = useMemo(() => featureItems, []);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>ZURI PRO</Text>
          </View>

        <Text style={styles.heading}>
Unlock the Full Power of Zuri
</Text>
<Text style={styles.subheading}>
Create faster.
Research deeper.
Build without limits.
Experience Africa's most advanced creative AI.
</Text>
        </View>

        <View style={[styles.featuresGrid, isWide && styles.featuresGridWide]}>
          {featureGrid.map((feature) => (
            <View key={feature.title} style={[styles.featureCard, isWide && styles.featureCardWide]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.chooseTitle}>Choose your plan</Text>

        <View style={styles.plans}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.key}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              currencies={plan.currencies}
              popular={plan.popular}
              isWide={isWide}
              onPress={() => choosePlan(plan.key as "weekly" | "monthly" | "yearly")}
            />
          ))}
        </View>

        <Text style={styles.footerText}>
          Your Pro access begins after successful payment confirmation.
        </Text>

        <View style={styles.ultraSection}>
          <View style={styles.ultraTopRow}>
            <View style={styles.ultraHeadingBlock}>
              <Text style={styles.ultraLabel}>ZURI ULTRA</Text>
              <Text style={styles.ultraTitle}>The Ultimate AI Creative Experience.</Text>
            </View>

          </View>

          <Text style={styles.ultraDescription}>
           Create music, videos, apps, websites, comics, documents, and stunning visuals with the most advanced version of Zuri.
          </Text>

          <View style={styles.ultraFeatures}>
            <View style={styles.ultraFeature}>
              <Text style={styles.ultraIcon}>🎵</Text>
              <Text style={styles.ultraFeatureTitle}>AI Music Generation</Text>
              <Text style={styles.ultraFeatureText}>Create original music from your ideas.</Text>
            </View>
            <View style={styles.ultraFeature}>
              <Text style={styles.ultraIcon}>🎬</Text>
              <Text style={styles.ultraFeatureTitle}>Animation & Video</Text>
              <Text style={styles.ultraFeatureText}>Bring characters and stories to life.</Text>
            </View>
            <View style={styles.ultraFeature}>
              <Text style={styles.ultraIcon}>💥</Text>
              <Text style={styles.ultraFeatureTitle}>Comic Generation</Text>
              <Text style={styles.ultraFeatureText}>Transform ideas into complete visual stories.</Text>
            </View>
          </View>

          <View style={styles.ultraPriceRow}>
     {ultraPlans.map((plan) => {
  const ultraPlanKey =
    plan.label === "Monthly"
      ? "ultra-monthly"
      : "ultra-yearly";

  return (
    <View
      key={plan.label}
      style={styles.ultraPlanCard}
    >
      <Text style={styles.ultraPrice}>
        {plan.price}
      </Text>

      <Text style={styles.ultraPeriod}>
        / {plan.period}
      </Text>

      <CurrencyTicker
        currencies={plan.currency}
      />

      <TouchableOpacity
        style={styles.ultraSubscribeButton}
        activeOpacity={0.9}
        onPress={() =>
          choosePlan(ultraPlanKey)
        }
        disabled={
          checkoutLoading !== null
        }
      >
        <Text
          style={
            styles.ultraSubscribeButtonText
          }
        >
          {checkoutLoading ===
          ultraPlanKey
            ? "Opening checkout..."
            : `Choose Ultra ${plan.label}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
})}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050816",
  },
  content: {
    width: "100%",
    maxWidth: 1150,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 72,
  },
  contentWide: {
    paddingHorizontal: 36,
    paddingTop: 36,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 28,
  },
  backText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "700",
  },
  hero: {
    alignItems: "center",
    marginBottom: 36,
  },
  proBadge: {
    backgroundColor: "#0F2A35",
    borderWidth: 1,
    borderColor: "#1F6B70",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 16,
  },
  proBadgeText: {
    color: "#5EEAD4",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    maxWidth: 760,
  },
  africaText: {
  color: "#6EE7D8",
  fontSize: 12,
  textAlign: "center",
  marginBottom: 12,
  opacity: 0.85,
},
  subheading: {
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    maxWidth: 700,
    marginTop: 12,
  },
  featuresGrid: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    marginBottom: 42,
  },
  featuresGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  featureCardWide: {
    width: "48%",
    minWidth: 280,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  featureText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },
  chooseTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },
  plans: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  planCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    minHeight: 320,
    justifyContent: "space-between",
  },
  planCardWide: {
    width: "31%",
    minWidth: 240,
    maxWidth: 320,
  },
  popularCard: {
    borderColor: "#14B8A6",
    borderWidth: 2,
    shadowColor: "#14B8A6",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  bestValueBadge: {
  alignSelf: "flex-start",

  marginTop: 8,

  backgroundColor: "#D4A72C",

  paddingHorizontal: 10,

  paddingVertical: 5,

  borderRadius: 999,
},

bestValueText: {
  color: "#061014",

  fontWeight: "900",

  fontSize: 10,

  letterSpacing: 1,
},
  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#134E4A",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 10,
  },
  popularBadgeText: {
    color: "#99F6E4",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  planName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 14,
    marginBottom: 8,
  },
  price: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },
  period: {
    color: "#64748B",
    fontSize: 13,
    marginLeft: 4,
    marginBottom: 4,
  },
  currencyRow: {
    minHeight: 24,
    justifyContent: "center",
    marginBottom: 10,
  },
  currencyText: {
    color: "#2DD4BF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  description: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  subscribeButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#172033",
    justifyContent: "center",
    alignItems: "center",
  },
  popularButton: {
    backgroundColor: "#0F766E",
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  footerText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  ultraSection: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    marginTop: 40,
    padding: 24,
    backgroundColor: "#0A111C",
    borderWidth: 1,
    borderColor: "#5C4C2E",
    borderRadius: 28,
  },
  ultraTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
  },
  ultraHeadingBlock: {
    flex: 1,
    minWidth: 220,
  },
  ultraLabel: {
    color: "#E4B962",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.2,
    marginBottom: 8,
  },
  ultraTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  ultraDescription: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 720,
    marginTop: 16,
    marginBottom: 20,
  },
  ultraFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  ultraFeature: {
    flex: 1,
    minWidth: 220,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#273244",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  ultraIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  ultraFeatureTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  ultraFeatureText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },
  ultraPriceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 18,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#263244",
  },
  ultraPlanCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#293447",
    borderRadius: 20,
    alignItems: "center",
    padding: 16,
  },
  ultraSubscribeButton: {
  width: "100%",
  height: 46,
  borderRadius: 14,
  backgroundColor: "#D4A72C",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 14,
},

ultraSubscribeButtonText: {
  color: "#061014",
  fontSize: 14,
  fontWeight: "900",
},
  ultraPrice: {
    color: "#E4B962",
    fontSize: 22,
    fontWeight: "900",
  },
  ultraPeriod: {
    color: "#71878A",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
});