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
import AfricaBackground from "../components/home-v2/AfricaBackground";
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
  // Email Login
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
const [focusedField, setFocusedField] = useState<
  "email" | "password" | null
>(null);
  return (
    <>
      <StatusBar
        barStyle="light-content"
      />

      <SafeAreaView
        style={styles.container}
      >
        <AfricaBackground />
        <View style={styles.topGlow} />
<View style={styles.bottomGlow} />
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

  <Animated.View
    style={[
      styles.authCard,
      {
        opacity: fade,
        transform: [{ translateY }],
      },
    ]}
  >

    <View style={styles.logoContainer}>
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
Africa's Creative Intelligence awaits.
Continue creating with the future of AI.
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
  style={[
    styles.passwordContainer,
    focusedField === "password" &&
      styles.inputFocused,
  ]}
>
  <TextInput
    style={styles.passwordInput}
    placeholder="Enter your password"
    placeholderTextColor="#738A8E"
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={setPassword}
    onFocus={() => setFocusedField("password")}
    onBlur={() => setFocusedField(null)}
  />

  <TouchableOpacity
    onPress={() => setShowPassword(!showPassword)}
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
            
            </Animated.View>

</ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );

}const styles = StyleSheet.create({
  container: {
    flex: 1,
backgroundColor: "#071114",
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
  color: "#FFFFFF",
  fontSize: 42,
  fontWeight: "900",
  textAlign: "center",
},  // ✅

subtitle: {
  color: "#AFC4C8",
  fontSize: 16,
  lineHeight: 26,
  textAlign: "center",
  marginTop: 12,
  marginBottom: 34,
  maxWidth: 420,
},  // ✅
  
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
  label: {
    color: "#10E0D4",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 8,
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

  marginBottom: 20,
},

passwordContainer: {
  height: 62,

  borderRadius: 20,

  backgroundColor: "rgba(255,255,255,0.04)",

  borderWidth: 1.2,

  borderColor: "rgba(16,224,212,0.15)",

  paddingHorizontal: 20,

  flexDirection: "row",

  alignItems: "center",
},
topGlow: {
  position: "absolute",

  top: -220,

  alignSelf: "center",

  width: 520,

  height: 520,

  borderRadius: 260,

  backgroundColor: "rgba(16,224,212,0.06)",
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
bottomGlow: {
  position: "absolute",

  bottom: -180,

  right: -100,

  width: 380,

  height: 380,

  borderRadius: 190,

  backgroundColor: "rgba(217,164,65,0.05)",
},
passwordInput: {
  flex: 1,

  color: "#FFFFFF",

  fontSize: 16,
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