import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/firebaseConfig";

export default function FirestoreTest() {
  const [status, setStatus] = useState("Ready");

  const testFirestore = async () => {
    try {
      setStatus("Writing...");

      await addDoc(collection(db, "messages"), {
        text: "Hello Firestore",
        sender: "system",
      });

      setStatus("✅ Success");
    } catch (error: any) {
      console.log(error);
      setStatus(error.message || "Unknown error");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#050816",
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 26,
          marginBottom: 20,
        }}
      >
        Firestore Test
      </Text>

      <TouchableOpacity
        onPress={testFirestore}
        style={{
          backgroundColor: "#2563EB",
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          Test Firestore
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: "white",
          marginTop: 20,
          paddingHorizontal: 20,
        }}
      >
        {status}
      </Text>
    </View>
  );
}