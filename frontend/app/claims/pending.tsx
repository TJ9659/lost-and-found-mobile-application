import api, { BASE_URL } from "@/src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/constants/colors"; // adjust path

export default function PendingClaims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchClaims();
  }, []);
  const fetchClaims = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const res = await api.get(`/claims/owner`, {
        params: { status: "pending" },
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data);
    } catch (err) {
      console.error("Error fetching claims", err);
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await api.put(`/claims/${id}`, { status });
      setClaims((prev) => prev.filter((c) => c.id !== id)); // remove after action
      if (status === "approved") {
        router.push(`/chat/${id}`); // ✅ open chat after approve
      }
    } catch (err) {
      console.error("Error updating claim", err);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color={COLORS.pink} style={{ flex: 1 }} />
    );
  }

  if (!claims.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No pending claims</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={claims}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {item.item?.image_path && (
            <Image
              source={{
                uri: `${BASE_URL}/storage/${item.item.image_path}`,
              }}
              style={styles.image}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.item?.name}</Text>
            <Text style={styles.sub}>Claimer: {item.claimer?.name}</Text>
            {item.message ? (
              <Text style={styles.msg}>“{item.message}”</Text>
            ) : null}
          </View>
          <View>
            <TouchableOpacity
              style={[styles.btn, styles.detailsBtn]}
              onPress={() => {router.push(`/claims/${item.id}`)}}
            >
              <Text style={styles.btnText}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.grayDark,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  msg: {
    fontSize: 13,
    fontStyle: "italic",
    color: COLORS.textMuted,
    marginTop: 4,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.textOnDark,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
  detailsBtn:{
    backgroundColor: COLORS.pink,
  }
});
