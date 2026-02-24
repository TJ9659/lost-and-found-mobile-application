import { useGlobalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { COLORS } from "../../../src/constants/colors";
import { AuthContext } from "../../../src/context/AuthContext";
import api, { BASE_URL } from "../../../src/services/api";

type User = {
  id: number;
  name: string;
  faculty: string;
  profile_pic: string;
};

type Item = {
  id: number;
  name: string;
  description: string;
  status: "lost" | "found";
  image_path: string;
  category: string;
  building: string;
  floor: string;
  location: string;
  user: User;
  is_exchanged: boolean;
  in_transaction: boolean;
  non_claimable: boolean;
};

export default function AdminItemDetailsPage() {
  const params = useGlobalSearchParams();
  const { token } = useContext(AuthContext);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const itemId = params.id;

  useEffect(() => {
    if (!itemId || !token) return;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/items/admin/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItem(res.data);
      } catch (err) {
        console.error("Failed to fetch admin item:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, token]);

  if (loading) return <ActivityIndicator size="large" color={COLORS.pink} />;
  if (!item) return <Text style={{ padding: 20 }}>Admin item not found.</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* Item Image */}
      <Image
        source={{ uri: `${BASE_URL}/storage/${item.image_path}` }}
        style={styles.itemImage}
      />

      {/* Item Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>

        {/* Metadata */}
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Status:</Text>{" "}
            {item.status === "lost" ? "Lost" : "Found"}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Category:</Text> {item.category}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Building:</Text> {item.building}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Floor:</Text> {item.floor}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Location:</Text> {item.location}
          </Text>
          {/* <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Non-Claimable:</Text>{" "}
            {item.non_claimable ? "Yes" : "No"}
          </Text> */}
        </View>

        {/* Uploader Info */}
        <View style={styles.userContainer}>
          <Text style={styles.metaLabel}>Uploaded by:</Text>
          <Text style={styles.metaText}>
            {item.user.name} ({item.user.faculty})
          </Text>
        </View>

        {/* Claim Notice */}
        {item.non_claimable && (
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeText}>
              Meet us at KB513, Floor 5, KB Block to claim the item.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  itemImage: { width: "100%", height: 250, resizeMode: "cover" },
  infoContainer: { padding: 16 },
  itemName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.navy,
    marginBottom: 8,
  },
  itemDescription: { fontSize: 16, color: COLORS.textMuted, marginBottom: 12 },
  metaContainer: { marginTop: 10 },
  metaText: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  metaLabel: { fontWeight: "600", color: COLORS.navy },
  userContainer: { marginTop: 16 },
  noticeContainer: {
    backgroundColor: COLORS.grayMedium,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  noticeText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
