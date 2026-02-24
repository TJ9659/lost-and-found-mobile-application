import { Slot, Stack } from "expo-router";
import React, { useContext, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { COLORS } from "../src/constants/colors";
import { AuthContext, AuthProvider } from "../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import BellIcon from "@/src/components/BellIcon";

// 1. Move this outside to keep it stable
const HeaderLogo = () => (
  <Image
    source={require("../assets/images/logo.png")}
    style={{ width: 100, height: 40, resizeMode: "contain" }}
  />
);

function MainLayout() {
  const { loading, user, token } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.navy },
        headerTintColor: COLORS.white,
        headerTitle: HeaderLogo,
        headerBackTitleVisible: false,
        title: "",
        headerRight: () =>
          user?.id ? <BellIcon userId={String(user.id)} /> : null,
      }}
    >
      {token ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
