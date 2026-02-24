import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { COLORS } from "@/src/constants/colors";

type NotificationType = "chat" | "claim" | "exchange" | string;

interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  claimId?: string;
  chatId?: string;
  read?: boolean;
  createdAt?: Timestamp | null;
  [key: string]: any;
}

type RootStackParamList = {
  Chat: { chatId: string };
  ClaimDetails: { claimId: string };
  ExchangeDetails: { claimId: string };
};

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const q = query(
      collection(db, "notifications", String(userId), "userNotifications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handlePress = async (notif: Notification) => {
    if (!userId) return;

    const notifRef = doc(
      db,
      "notifications",
      String(userId),
      "userNotifications",
      notif.id,
    );
    await updateDoc(notifRef, { read: true });

    switch (notif.type) {
      case "claim":
        if (notif.claimId) router.push(`/claims/${notif.claimId}`);
        break;

      case "chat":
        if (notif.chatId) navigation.navigate("Chat", { chatId: notif.chatId });
        break;

      case "exchange":
        if (notif.chatId) {
          // approved, go to chat
          navigation.navigate("Chat", { chatId: notif.chatId });
        } else {
          // rejected, just alert
          Alert.alert(
            "Exchange Update",
            notif.body || "Your claim was rejected.",
          );
        }
        break;

      default:
        console.warn("Unknown notification type:", notif.type);
    }
  };

  const handleDelete = async (notifId: string) => {
    if (!userId) return;

    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const notifRef = doc(
              db,
              "notifications",
              String(userId),
              "userNotifications",
              notifId,
            );
            await deleteDoc(notifRef);
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <Pressable onPress={() => handlePress(item)} style={styles.card}>
      <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>

      <Text
        style={[styles.title, { fontWeight: item.read ? "normal" : "bold" }]}
      >
        {item.title}
      </Text>
      <Text style={styles.body}>{item.body}</Text>
      {item.createdAt && (
        <Text style={styles.timestamp}>
          {item.createdAt.toDate().toLocaleString()}
        </Text>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.pink} />
      </View>
    );
  }

  // 2. Not loading, but no notifications found
  if (notifications.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Text style={{ color: "#999" }}>No notifications yet.</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: "#f5f5f5" }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    padding: 16,
    marginVertical: 8,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    color: "#222",
  },
  body: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fee",
    borderRadius: 50,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 14,
  },
});
