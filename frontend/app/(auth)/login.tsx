import BackButton from "@/src/components/BackButton";
import Button from "@/src/components/Button";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { AuthContext } from "../../src/context/AuthContext";
import { API_URL } from "@/src/services/api";
import { COLORS } from "@/src/constants/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace("/home");
    }
  }, [token]);

  const handleResendVerification = async () => {
    try {
      const res = await fetch(`${API_URL}resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend");

      Alert.alert("Success", data.message);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Failed to resend verification email."
      );
    }
  };

  const handleLoginError = (error: any) => {
    const message = error?.message || "Unknown error";
    const isUnverified = message.toLowerCase().includes("not verified");

    if (isUnverified) {
      Alert.alert("Login Failed", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Resend Verification", onPress: handleResendVerification },
      ]);
    } else {
      Alert.alert("Login Failed", message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <BackButton />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>

            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {loading ? (
              <ActivityIndicator size="large" color={COLORS.pink} style={{ marginVertical: 20 }} />
            ) : (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Button title="Login" width="50%" onPress={handleLogin} />
              </View>
            )}

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.registerText}>
                Don’t have an account?{" "}
                <Text style={{ fontWeight: "bold", color: "#3498db" }}>
                  Register
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/reset-password")}
            >
              <Text style={styles.registerText}>
                Forgot your password?{" "}
                <Text style={{ fontWeight: "bold", color: "#3498db" }}>
                  Reset here
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginVertical: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  registerButton: {
    marginTop: 25,
    alignItems: "center",
  },
  registerText: {
    fontSize: 15,
    color: "#444",
  },
});

export const options = {
  headerShown: false,
  title: "Login",
};
