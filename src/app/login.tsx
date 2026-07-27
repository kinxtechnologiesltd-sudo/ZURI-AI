import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  Text,
  TextInput,
  View,
} from "react-native";
import { loginUser, registerUser } from "../firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      console.log("Logging in...");

      const user = await loginUser(email.trim(), password);

      console.log("SUCCESS:", user);

      Alert.alert("Success", "Login successful!");

      router.replace("/home");
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);

      Alert.alert(
        "Login Error",
        err?.code
          ? `${err.code}\n${err.message}`
          : err?.message || "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      console.log("Creating account...");

      const user = await registerUser(email.trim(), password);

      console.log("SUCCESS:", user);

      Alert.alert("Success", "Account created successfully!");

      router.replace("/home");
    } catch (err: any) {
      console.log("SIGNUP ERROR:", err);

      Alert.alert(
        "Signup Error",
        err?.code
          ? `${err.code}\n${err.message}`
          : err?.message || "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Athena Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <Button
        title={loading ? "Please wait..." : "Login"}
        onPress={handleLogin}
      />

      <View style={{ height: 15 }} />

      <Button
        title={loading ? "Please wait..." : "Sign Up"}
        onPress={handleSignup}
      />
    </View>
  );
}