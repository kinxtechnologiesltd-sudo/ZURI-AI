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
  useWindowDimensions,
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#071114"
      />

      {/* ==========================
          BACKGROUND
      ========================== */}

      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        <AfricaBackground />
      </View>

      <View
        pointerEvents="none"
        style={styles.topGlow}
      />

      <View
        pointerEvents="none"
        style={styles.bottomGlow}
      />

      {/* ==========================
          CONTENT
      ========================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isPhone && styles.mobileContent,
          isSmallPhone &&
            styles.smallPhoneContent,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "none"
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.authContainer,
            isPhone &&
              styles.mobileAuthContainer,
          ]}
        >
          {/* ==========================
              LOGO
          ========================== */}

          <View
            style={[
              styles.logoSection,
              isPhone &&
                styles.mobileLogoSection,
            ]}
          >
            <Image
              source={ZuriLogo}
              style={[
                styles.logo,
                isPhone &&
                  styles.mobileLogo,
                isSmallPhone &&
                  styles.smallPhoneLogo,
              ]}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.title,
                isPhone &&
                  styles.mobileTitle,
                isSmallPhone &&
                  styles.smallPhoneTitle,
              ]}
            >
              Welcome Back
            </Text>

            <Text
              style={[
                styles.subtitle,
                isPhone &&
                  styles.mobileSubtitle,
              ]}
            >
              Your AI. Your future.
            </Text>
          </View>

          {/* ==========================
              FORM
          ========================== */}

          <View style={styles.form}>
            {/* EMAIL */}

            <Text style={styles.label}>
              EMAIL
            </Text>

            <View
              style={[
                styles.inputWrapper,
                isPhone &&
                  styles.mobileInputWrapper,
                focusedField === "email" &&
                  styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color={
                  focusedField === "email"
                    ? "#10E0D4"
                    : "#738A8E"
                }
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#738A8E"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="email-address"
                importantForAutofill="no"
                value={email}
                onChangeText={setEmail}
                onFocus={() =>
                  setFocusedField("email")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
                returnKeyType="next"
              />
            </View>

            {/* PASSWORD */}

            <Text
              style={[
                styles.label,
                styles.passwordLabel,
              ]}
            >
              PASSWORD
            </Text>

            <View
              style={[
                styles.inputWrapper,
                isPhone &&
                  styles.mobileInputWrapper,
                focusedField === "password" &&
                  styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={
                  focusedField === "password"
                    ? "#10E0D4"
                    : "#738A8E"
                }
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#738A8E"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                keyboardType="default"
                importantForAutofill="no"
                value={password}
                onChangeText={setPassword}
                onFocus={() =>
                  setFocusedField("password")
                }
                onBlur={() =>
                  setFocusedField(null)
                }
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
                  color="#8AA6AA"
                />
              </TouchableOpacity>
            </View>

            {/* FORGOT PASSWORD */}

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() =>
                router.push(
                  "/forgot-password"
                )
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
                <>
                  <Text
                    style={styles.loginButtonText}
                  >
                    Sign In
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#061014"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ==========================
              DIVIDER
          ========================== */}

          <View
            style={[
              styles.dividerContainer,
              isPhone &&
                styles.mobileDividerContainer,
            ]}
          >
            <View style={styles.divider} />

            <Text style={styles.dividerText}>
              OR
            </Text>

            <View style={styles.divider} />
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
            <View style={styles.googleIconBox}>
              <Text style={styles.googleIcon}>
                G
              </Text>
            </View>

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
              isPhone &&
                styles.mobileFooter,
            ]}
          >
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
    backgroundColor: "#071114",
  },

  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 45,
  },

  mobileContent: {
    paddingHorizontal: 18,
    paddingVertical: 28,
  },

  smallPhoneContent: {
    paddingHorizontal: 12,
    paddingVertical: 22,
  },

  authContainer: {
    width: "100%",
    maxWidth: 470,
    alignSelf: "center",
  },

  mobileAuthContainer: {
    maxWidth: 470,
  },

  /* ==========================
     LOGO
  ========================== */

  logoSection: {
    alignItems: "center",
    marginBottom: 34,
  },

  mobileLogoSection: {
    marginBottom: 28,
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 12,
  },

  mobileLogo: {
    width: 92,
    height: 92,
    marginBottom: 8,
  },

  smallPhoneLogo: {
    width: 78,
    height: 78,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
  },

  mobileTitle: {
    fontSize: 30,
    letterSpacing: -0.5,
  },

  smallPhoneTitle: {
    fontSize: 27,
  },

  subtitle: {
    color: "#AFC4C8",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },

  mobileSubtitle: {
    fontSize: 13.5,
    marginTop: 6,
  },

  /* ==========================
     FORM
  ========================== */

  form: {
    width: "100%",
  },

  label: {
    color: "#10E0D4",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },

  passwordLabel: {
    marginTop: 18,
  },

  inputWrapper: {
    width: "100%",
    height: 58,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(16,224,212,0.16)",
    backgroundColor: "rgba(255,255,255,0.045)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  mobileInputWrapper: {
    height: 55,
    borderRadius: 15,
  },

  inputWrapperFocused: {
    borderColor: "#10E0D4",
    backgroundColor: "rgba(16,224,212,0.055)",
    shadowColor: "#10E0D4",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 5,
  },

  inputIcon: {
    marginRight: 11,
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 0,
  },

  eyeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 9,
    paddingLeft: 8,
    marginBottom: 14,
  },

  forgotText: {
    color: "#D4A72C",
    fontSize: 12.5,
    fontWeight: "700",
  },

  /* ==========================
     SIGN IN
  ========================== */

  loginButton: {
    width: "100%",
    height: 58,
    borderRadius: 17,
    backgroundColor: "#D4A72C",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    shadowColor: "#D4A72C",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },

  mobileLoginButton: {
    height: 55,
    borderRadius: 15,
  },

  loginButtonText: {
    color: "#061014",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  /* ==========================
     DIVIDER
  ========================== */

  dividerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  mobileDividerContainer: {
    marginVertical: 21,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#244247",
  },

  dividerText: {
    color: "#738A8E",
    marginHorizontal: 13,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 1.5,
  },

  /* ==========================
     GOOGLE
  ========================== */

  googleButton: {
    width: "100%",
    height: 56,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  mobileGoogleButton: {
    height: 53,
    borderRadius: 15,
  },

  googleIconBox: {
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  googleIcon: {
    color: "#4285F4",
    fontSize: 21,
    fontWeight: "900",
  },

  googleText: {
    color: "#202124",
    fontSize: 14.5,
    fontWeight: "700",
  },

  smallPhoneGoogleText: {
    fontSize: 13,
  },

  /* ==========================
     SIGN UP
  ========================== */

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  smallPhoneSignupRow: {
    flexWrap: "wrap",
    rowGap: 4,
    paddingHorizontal: 5,
  },

  signupText: {
    color: "#819396",
    fontSize: 13,
  },

  smallPhoneSignupText: {
    fontSize: 12,
  },

  signupLink: {
    color: "#10E0D4",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },

  smallPhoneSignupLink: {
    fontSize: 12,
  },

  /* ==========================
     FOOTER
  ========================== */

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },

  mobileFooter: {
    marginTop: 25,
  },

  footerBrand: {
    color: "#D4A72C",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 2,
  },

  footerDot: {
    color: "#5D7377",
    marginHorizontal: 9,
    fontSize: 11,
  },

  footerText: {
    color: "#738A8E",
    fontSize: 11,
  },

  /* ==========================
     BACKGROUND
  ========================== */

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