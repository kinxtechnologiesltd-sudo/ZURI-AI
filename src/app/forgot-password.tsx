import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import ZuriLogo from "../asset/images/zuri-icon.png (2).png";
import { resetPassword } from "../firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Missing Email",
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Sending reset email...");

      await resetPassword(email.trim());

      console.log("Reset email sent.");

      Alert.alert(
        "Success",
        "If an account exists with this email, a password reset link has been sent."
      );

      setCountdown(20);
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Reset Failed",
        error?.message || "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Image
                source={ZuriLogo}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>
                Forgot Password
              </Text>

              <Text style={styles.subtitle}>
                Enter the email linked to your
                account and we'll send you a
                password reset link.
              </Text>
            </View>

            <Text style={styles.label}>
              EMAIL
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#738A8E"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

<TouchableOpacity
  style={styles.resetButton}
  activeOpacity={0.85}
  onPress={async () => {
    console.log("1");

    try {
      console.log("2");

      await handleResetPassword();

      console.log("3");
    } catch (e) {
      console.log("ERROR:", e);
    }

    console.log("4");
  }}
>
  <Text style={styles.resetButtonText}>
    Send Reset Link
  </Text>
</TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerBrand}>
                ZURI
              </Text>

              <Text style={styles.footerDot}>
                •
              </Text>

              <Text style={styles.footerText}>
                Powered by KINX
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061014",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 36,
  },

  logo: {
    width: 180,
    height: 180,
    marginBottom: 18,
  },

  title: {
    color: "#F4F7F5",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#819396",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  label: {
    color: "#10E0D4",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 8,
  },

  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#0C1D21",
    borderWidth: 1,
    borderColor: "#244247",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 26,
  },

  resetButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#D4A72C",
    justifyContent: "center",
    alignItems: "center",
  },

  resetButtonText: {
    color: "#061014",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  backButton: {
    alignSelf: "center",
    marginTop: 24,
  },

  backText: {
    color: "#10E0D4",
    fontSize: 15,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  footerBrand: {
    color: "#D4A72C",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 2,
  },

  footerDot: {
    color: "#5D7377",
    marginHorizontal: 10,
    fontSize: 12,
  },

  footerText: {
    color: "#738A8E",
    fontSize: 12,
  },
});