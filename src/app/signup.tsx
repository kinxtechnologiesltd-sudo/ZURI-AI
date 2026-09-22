import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ZuriLogo from "../asset/images/zuri-icon.png (2).png";
import { registerUser } from "../firebase/auth";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================
  // CREATE ACCOUNT
  // ==========================

  const handleSignup = async () => {
    Keyboard.dismiss();

    const cleanedName = fullName.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (
      !cleanedName ||
      !cleanedEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all fields."
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanedEmail)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Signup button pressed");

      await registerUser(
        cleanedName,
        cleanedEmail,
        password
      );

      Alert.alert(
        "Success",
        "Your Zuri account has been created successfully!",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/home"),
          },
        ]
      );
    } catch (error: any) {
      console.log("Signup Error:", error);

      let errorMessage =
        "Unable to create your account. Please try again.";

      switch (error?.code) {
        case "auth/email-already-in-use":
          errorMessage =
            "This email is already registered. Please sign in instead.";
          break;

        case "auth/invalid-email":
          errorMessage =
            "The email address is invalid.";
          break;

        case "auth/weak-password":
          errorMessage =
            "Your password is too weak. Use at least 6 characters.";
          break;

        case "auth/network-request-failed":
          errorMessage =
            "Network error. Please check your internet connection.";
          break;

        case "auth/operation-not-allowed":
          errorMessage =
            "Email and password registration is not enabled in Firebase.";
          break;

        default:
          errorMessage =
            error?.message || errorMessage;
      }

      Alert.alert(
        "Signup Failed",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // USER INTERFACE
  // ==========================

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#061014"
      />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
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
                Create Account
              </Text>

              <Text style={styles.subtitle}>
                Join Zuri and unlock{"\n"}
                your personal AI assistant.
              </Text>
            </View>

            {/* FULL NAME */}

            <Text style={styles.label}>
              FULL NAME
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#738A8E"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              editable={!loading}
            />

            {/* EMAIL */}

            <Text style={styles.label}>
              EMAIL
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#738A8E"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
              returnKeyType="next"
              editable={!loading}
            />

            {/* PASSWORD */}

            <Text style={styles.label}>
              PASSWORD
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                placeholderTextColor="#738A8E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                returnKeyType="next"
                editable={!loading}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.eye}>
                  {showPassword ? "🙈" : "👁"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CONFIRM PASSWORD */}

            <Text style={styles.label}>
              CONFIRM PASSWORD
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                placeholderTextColor="#738A8E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                editable={!loading}
              />
            </View>

            {/* CREATE ACCOUNT BUTTON */}

            <TouchableOpacity
              style={[
                styles.signupButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#061014" />
              ) : (
                <Text style={styles.signupButtonText}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* LOGIN LINK */}

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() => router.replace("/login")}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* FOOTER */}

            <View style={styles.footer}>
              <Text style={styles.footerBrand}>
                ZURI
              </Text>

              <Text style={styles.footerDot}>
                •
              </Text>

              <Text style={styles.footerText}>
                Powered by KYNX
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// ==========================
// STYLES
// ==========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061014",
  },

  keyboardContainer: {
    flex: 1,
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
    marginBottom: 20,
  },

  passwordContainer: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#0C1D21",
    borderWidth: 1,
    borderColor: "#244247",
    paddingLeft: 16,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 15,
  },

  eyeButton: {
    width: 42,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  eye: {
    fontSize: 20,
  },

  signupButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#D4A72C",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.65,
  },

  signupButtonText: {
    color: "#061014",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  loginText: {
    color: "#819396",
    fontSize: 14,
  },

  loginLink: {
    color: "#10E0D4",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
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