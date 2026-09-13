import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
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
import { auth } from "../firebase/firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
  // GOOGLE RESPONSE
  // ==========================

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
          GoogleAuthProvider.credential(
            null,
            accessToken
          );

        await signInWithCredential(
          auth,
          credential
        );

        router.replace("/home");
      } catch (error: any) {
        console.log(error);

        Alert.alert(
          "Google Login Failed",
          error?.message ??
            "Unable to sign in with Google."
        );
      } finally {
        setLoading(false);
      }
    };

    signInWithGoogle();
  }, [response]);

  // ==========================
  // EMAIL LOGIN
  // ==========================

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      Keyboard.dismiss();

      await loginUser(
        email.trim(),
        password
      );

      router.replace("/home");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.message ??
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // GOOGLE LOGIN
  // ==========================

  const handleGoogleSignIn = async () => {
    if (loading) return;

    try {
      await promptAsync({
        showInRecents: true,
      });
    } catch (error: any) {
      Alert.alert(
        "Google Sign-In Failed",
        error?.message ??
          "Unable to sign in with Google."
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
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
              color="#68777A"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8A9799"
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
              color="#68777A"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#8A9799"
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
                color="#68777A"
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
            style={styles.signInButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.signInText}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* DIVIDER */}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />

            <Text style={styles.orText}>
              OR
            </Text>

            <View style={styles.divider} />
          </View>

          {/* GOOGLE */}

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={!request || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.googleG}>
              G
            </Text>

            <Text style={styles.googleText}>
              Continue with Google
            </Text>
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

  // ==========================
  // LOGO
  // ==========================

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
    color: "#071114",
    fontSize: 31,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#68777A",
    fontSize: 14,
    textAlign: "center",
    marginTop: 7,
  },

  // ==========================
  // LABELS
  // ==========================

  label: {
    color: "#071114",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
  },

  // ==========================
  // INPUT
  // ==========================

  inputContainer: {
    height: 56,
    width: "100%",
    borderWidth: 1,
    borderColor: "#D7E0E1",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
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
    color: "#071114",
    fontSize: 15,
    paddingVertical: 0,
  },

  eyeButton: {
    width: 40,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  // ==========================
  // FORGOT
  // ==========================

  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
  },

  forgotText: {
    color: "#087F78",
    fontSize: 13,
    fontWeight: "600",
  },

  // ==========================
  // SIGN IN
  // ==========================

  signInButton: {
    height: 56,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#071114",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  // ==========================
  // DIVIDER
  // ==========================

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E1E7E8",
  },

  orText: {
    color: "#8A9799",
    fontSize: 11,
    fontWeight: "700",
    marginHorizontal: 14,
    letterSpacing: 1,
  },

  // ==========================
  // GOOGLE
  // ==========================

  googleButton: {
    height: 56,
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E0E1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googleG: {
    color: "#4285F4",
    fontSize: 20,
    fontWeight: "900",
    marginRight: 10,
  },

  googleText: {
    color: "#202124",
    fontSize: 14,
    fontWeight: "700",
  },

  // ==========================
  // SIGN UP
  // ==========================

  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },

  signupText: {
    color: "#68777A",
    fontSize: 13,
  },

  signupLink: {
    color: "#087F78",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 5,
  },

  // ==========================
  // FOOTER
  // ==========================

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
    color: "#A7B3B5",
    fontSize: 11,
    marginHorizontal: 8,
  },

  footerText: {
    color: "#8A9799",
    fontSize: 11,
  },
});