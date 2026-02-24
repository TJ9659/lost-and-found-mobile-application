import { db, serverTimestamp } from "@/firebaseConfig";
import api, { BASE_URL } from "@/src/services/api";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState, useContext } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../src/constants/colors";
import { saveNotification } from "@/src/services/notifications";
import { AuthContext } from "@/src/context/AuthContext";
import { Image } from "expo-image";

export default function ClaimDetail() {
  const router = useRouter();
  const { claimId } = useGlobalSearchParams<{ claimId: string }>();
  const { user, token } = useContext(AuthContext);
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaim = async () => {
    if (!token) return;
    try {
      const res = await api.get(`/claims/${claimId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaim(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        console.error("Error fetching claim", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    fetchClaim();
    return () => {
      mounted = false;
    };
  }, [claimId, token]);

  const handleApprove = async () => {
    if (!claim || !token) return;
    setActionLoading(true);
    try {
      await api.patch(
        `/claims/${claimId}`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (claim.claimer?.id) {
        await saveNotification(
          claim.claimer.id,
          "Claim Approved",
          `Your claim for "${claim.item.name}" was approved`,
          { type: "claim", claimId, itemName: claim.item.name }
        );

        // chat creation in Firestore
        const roomRef = doc(db, "chat_rooms", claimId.toString());
        await setDoc(
          roomRef,
          {
            participants: [
              claim.item.user_id.toString(),
              claim.claimer.id.toString(),
            ],
            itemName: claim.item.name,
            itemId: claim.item.id,
            owner: claim.item.user?.name,
            claimer: claim.claimer?.name,
            lastMessage: "I approved your claim, now let's chat!",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        const messagesRef = collection(
          db,
          "chat_rooms",
          claimId.toString(),
          "messages"
        );
        await addDoc(messagesRef, {
          senderId: claim.item.user_id,
          senderName: claim.item.user?.name || "Owner",
          message: "I approved your claim, now let's chat!",
          createdAt: serverTimestamp(),
        });
      }

      router.replace(`/chat/${claimId}`);
    } catch (err) {
      console.error("Approve + chat creation failed:", err);
      alert("Failed to approve claim or create chat.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!claim || !token) return;
    setActionLoading(true);

    try {
      await api.patch(
        `/claims/${claimId}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (claim.claimer?.id) {
        await saveNotification(
          claim.claimer.id,
          "Claim Rejected",
          `Your claim for "${claim.item.name}" was rejected`,
          { type: "claim", claimId, itemName: claim.item.name }
        );
      }

      // refresh claim after reject
      fetchClaim();
    } catch (err) {
      console.error(err);
      alert("Failed to reject claim.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.pink} />
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Claim not found 😢</Text>
        <TouchableOpacity
          onPress={() => router.push("/home")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = claim?.item.user_id === user.id;
  const isClaimer = claim?.claimer?.id === user.id;

  return (
      <ScrollView style={styles.page} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Claim Detail</Text>

          <Text style={styles.label}>
            Status: <Text style={styles.value}>{claim.status}</Text>
          </Text>

          {/* Item Info */}
          <Text style={styles.sectionTitle}>Item</Text>
          <Text style={styles.label}>
            Name: <Text style={styles.value}>{claim.item.name}</Text>
          </Text>
          <Text style={styles.label}>
            Owner: <Text style={styles.value}>{claim.item.user?.name}</Text>
          </Text>
          <Text style={styles.label}>
            Location: <Text style={styles.value}>{claim.item.location}</Text>
          </Text>
          <Text style={styles.label}>
            Description:{" "}
            <Text style={styles.value}>{claim.item.description}</Text>
          </Text>
          {claim.item.image_path && (
            <Image
              source={{ uri: `${BASE_URL}/storage/${claim.item.image_path}` }}
              style={styles.image}
            />
          )}

          {/* Claimer Info */}
          <Text style={styles.sectionTitle}>Claimer</Text>
          <Text style={styles.label}>
            Name: <Text style={styles.value}>{claim.claimer?.name}</Text>
          </Text>
          <Text style={styles.label}>
            Message: <Text style={styles.value}>{claim.message}</Text>
          </Text>
          <Text style={styles.label}>
            Location: <Text style={styles.value}>{claim.location_detail}</Text>
          </Text>
          {claim.proof_image_path && (
            <>
              <Text style={styles.sectionTitle}>Proof Image</Text>
              <Image
                source={{
                  uri: `${BASE_URL}/storage/${claim.proof_image_path}`,
                }}
                style={styles.image}
              />
            </>
          )}

          {/* owner actions */}
          {isOwner && claim.status === "pending" && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reject</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Approve</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* this only works if claim is approved */}
          {isClaimer && claim.status === "approved" && claim.item.is_exchanged == false && (
            <TouchableOpacity
              style={[styles.button, styles.chatButton]}
              onPress={() => router.push(`/chat/${claimId}`)}
            >
              <Text style={styles.buttonText}>Go to Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background, padding: 5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: { fontSize: 18, color: COLORS.textMuted, marginBottom: 16 },
  backButton: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  label: { fontSize: 14, marginBottom: 4 },
  value: { fontWeight: "500" },
  image: { width: "100%", height: 250, borderRadius: 10, marginTop: 8 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  approveButton: { backgroundColor: COLORS.navy },
  rejectButton: { backgroundColor: COLORS.pink },
  chatButton: { backgroundColor: COLORS.pink, marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
