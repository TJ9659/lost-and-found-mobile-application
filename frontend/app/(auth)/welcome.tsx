import Button from "@/src/components/Button";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/constants/colors";
export default function IndexScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Welcome to UTARIFY</Text>
      <View style={styles.section}>
        <Text style={styles.heading}>Lost an Item?</Text>
        <Text style={styles.body}>
          We are here to help! Build a community that helps find your lost
          items.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Found an Item?</Text>
        <Text style={styles.body}>
          Help others by reporting found items and reuniting them with their
          owners.
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <Button
          title="Login"
          onPress={() => router.push("/login")}
          type="primary"
        />
        <Button
          title="Register"
          onPress={() => router.push("/register")}
          type="secondary"
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push("/terms")}>
          <Text style={styles.footerLink}>Terms of Use</Text>
        </TouchableOpacity>
        <Text style={styles.footerDivider}> • </Text>
        <TouchableOpacity onPress={() => router.push("/privacy")}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 250,
    height: 100,
    marginBottom: 10,
  },
  title: {
    color: COLORS.pink,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    color: COLORS.navy,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    color: COLORS.grayDark,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300,
  },
  buttonSection: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLink: {
    color: COLORS.textMuted,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footerDivider: 
  { color: COLORS.textMuted, fontSize: 14, marginHorizontal: 4 },
});
