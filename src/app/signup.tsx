import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
  View,
} from "react-native";

import ZuriLogo from "../asset/images/zuri-icon.png (2).png";
import { registerUser } from "../firebase/auth";

export default function Signup() {
  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ==========================
  // CREATE ACCOUNT
  // ==========================

  const handleSignup = async () => {
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all fields."
      );
      return;
    }
console.log("Signup button pressed");
    if (password !== confirmPassword) {
      Alert.alert(
        "Password Error",
        "Passwords do not match."
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

    try {
      setLoading(true);

     await registerUser(
  fullName,
  email,
  password
);
      Alert.alert(
        "Success",
        "Account created successfully!"
      );

      router.replace("/home");
    } catch (error: any) {
      Alert.alert(
        "Signup Failed",
        error.message ??
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
      />

      <SafeAreaView
        style={styles.container}
      >
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
            contentContainerStyle={
              styles.content
            }
            showsVerticalScrollIndicator={
              false
            }
          >
            <View
              style={styles.logoContainer}
            >
              <Image
                source={ZuriLogo}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text
                style={styles.title}
              >
                Create Account
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Join Zuri and unlock
                your personal AI
                assistant.
              </Text>
            </View>

            <Text
              style={styles.label}
            >
              FULL NAME
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#738A8E"
              value={fullName}
              onChangeText={
                setFullName
              }
            />

            <Text
              style={styles.label}
            >
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

            <Text
              style={styles.label}
            >
              PASSWORD
            </Text>

            <View
              style={
                styles.passwordContainer
              }
            >
              <TextInput
                style={
                  styles.passwordInput
                }
                placeholder="Create a password"
                placeholderTextColor="#738A8E"
                secureTextEntry={
                  !showPassword
                }
                value={password}
                onChangeText={
                  setPassword
                }
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                <Text
                  style={styles.eye}
                >
                  {showPassword
                    ? "🙈"
                    : "👁"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.label}
            >
              CONFIRM PASSWORD
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#738A8E"
              secureTextEntry={
                !showPassword
              }
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
            />            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator
                  color="#061014"
                />
              ) : (
                <Text
                  style={
                    styles.signupButtonText
                  }
                >
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <View
              style={styles.loginRow}
            >
              <Text
                style={styles.loginText}
              >
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.replace("/login")
                }
              >
                <Text
                  style={styles.loginLink}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={styles.footer}
            >
              <Text
                style={
                  styles.footerBrand
                }
              >
                ZURI
              </Text>

              <Text
                style={styles.footerDot}
              >
                •
              </Text>

              <Text
                style={
                  styles.footerText
                }
              >
                Powered by KINX
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
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