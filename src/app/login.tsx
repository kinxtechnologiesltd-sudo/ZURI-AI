import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import ZuriLogo from "../asset/images/zuri-icon.png (2).png";
import AfricaBackground from "../components/home-v2/AfricaBackground";
import { loginUser } from "../firebase/auth";
import { auth } from "../firebase/firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 380;
  const isPhone = width < 600;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [focusedField, setFocusedField] = useState<
    "email" | "password" | null
  >(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

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
  // Intro Animation
  // ==========================
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ==========================
  // Email Login
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

      await loginUser(email.trim(), password);

      router.replace("/home");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.message ?? "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Google Login Response
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
  // Google Login
  // ==========================
  const handleGoogleSignIn = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await promptAsync({
        showInRecents: true,
      });
    } catch (error: any) {
      Alert.alert(
        "Google Sign-In Failed",
        error?.message ??
          "Unable to sign in with Google."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Email → Password
  // ==========================
  const focusPassword = () => {
    passwordRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#071114"
      />

      <AfricaBackground />

      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
     <ScrollView
  keyboardShouldPersistTaps="always"
  keyboardDismissMode={
    Platform.OS === "ios"
      ? "interactive"
      : "none"
  }
  contentContainerStyle={[
    styles.content,
    isPhone && styles.mobileContent,
    isSmallPhone &&
      styles.smallPhoneContent,
  ]}
  showsVerticalScrollIndicator={false}
>
          <Animated.View
            style={[
              styles.authCard,
              isPhone && styles.mobileAuthCard,
              isSmallPhone &&
                styles.smallPhoneAuthCard,
              {
                opacity: fade,
                transform: [{ translateY }],
              },
            ]}
          >
            {/* ==========================
                LOGO
            ========================== */}
            <View
              style={[
                styles.logoContainer,
                isPhone &&
                  styles.mobileLogoContainer,
              ]}
            >
              <Image
                source={ZuriLogo}
                style={[
                  styles.logo,
                  isPhone && styles.mobileLogo,
                  isSmallPhone &&
                    styles.smallPhoneLogo,
                ]}
                resizeMode="contain"
              />

              <Text
                style={[
                  styles.title,
                  isPhone && styles.mobileTitle,
                  isSmallPhone &&
                    styles.smallPhoneTitle,
                ]}
              >
                Welcome Back
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  isPhone && styles.mobileSubtitle,
                ]}
              >
                Africa's Creative Intelligence awaits.
                Continue creating with the future of AI.
              </Text>
            </View>

            {/* ==========================
                GOOGLE
            ========================== */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                isPhone &&
                  styles.mobileGoogleButton,
              ]}
              activeOpacity={0.85}
              onPress={handleGoogleSignIn}
              disabled={!request || loading}
            >
              <Text style={styles.googleIcon}>
                G
              </Text>

              <Text
                style={[
                  styles.googleText,
                  isSmallPhone &&
                    styles.smallPhoneGoogleText,
                ]}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* ==========================
                DIVIDER
            ========================== */}
            <View
              style={styles.dividerContainer}
            >
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                OR
              </Text>

              <View style={styles.divider} />
            </View>

            {/* ==========================
                EMAIL
            ========================== */}
            <Text style={styles.label}>
              EMAIL
            </Text>

            <TextInput
              ref={emailRef}
              style={[
                styles.input,
                isPhone && styles.mobileInput,
                focusedField === "email" &&
                  styles.inputFocused,
              ]}
              placeholder="Enter your email"
              placeholderTextColor="#738A8E"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              onFocus={() =>
                setFocusedField("email")
              }
              onBlur={() =>
                setFocusedField(null)
              }
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={focusPassword}
            />

            {/* ==========================
                PASSWORD
            ========================== */}
            <Text style={styles.label}>
              PASSWORD
            </Text>

            <View
              style={[
                styles.passwordContainer,
                isPhone &&
                  styles.mobilePasswordContainer,
                focusedField === "password" &&
                  styles.inputFocused,
              ]}
            >
              <TextInput
                ref={passwordRef}
                style={[
                  styles.passwordInput,
                  isPhone &&
                    styles.mobilePasswordInput,
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#738A8E"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() =>
                  setFocusedField("password")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textContentType="password"
                autoComplete="password"
                keyboardType="default"
                returnKeyType="done"
                blurOnSubmit={false}
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
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={22}
                  color="#8AA6AA"
                />
              </TouchableOpacity>
            </View>

            {/* ==========================
                FORGOT PASSWORD
            ========================== */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() =>
                router.push("/forgot-password")
              }
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* ==========================
                SIGN IN
            ========================== */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isPhone &&
                  styles.mobileLoginButton,
              ]}
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
                  style={styles.loginButtonText}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* ==========================
                SIGN UP
            ========================== */}
            <View
              style={[
                styles.signupRow,
                isSmallPhone &&
                  styles.smallPhoneSignupRow,
              ]}
            >
              <Text
                style={[
                  styles.signupText,
                  isSmallPhone &&
                    styles.smallPhoneSignupText,
                ]}
              >
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/signup")
                }
                hitSlop={{
                  top: 8,
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
              >
                <Text
                  style={[
                    styles.signupLink,
                    isSmallPhone &&
                      styles.smallPhoneSignupLink,
                  ]}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* ==========================
                FOOTER
            ========================== */}
            <View
              style={[
                styles.footer,
                isPhone && styles.mobileFooter,
              ]}
            >
              <Text
                style={styles.footerBrand}
              >
                ZURI
              </Text>

              <Text
                style={styles.footerDot}
              >
                •
              </Text>

              <Text
                style={styles.footerText}
              >
                Powered by KINX
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071114",
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

  mobileContent: {
    paddingHorizontal: 12,
    paddingVertical: 20,
  },

  smallPhoneContent: {
    paddingHorizontal: 8,
    paddingVertical: 14,
  },

  authCard: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",

    backgroundColor: "rgba(10,18,22,0.82)",

    borderRadius: 30,

    borderWidth: 1,
    borderColor: "rgba(16,224,212,0.10)",

    paddingHorizontal: 28,
    paddingVertical: 34,

    shadowColor: "#10E0D4",

    shadowOffset: {
      width: 0,
      height: 18,
    },

    shadowOpacity: 0.15,
    shadowRadius: 30,

    elevation: 10,
  },

  mobileAuthCard: {
    maxWidth: 520,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 22,
  },

  smallPhoneAuthCard: {
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 18,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 36,
  },

  mobileLogoContainer: {
    marginBottom: 22,
  },

  logo: {
    width: 180,
    height: 180,
    marginBottom: 18,
  },

  mobileLogo: {
    width: 105,
    height: 105,
    marginBottom: 9,
  },

  smallPhoneLogo: {
    width: 88,
    height: 88,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    textAlign: "center",
  },

  mobileTitle: {
    fontSize: 29,
  },

  smallPhoneTitle: {
    fontSize: 26,
  },

  subtitle: {
    color: "#AFC4C8",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 34,
    maxWidth: 420,
  },

  mobileSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 18,
    paddingHorizontal: 6,
  },

  googleButton: {
    height: 60,
    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginBottom: 26,

    shadowColor: "#FFFFFF",
    shadowOpacity: 0.08,
    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 6,
  },

  mobileGoogleButton: {
    height: 52,
    borderRadius: 15,
    marginBottom: 18,
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

  smallPhoneGoogleText: {
    fontSize: 13,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 8,
    marginTop: 7,
  },

  input: {
    height: 62,
    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.04)",

    borderWidth: 1.2,
    borderColor: "rgba(16,224,212,0.15)",

    paddingHorizontal: 20,

    color: "#FFFFFF",

    fontSize: 16,

    marginBottom: 18,
  },

  mobileInput: {
    height: 54,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
  },

  passwordContainer: {
    height: 62,

    borderRadius: 20,

    backgroundColor: "rgba(255,255,255,0.04)",

    borderWidth: 1.2,

    borderColor: "rgba(16,224,212,0.15)",

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",
  },

  mobilePasswordContainer: {
    height: 54,
    borderRadius: 15,
    paddingHorizontal: 14,
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,

    color: "#FFFFFF",

    fontSize: 16,

    paddingVertical: 0,

    includeFontPadding: false,
  },

  mobilePasswordInput: {
    fontSize: 15,
  },

  eyeButton: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 4,
  },

  inputFocused: {
    borderColor: "#10E0D4",

    shadowColor: "#10E0D4",

    shadowOpacity: 0.35,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 8,
  },

  forgotButton: {
    alignSelf: "flex-end",

    marginTop: 11,
    marginBottom: 20,

    paddingVertical: 5,
    paddingHorizontal: 2,
  },

  forgotText: {
    color: "#D4A72C",
    fontSize: 13,
    fontWeight: "700",
  },

  loginButton: {
    height: 62,

    borderRadius: 20,

    backgroundColor: "#D4A72C",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#D4A72C",

    shadowOpacity: 0.35,

    shadowRadius: 22,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 10,
  },

  mobileLoginButton: {
    height: 54,
    borderRadius: 15,
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

    marginTop: 25,
  },

  smallPhoneSignupRow: {
    flexWrap: "wrap",
    rowGap: 4,
    paddingHorizontal: 4,
  },

  signupText: {
    color: "#819396",
    fontSize: 14,
  },

  smallPhoneSignupText: {
    fontSize: 12,
  },

  signupLink: {
    color: "#10E0D4",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },

  smallPhoneSignupLink: {
    fontSize: 12,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 42,
  },

  mobileFooter: {
    marginTop: 26,
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

  topGlow: {
    position: "absolute",

    top: -220,

    alignSelf: "center",

    width: 520,
    height: 520,

    borderRadius: 260,

    backgroundColor:
      "rgba(16,224,212,0.06)",
  },

  bottomGlow: {
    position: "absolute",

    bottom: -180,

    right: -100,

    width: 380,
    height: 380,

    borderRadius: 190,

    backgroundColor:
      "rgba(217,164,65,0.05)",
  },
});