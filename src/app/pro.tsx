import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PlanCardProps = {
  name: string;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  onPress: () => void;
};

function PlanCard({
  name,
  price,
  period,
  description,
  popular = false,
  onPress,
}: PlanCardProps) {
  return (
    <View
      style={[
        styles.planCard,
        popular && styles.popularCard,
      ]}
    >
      {popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>
            MOST POPULAR
          </Text>
        </View>
      )}

      <Text style={styles.planName}>{name}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>/{period}</Text>
      </View>

      <Text style={styles.description}>
        {description}
      </Text>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          popular && styles.popularButton,
        ]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Text style={styles.subscribeButtonText}>
          Choose {name}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProScreen() {
  const router = useRouter();

 const choosePlan = async (
  plan: "weekly" | "monthly" | "yearly"
) => {
  try {
    console.log("Selected Zuri Pro plan:", plan);

    const response = await fetch(
      "http://localhost:3001/create-checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Checkout error:",
        data.error
      );
      return;
    }

    console.log(
      "Zuri checkout prepared:",
      data
    );
  } catch (error) {
    console.error(
      "Unable to connect to checkout:",
      error
    );
  }
};
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>
              ZURI PRO
            </Text>
          </View>

          <Text style={styles.heading}>
            Unlock the full power of Zuri
          </Text>

       <Text style={styles.subheading}>
  Go beyond the basics with more powerful AI,
  deeper research, enhanced memory and a better
  creative experience.
</Text>
        </View>

       <View style={styles.features}>
  <View style={styles.feature}>
    <Text style={styles.featureIcon}>💬</Text>

    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>
        Unlimited AI Chat
      </Text>

      <Text style={styles.featureText}>
        Chat more with Zuri and tackle bigger ideas,
        projects and conversations.
      </Text>
    </View>
  </View>

  <View style={styles.feature}>
    <Text style={styles.featureIcon}>✨</Text>

    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>
        Advanced Image Generation
      </Text>

      <Text style={styles.featureText}>
        Create more high-quality images with access
        to Zuri&apos;s enhanced creative capabilities.
      </Text>
    </View>
  </View>

  <View style={styles.feature}>
    <Text style={styles.featureIcon}>🧠</Text>

    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>
        Enhanced Memory
      </Text>

      <Text style={styles.featureText}>
        Zuri remembers more useful context and
        preferences for a more personalized experience.
      </Text>
    </View>
  </View>

  <View style={styles.feature}>
    <Text style={styles.featureIcon}>🔎</Text>

    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>
        Deep Research
      </Text>

      <Text style={styles.featureText}>
        Explore complex questions with deeper,
        more comprehensive AI-powered research.
      </Text>
    </View>
  </View>

  <View style={styles.feature}>
    <Text style={styles.featureIcon}>🎙️</Text>

    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>
        Premium AI Voice
      </Text>

      <Text style={styles.featureText}>
        Experience natural conversations with
        Zuri&apos;s premium neural voice.
      </Text>
    </View>
  </View>
</View>
        <Text style={styles.chooseTitle}>
          Choose your plan
        </Text>

        <View style={styles.plans}>
          <PlanCard
  name="Weekly"
  price="$3.99"
  period="week"
  description="Full Pro access for 7 days."
  onPress={() => choosePlan("weekly")}
/>

<PlanCard
  name="Monthly"
  price="$14.99"
  period="month"
  description="Full Pro access for one month."
  popular
  onPress={() => choosePlan("monthly")}
/>

<PlanCard
  name="Yearly"
  price="$99.99"
  period="year"
  description="The best value for long-term creators."
  onPress={() => choosePlan("yearly")}
