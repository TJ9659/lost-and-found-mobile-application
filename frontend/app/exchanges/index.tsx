import { COLORS } from "@/src/constants/colors";
import { AuthContext } from "@/src/context/AuthContext";
import api, { BASE_URL } from "@/src/services/api";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Item = {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  image_path?: string;
  created_at: string;
  user: any;
};

type Claim = {
  id: number;
  item: Item;
  claimer: { id: number; name: string };
  message: string;
  status: "pending" | "approved" | "rejected" | "rolled_back";
  exchanged: boolean;
  exchanged_at?: string | null;
  rolled_back_at?: string | null;
};

export default function ExchangesPage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const res = await api.get("/exchanges", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // only include approved claims (exchange flow)
      setClaims(res.data.filter((c: Claim) => c.status === "approved"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmExchange = async (claimId: number) => {
    try {
      await api.post(
        `/exchanges/${claimId}/confirm`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      fetchExchanges();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectExchange = async (claimId: number) => {
    try {
      await api.post(
        `/exchanges/${claimId}/reject`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      fetchExchanges();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const renderClaim = (claim: Claim) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => router.push(`/items/details/${claim.item.id}`)}
      >
        {claim.item.image_path && (
          <Image
            source={{ uri: `${BASE_URL}/storage/${claim.item.image_path}` }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.name}>{claim.item.name}</Text>
        <Text>Claimer: {claim.claimer.name}</Text>
        <Text>Message: {claim.message}</Text>
      </TouchableOpacity>

      {!claim.exchanged && !claim.rolled_back_at ? (
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TouchableOpacity
            style={[
              styles.button,
              { flex: 1, marginRight: 4, backgroundColor: COLORS.pink },
            ]}
            onPress={() => confirmExchange(claim.id)}
          >
            <Text style={{ color: "#fff" }}>Confirm Exchange</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              { flex: 1, marginLeft: 4, backgroundColor: COLORS.navy },
            ]}
            onPress={() => rejectExchange(claim.id)}
          >
            <Text style={{ color: "#fff" }}>Cancel Exchange</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {claim.exchanged ? (
        <Text style={{ color: "green", marginTop: 6 }}>
          Exchanged at:{" "}
          {claim.exchanged_at
            ? new Date(claim.exchanged_at).toLocaleString()
            : "—"}
        </Text>
      ) : null}

      {claim.rolled_back_at ? (
        <Text style={{ color: "orange", marginTop: 6 }}>
          Rolled back at:{" "}
          {claim.rolled_back_at
            ? new Date(claim.rolled_back_at).toLocaleString()
            : "—"}
        </Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FlatList
        data={claims}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderClaim(item)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No exchanges in progress
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
