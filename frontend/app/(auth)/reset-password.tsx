import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { COLORS } from "@/src/constants/colors";
import api, { API_URL } from "@/src/services/api";
import { useRouter } from "expo-router";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/forgot-password", { email });

      Alert.alert(
        "Reset Link Sent",
        "Check your email for instructions to reset your password."
      );
      setEmail(""); // clear field
      router.replace("/login");
    } catch (error: any) {
      if (error.response) {
        const message =
          error.response.data.message ||
          error.response.data.errors?.email?.[0] ||
          "Failed to send reset link";
        Alert.alert("Error", message);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Reset Password
        </Text>

        <Text style={{ marginBottom: 10 }}>
          Enter your email to receive a password reset link.
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
          }}
        />

        {loading ? (
          <View style={{ padding: 15, alignItems: "center" }}>
            <ActivityIndicator size="small" color={COLORS.pink} />
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleResetPassword}
            style={{
              backgroundColor: COLORS.navy,
              padding: 15,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: "bold" }}>
              Send Reset Link
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