/>
        </View>

        <Text style={styles.footerText}>
          Your Pro access begins after successful payment
          confirmation.
        </Text>
        <View style={styles.ultraSection}>
  <View style={styles.ultraTopRow}>
    <View>
      <Text style={styles.ultraLabel}>
        ZURI ULTRA
      </Text>

      <Text style={styles.ultraTitle}>
        The creative frontier is coming.
      </Text>
    </View>

    <View style={styles.comingSoonBadge}>
      <Text style={styles.comingSoonText}>
        COMING SOON
      </Text>
    </View>
  </View>

  <Text style={styles.ultraDescription}>
    A new level of creation is coming to Zuri.
    Ultra will unlock powerful tools for turning
    your imagination into music, motion and stories.
  </Text>

  <View style={styles.ultraFeatures}>
    <View style={styles.ultraFeature}>
      <Text style={styles.ultraIcon}>🎵</Text>

      <Text style={styles.ultraFeatureTitle}>
        AI Music Generation
      </Text>

      <Text style={styles.ultraFeatureText}>
        Create original music from your ideas.
      </Text>
    </View>

    <View style={styles.ultraFeature}>
      <Text style={styles.ultraIcon}>🎬</Text>

      <Text style={styles.ultraFeatureTitle}>
        Animation & Video
      </Text>

      <Text style={styles.ultraFeatureText}>
        Bring characters and stories to life.
      </Text>
    </View>

    <View style={styles.ultraFeature}>
      <Text style={styles.ultraIcon}>💥</Text>

      <Text style={styles.ultraFeatureTitle}>
        Comic Generation
      </Text>

      <Text style={styles.ultraFeatureText}>
        Transform ideas into complete visual stories.
      </Text>
    </View>
  </View>

  <View style={styles.ultraPriceRow}>
  <Text style={styles.ultraPrice}>
    $19.99
    <Text style={styles.ultraPeriod}>
      {" "}/ month
    </Text>
  </Text>

  <Text style={styles.ultraPrice}>
    $199.99
    <Text style={styles.ultraPeriod}>
      {" "}/ year
    </Text>
  </Text>
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
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 70,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 35,
  },

  backText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
  },

  hero: {
    alignItems: "center",
    marginBottom: 45,
  },

  proBadge: {
    backgroundColor: "#0F2A35",
    borderWidth: 1,
    borderColor: "#1F6B70",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 20,
  },

  proBadgeText: {
    color: "#5EEAD4",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    textAlign: "center",
    maxWidth: 750,
  },

  subheading: {
    color: "#94A3B8",
    fontSize: 17,
    lineHeight: 27,
    textAlign: "center",
    maxWidth: 650,
    marginTop: 16,
  },

  features: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    marginBottom: 50,
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },

  featureIcon: {
    fontSize: 28,
    marginRight: 18,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 5,
  },

  featureText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 21,
  },

  chooseTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 25,
  },

  plans: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 18,
  },

  planCard: {
    width: 300,
    minHeight: 290,
    backgroundColor: "#0B1220",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 25,
    justifyContent: "space-between",
  },

  popularCard: {
    borderColor: "#14B8A6",
    borderWidth: 2,
  },

  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#134E4A",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 12,
  },

  popularBadgeText: {
    color: "#99F6E4",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  planName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 20,
  },

  price: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },

  period: {
    color: "#64748B",
    fontSize: 14,
    marginLeft: 5,
    marginBottom: 5,
  },

  description: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 25,
  },

  subscribeButton: {
    height: 50,
    borderRadius: 15,
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
    marginTop: 35,
  },
  ultraSection: {
  width: "100%",
  maxWidth: 950,
  alignSelf: "center",
  marginTop: 75,
  padding: 32,
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
  gap: 15,
},

ultraLabel: {
  color: "#E4B962",
  fontSize: 12,
  fontWeight: "900",
  letterSpacing: 2.5,
  marginBottom: 10,
},

ultraTitle: {
  color: "#FFFFFF",
  fontSize: 27,
  fontWeight: "900",
},

comingSoonBadge: {
  backgroundColor: "#2A2112",
  borderWidth: 1,
  borderColor: "#715C35",
  borderRadius: 999,
  paddingHorizontal: 15,
  paddingVertical: 8,
},

comingSoonText: {
  color: "#E4B962",
  fontSize: 10,
  fontWeight: "900",
  letterSpacing: 1.5,
},

ultraDescription: {
  color: "#94A3B8",
  fontSize: 15,
  lineHeight: 24,
  maxWidth: 680,
  marginTop: 18,
  marginBottom: 28,
},

ultraFeatures: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 14,
},

ultraFeature: {
  flex: 1,
  minWidth: 220,
  backgroundColor: "#0F172A",
  borderWidth: 1,
  borderColor: "#273244",
  borderRadius: 20,
  padding: 20,
},

ultraIcon: {
  fontSize: 25,
  marginBottom: 14,
},

ultraFeatureTitle: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
  marginBottom: 7,
},

ultraFeatureText: {
  color: "#94A3B8",
  fontSize: 13,
  lineHeight: 20,
},

ultraPriceRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 30,
  marginTop: 28,
  paddingTop: 24,
  borderTopWidth: 1,
  borderTopColor: "#273244",
},

ultraPrice: {
  color: "#E4B962",
  fontSize: 21,
  fontWeight: "900",
},

ultraPeriod: {
  color: "#71878A",
  fontSize: 13,
  fontWeight: "500",
},
});