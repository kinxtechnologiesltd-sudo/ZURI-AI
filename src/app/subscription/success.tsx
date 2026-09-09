import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SubscriptionSuccessScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      status?: string;
      transaction_id?: string;
      tx_ref?: string;
    }>();

  const {
    status,
    transaction_id,
    tx_ref,
  } = params;

  const [loading, setLoading] =
    useState(true);

  const [success, setSuccess] =
    useState(false);

  const [message, setMessage] =
    useState(
      "Verifying your payment..."
    );

  useEffect(() => {
    console.log(
      "===================================="
    );

    console.log(
      "FLUTTERWAVE RETURN PARAMETERS:"
    );

    console.log({
      status,
      transaction_id,
      tx_ref,
    });

    console.log(
      "===================================="
    );

    const verifyPayment = async () => {
      try {
        // =========================================
        // CHECK WHAT FLUTTERWAVE SENT
        // =========================================

        if (!transaction_id) {
          console.error(
            "❌ No transaction_id received from Flutterwave."
          );

          setSuccess(false);

          setMessage(
            "We couldn't find your Flutterwave transaction."
          );

          setLoading(false);

          return;
        }

        // =========================================
        // VERIFY WITH OUR BACKEND
        // =========================================

        console.log(
          "🔎 Sending transaction to Zuri backend:",
          transaction_id
        );

 const response =
  await fetch(
    `https://zuri-ai-v1.onrender.com/subscription/verify?transaction_id=${encodeURIComponent(
      String(transaction_id)
    )}`
  );
        const data =
          await response.json();

        console.log(
          "ZURI PAYMENT VERIFICATION RESPONSE:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Payment verification failed."
          );
        }

        // =========================================
        // SUCCESS
        // =========================================

        setSuccess(true);

        if (
          data.plan === "ultra"
        ) {
          setMessage(
            "Zuri Ultra has been activated successfully!"
          );
        } else if (
          data.plan === "pro"
        ) {
          setMessage(
            "Zuri Pro has been activated successfully!"
          );
        } else {
          setMessage(
            "Your subscription has been activated successfully!"
          );
        }

      } catch (error) {
        console.error(
          "❌ Subscription verification error:",
          error
        );

        setSuccess(false);

        setMessage(
          error instanceof Error
            ? error.message
            : "We could not verify your payment."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [
    status,
    transaction_id,
    tx_ref,
  ]);

  // ===========================================
  // LOADING
  // ===========================================

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.title}>
          Verifying payment
        </Text>

        <Text style={styles.message}>
          Please wait while we confirm
          your payment with Flutterwave.
        </Text>
      </View>
    );
  }

  // ===========================================
  // RESULT
  // ===========================================

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>
        {success ? "✓" : "!"}
      </Text>

      <Text style={styles.title}>
        {success
          ? "Payment Successful"
          : "Payment Verification"}
      </Text>

      <Text style={styles.message}>
        {message}
      </Text>

      {success && (
        <Text style={styles.subMessage}>
          Your Zuri subscription is now
          active. Your account status
          will update automatically.
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.replace("/chat")
        }
      >
        <Text style={styles.buttonText}>
          Return to Zuri
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061014",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  icon: {
    fontSize: 64,
    fontWeight: "900",
    marginBottom: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },

  message: {
    color: "#B8C5C8",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 600,
  },

  subMessage: {
    color: "#8FA3A7",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 600,
    marginTop: 12,
  },

  button: {
    marginTop: 30,
    paddingHorizontal: 28,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D4A72C",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#061014",
    fontSize: 15,
    fontWeight: "900",
  },
});