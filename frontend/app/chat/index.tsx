import { db } from "@/firebaseConfig";
import { COLORS } from "@/src/constants/colors";
import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ChatRoom = {
  id: string;
  participants: (string | number)[];
  itemName?: string; // item name
  owner?: string; // owner name
  claimer?: string; // claimer name
  lastMessage?: string;
  updatedAt?: any;
};

export default function ChatInbox() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Firestore query: fetch all rooms
    const q = query(collection(db, "chat_rooms"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // filter client-side to handle mixed types
        const fetchedRooms = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as ChatRoom)
          .filter((room) =>
            room.participants.some((p) => String(p) === String(user.id))
          );
        setRooms(fetchedRooms);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error fetching chat rooms:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const openRoom = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  if (!user || loading) {
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

  return (
    <View style={{ flex: 1, padding: 15, backgroundColor: "#f5f5f5" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          color: "#333",
        }}
      >
        Chat Inbox
      </Text>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openRoom(item.id)}
            style={{
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {item.itemName} {/* Item name */}
            </Text>
            <Text style={{ color: "#666", marginTop: 4 }}>
              Owner: {item.owner} | Claimer: {item.claimer}
            </Text>
            <Text style={{ color: "#666", marginTop: 5 }} numberOfLines={1}>
              {item.lastMessage || "Start a conversation..."}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: 50,
              fontSize: 16,
            }}
          >
            No chats yet
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
