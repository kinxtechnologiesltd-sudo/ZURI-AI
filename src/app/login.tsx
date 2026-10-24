import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ZuriLogo from "../asset/images/zuri-icon.png (2).png";
import { loginUser } from "../firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================
  // EMAIL LOGIN
  // ==========================

  const handleLogin = async () => {
    Keyboard.dismiss();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);

      await loginUser(
        cleanEmail,
        password
      );

      router.replace("/home");
    } catch (error: any) {
      let message =
        "Unable to sign in. Please try again.";

      switch (error?.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          message =
            "Incorrect email or password.";
          break;

        case "auth/invalid-email":
          message =
            "Please enter a valid email address.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many attempts. Please try again later.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Check your internet connection.";
          break;

        default:
          message =
            error?.message ?? message;
      }

      Alert.alert(
        "Login Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // USER INTERFACE
  // ==========================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#081216"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* LOGO */}

          <View style={styles.logoContainer}>
            <Image
              source={ZuriLogo}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue to Zuri
            </Text>
          </View>

          {/* EMAIL */}

          <Text style={styles.label}>
            Email
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#91A4A7"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#718589"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
              importantForAutofill="no"
              returnKeyType="next"
            />
          </View>

          {/* PASSWORD */}

          <Text style={styles.label}>
            Password
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#91A4A7"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#718589"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              secureTextEntry={!showPassword}
              importantForAutofill="no"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() =>
                setShowPassword(
                  (previous) => !previous
                )
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={21}
                color="#91A4A7"
              />
            </TouchableOpacity>
          </View>

          {/* FORGOT PASSWORD */}

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() =>
              router.push("/forgot-password")
            }
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* SIGN IN */}

          <TouchableOpacity
            style={[
              styles.signInButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#081216" />
            ) : (
              <Text style={styles.signInText}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* SIGN UP */}

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push("/signup")
              }
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>
                Create Account
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
        </View>
      </ScrollView>
    </View>
  );
}

// ==========================
// STYLES
// ==========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#081216",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  formContainer: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 34,
  },

  logo: {
    width: 105,
    height: 105,
    marginBottom: 15,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#91A4A7",
    fontSize: 14,
    textAlign: "center",
    marginTop: 7,
  },

  label: {
    color: "#E7F0F0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
  },

  inputContainer: {
    height: 56,
    width: "100%",
    borderWidth: 1,
    borderColor: "#263B40",
    borderRadius: 12,
    backgroundColor: "#101F24",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 0,
  },

  eyeButton: {
    width: 40,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
  },

  forgotText: {
    color: "#20C7B5",
    fontSize: 13,
    fontWeight: "600",
  },

  signInButton: {
    height: 56,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#20C7B5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.65,
  },

  signInText: {
    color: "#081216",
    fontSize: 16,
    fontWeight: "800",
  },

  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },

  signupText: {
    color: "#91A4A7",
    fontSize: 13,
  },

  signupLink: {
    color: "#20C7B5",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 5,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34,
  },

  footerBrand: {
    color: "#D4A72C",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footerDot: {
    color: "#52676C",
    fontSize: 11,
    marginHorizontal: 8,
  },

  footerText: {
    color: "#718589",
    fontSize: 11,
  },
});