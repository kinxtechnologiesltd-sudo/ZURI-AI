import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
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

import { useEffect } from "react";
import ZuriLogo from "../asset/images/zuri-icon.png (2).png";
import { loginUser } from "../firebase/auth";
import { auth } from "../firebase/firebaseConfig";
WebBrowser.maybeCompleteAuthSession();
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
const [request, response, promptAsync] =
  Google.useAuthRequest({
    androidClientId:
      "261432661731-cee49iqni6a4v9mfst7dt9n8jc09hb67.apps.googleusercontent.com",

    iosClientId:
      "261432661731-3k5ad10b3ea9rk88dsq1hr6oi0ta3p6b.apps.googleusercontent.com",

    webClientId:
      "261432661731-gm32ncu7rvrtal301v33mgqmmdb1b0pg.apps.googleusercontent.com",
  });

  // ==========================
  // Email Login
  // ==========================

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert(
      "Missing Information",
      "Please enter your email and password."
    );
    return;
  }

  try {
    setLoading(true);

    await loginUser(email, password);

    router.replace("/home");
  } catch (error: any) {
    Alert.alert(
      "Login Failed",
      error.message ?? "Unable to sign in."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const signInWithGoogle = async () => {
    if (response?.type !== "success") return;

    try {
      setLoading(true);

      const accessToken =
        response.authentication?.accessToken;

      if (!accessToken) {
        Alert.alert(
          "Google Login Failed",
          "No access token received."
        );
        return;
      }

      const credential =
        GoogleAuthProvider.credential(null, accessToken);

      await signInWithCredential(
        auth,
        credential
      );

      router.replace("/home");
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Google Login Failed",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  signInWithGoogle();
}, [response]);
const handleGoogleSignIn = async () => {
  if (loading) return;

  try {
    setLoading(true);
    await promptAsync({ showInRecents: true });
  } catch (error: any) {
    Alert.alert(
      "Google Sign-In Failed",
      error.message ?? "Unable to sign in."
    );
  } finally {
    setLoading(false);
  }
};

  // ==========================
// Google Login
// ==========================

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
                Welcome Back
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Sign in to continue
                using Zuri.
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.googleButton
              }
              activeOpacity={0.85}
              onPress={
                handleGoogleSignIn
              }
            disabled={!request || loading}
            >
              <Text
                style={
                  styles.googleIcon
                }
              >
                G
              </Text>

              <Text
                style={
                  styles.googleText
                }
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            <View
              style={
                styles.dividerContainer
              }
            >
              <View
                style={
                  styles.divider
                }
              />

              <Text
                style={
                  styles.dividerText
                }
              >
                OR
              </Text>

              <View
                style={
                  styles.divider
                }
              />
            </View>

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
                placeholder="Enter your password"
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

<TouchableOpacity
  style={styles.forgotButton}
              onPress={() =>
                router.push("/forgot-password")
              }
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
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
                    styles.loginButtonText
                  }
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View
              style={styles.signupRow}
            >
              <Text
                style={
                  styles.signupText
                }
              >
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/signup")
                }
              >
                <Text
                  style={
                    styles.signupLink
                  }
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text
                style={
                  styles.footerBrand
                }
              >
                ZURI
              </Text>

              <Text style={styles.footerDot}>•</Text>

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
  },

  googleButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  googleIcon: {
    fontSize: 22,
    fontWeight: "900",
    color: "#4285F4",
    marginRight: 10,
  },

  googleText: {
    color: "#202124",
    fontSize: 15,
    fontWeight: "700",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#244247",
  },

  dividerText: {
    color: "#738A8E",
    marginHorizontal: 14,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1.5,
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
  },

  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },

  eye: {
    fontSize: 20,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 24,
  },

  forgotText: {
    color: "#D4A72C",
    fontSize: 13,
    fontWeight: "700",
  },

  loginButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#D4A72C",
    justifyContent: "center",
    alignItems: "center",
  },

  loginButtonText: {
    color: "#061014",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  signupText: {
    color: "#819396",
    fontSize: 14,
  },

  signupLink: {
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