import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "@/src/constants/colors";
import { AuthContext } from "@/src/context/AuthContext";
import api, { BASE_URL } from "@/src/services/api";
import { Image } from "expo-image";
import FullScreenImage from "@/src/components/FullScreenImage";

type ItemType = "lost" | "found";

type User = {
  id: number;
  name: string;
  faculty: string;
  profile_pic: string;
};

interface Category {
  id: number;
  name: string;
}

type Claim = {
  claimer_id: number;
  status: "pending" | "approved" | "rejected" | "rolled_back";
};

type Item = {
  id: number;
  name: string;
  description: string;
  status: ItemType;
  image_path: string;
  category: Category;
  building: string;
  floor: string;
  location: string;
  user: User;
  is_exchanged: boolean;
  in_transaction: boolean;
  claims?: Claim[];
};

export default function ItemDetailsPage() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const { user: currentUser, token } = useContext(AuthContext);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const itemId = params.id;

  useEffect(() => {
    if (!itemId || !token) return;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/items/${itemId}`);
        setItem(res.data);
      } catch (err: any) {
        console.error("Failed to fetch item:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, token]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.pink} />
      </View>
    );

  if (!item)
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>
          Item not found or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.backButtonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );

  const isUploader = item.user.id === currentUser?.id;
  const hasPendingClaim = item?.claims?.some(
    (c) => c.claimer_id === currentUser?.id && c.status === "pending",
  );

  return (
    <ScrollView style={styles.container}>
      <FullScreenImage
        uri={`${BASE_URL}/storage/${item.image_path}`}
        style={styles.itemImage}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Status:</Text>{" "}
            {item.status === "lost" ? "Lost" : "Found"}
          </Text>
          <Text style={styles.metaText}>
            <Text style={styles.metaLabel}>Category:</Text> {item.category.name}
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
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() =>
            router.push({
              pathname: "/profile",
              params: { userId: item.user.id.toString() },
            })
          }
        >
          <Image
            source={
              item.user.profile_pic
                ? { uri: `${BASE_URL}/storage/${item.user.profile_pic}` }
                : require("../../../assets/images/default.png")
            }
            style={styles.profilePic}
          />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{item.user.name}</Text>
            <Text style={styles.profileFaculty}>{item.user.faculty}</Text>
          </View>
        </TouchableOpacity>

        {isUploader ? (
          item.is_exchanged || item.in_transaction ? (
            <Text style={styles.disabledMessageText}>
              You cannot edit or delete this item while it’s in a transaction or
              has been exchanged.
            </Text>
          ) : (
            <View style={styles.ownerActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => router.push(`/items/edit/${item.id}`)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    "Confirm Delete",
                    "Are you sure you want to delete this item? This action cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const res = await api.delete(
                              `/items/delete/${item.id}`,
                            );
                            if (
                              res.data.message ===
                              "Cannot delete item involved in a transaction"
                            ) {
                              alert(
                                "Cannot delete item involved in a transaction",
                              );
                              return;
                            } else {
                              alert("Item deleted successfully");
                            }
                            router.replace("/home");
                          } catch (err) {
                            console.error("Delete failed:", err);
                            alert("Failed to delete item");
                          }
                        },
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )
        ) : item.is_exchanged || item.in_transaction ? (
          <Text style={styles.disabledMessageText}>
            This item is in the claim process or has already been exchanged.
          </Text>
        ) : (
          <TouchableOpacity
            style={[
              styles.claimButton,
              hasPendingClaim && { backgroundColor: COLORS.grayLight },
            ]}
            onPress={() => {
              if (hasPendingClaim) {
                Alert.alert(
                  "Claim Pending",
                  "You already have a pending claim for this item. Please wait for it to be reviewed before submitting another.",
                );
                return;
              }
              router.push(`/claims/create/${item.id}`);
            }}
          >
            <Text
              style={[
                styles.claimButtonText,
                hasPendingClaim && { color: COLORS.textMuted },
              ]}
            >
              {item.status === "lost" ? "I found this item" : "Claim Item"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: { fontSize: 18, color: COLORS.textMuted, marginBottom: 16 },
  backButton: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
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
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    backgroundColor: COLORS.surface,
  },
  profileContainer: { flexDirection: "row", alignItems: "center" },
  profilePic: { width: 50, height: 50, borderRadius: 25 },
  profileText: { marginLeft: 12 },
  profileName: { fontSize: 16, fontWeight: "bold", color: COLORS.navy },
  profileFaculty: { fontSize: 14, color: COLORS.textMuted },
  claimButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.pink,
  },
  claimButtonText: { color: COLORS.white, fontWeight: "bold", fontSize: 16 },
  ownerActions: { flexDirection: "row", marginTop: 10, gap: 10 },
  actionButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  editButton: { backgroundColor: COLORS.pink },
  deleteButton: { backgroundColor: COLORS.navy },
  actionText: { color: COLORS.white, fontWeight: "bold", fontSize: 16 },
  disabledMessageText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
});
