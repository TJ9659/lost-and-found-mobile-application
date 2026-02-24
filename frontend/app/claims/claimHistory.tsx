// app/claims/ClaimHistoryPage.tsx
import { COLORS } from "@/src/constants/colors";
import { AuthContext } from "@/src/context/AuthContext";
import api, { BASE_URL } from "@/src/services/api";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";

type Item = {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  image_path?: string;
  created_at: string;
  is_claimed: boolean;
};

type Claim = {
  id: number;
  item: Item;
  message: string;
  location_detail: string;
  datetime_detail: string;
  proof_image_path?: string;
  status: "pending" | "approved" | "rejected" | "rolled_back";
  exchanged: boolean;
  exchanged_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  rolled_back_at?: string | null;
  meetup_confirmed_at?: string | null;
};

export default function ClaimHistoryPage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected" | "rolled_back"
  >("pending");

  const fetchMyClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get("/my-claims", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setClaims(res.data);
    } catch (err) {
      console.error("Error fetching claims", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClaims();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color={COLORS.pink} style={{ flex: 1 }} />
    );
  }

  // Filter claims by active tab
  const filteredClaims = claims.filter((c) => c.status === activeTab);

  const renderClaim = (claim: Claim) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/claims/${claim.id}`)}
    >
      {claim.item.image_path && (
        <Image
          source={{ uri: `${BASE_URL}/storage/${claim.item.image_path}` }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}
      <Text style={styles.name}>{claim.item.name}</Text>

      {claim.status === "pending" ? (
        <Text style={{ color: COLORS.navy }}>Waiting for uploader</Text>
      ) : null}
      {claim.status === "approved" && !claim.exchanged ? (
        <Text style={{ color: "green" }}>Approved – waiting for exchange</Text>
      ) : null}
      {claim.status === "approved" && claim.exchanged ? (
        <Text style={{ color: "green" }}>
          Exchanged on{" "}
          {claim.exchanged_at
            ? new Date(claim.exchanged_at).toLocaleString()
            : "—"}
        </Text>
      ) : null}
      {claim.status === "rejected" ? (
        <Text style={{ color: "red" }}>
          Rejected{" "}
          {claim.rejected_at
            ? `on ${new Date(claim.rejected_at).toLocaleString()}`
            : ""}
        </Text>
      ) : null}
      {claim.status === "rolled_back" ? (
        <Text style={{ color: "orange" }}>
          Claim was rolled back – item available again
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={styles.tabsContainer}>
          {["pending", "approved", "rejected", "rolled_back"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={activeTab === tab ? { fontWeight: "700" } : {}}>
                {tab === "rolled_back"
                  ? "Rolled Back"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredClaims.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            {activeTab === "pending"
              ? "No pending claims"
              : activeTab === "approved"
                ? "No approved claims yet"
                : activeTab === "rejected"
                  ? "No rejected claims yet"
                  : "No rolled back claims yet"}
          </Text>
        ) : (
          <FlatList
            data={filteredClaims}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderClaim(item)}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.navy,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  itemImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
});
