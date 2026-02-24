import api from "@/src/services/api";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
} from "react-native";
import { COLORS } from "../../src/constants/colors";
import { AuthContext } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const router = useRouter();
  const { user, token } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingClaims: 0,
    acceptedClaims: 0,
    pendingExchanges: 0,
    chatCount: 0,
  });

  const fetchDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.pink} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.welcome}>Welcome {user?.name} </Text>
      <Text style={styles.subtitle}>What would you like to do today?</Text>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.navy }]}
        onPress={() => router.push("/items/lost")}
      >
        <Ionicons name="help-circle-outline" color={COLORS.white} size={30} />
        <Text style={styles.cardText}>Search Lost Items</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.pink }]}
        onPress={() => router.push("/items/found")}
      >
        <Ionicons
          name="checkmark-circle-outline"
          color={COLORS.white}
          size={30}
        />
        <Text style={styles.cardText}>Search Found Items</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.grayDark }]}
        onPress={() => router.push("/items/admin")}
      >
        <Ionicons name="bag-check-outline" color={COLORS.white} size={30} />
        <Text style={styles.cardText}>Admin Items</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.success }]}
        onPress={() => router.push("/items/report")}
      >
        <Ionicons name="megaphone-outline" color={COLORS.white} size={30} />
        <Text style={styles.cardText}>Report Item</Text>
      </TouchableOpacity>

      {/* these cards are based on conditions such as pending exchanges and claims etc */}
      {stats.pendingClaims > 0 && (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: COLORS.warning }]}
          onPress={() => router.push("/claims/pending")}
        >
          <Ionicons name="hourglass-outline" color={COLORS.white} size={30} />
          <Text style={styles.cardText}>
            {stats.pendingClaims} Pending Claim
            {stats.pendingClaims > 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      {stats.pendingExchanges > 0 && (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: COLORS.success }]}
          onPress={() => router.push("/exchanges")}
        >
          <Ionicons name="thumbs-up-outline" color={COLORS.white} size={30} />
          <Text style={styles.cardText}>
            {stats.pendingExchanges} Pending Exchange
            {stats.pendingExchanges > 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.grayMedium }]}
        onPress={() => router.push("/claims/claimHistory")}
      >
        <Ionicons name="clipboard-outline" color={COLORS.white} size={30} />
        <Text style={styles.cardText}>Claim History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textOnLight,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  card: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  cardIcon: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cardText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
