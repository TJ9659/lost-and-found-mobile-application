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
import { Picker } from "@react-native-picker/picker";
import { AuthContext } from "../../src/context/AuthContext";

import faculties from "@/src/data/faculties.json";

export default function RegisterScreen() {
  const { register, token } = useContext(AuthContext);
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !faculty) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, studentId, faculty, password });

      if (res.status === 200 || res.status === 201) {
        Alert.alert(
          "Registration Successful",
          "Please check your email inbox and verify your email before logging in.",
        );
        router.replace("/login");
      }
    } catch (error: any) {
      Alert.alert("Registration Failed", error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      router.replace("/home");
    }
  }, [token]);

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register to get started</Text>

            <TextInput
              placeholder="Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              placeholder="Student ID (optional)"
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={faculty}
                onValueChange={(itemValue) => setFaculty(itemValue)}
              >
                <Picker.Item label="Select Faculty" value="" />
                {faculties.map((f) => (
                  <Picker.Item key={f.code} label={f.name} value={f.code} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {loading ? (
              <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
            ) : (
              <View style={{ width: "100%", alignItems: "center" }}>
                <Button
                  title="Register"
                  width="50%"
                  type="primary"
                  onPress={handleRegister}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={{ fontWeight: "bold", color: "#3498db" }}>
                  Login
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginVertical: 10,
  },
  loginButton: {
    marginTop: 25,
    alignItems: "center",
  },
  loginText: {
    fontSize: 15,
    color: "#444",
  },
});
