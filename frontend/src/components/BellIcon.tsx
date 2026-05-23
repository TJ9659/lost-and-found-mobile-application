import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

interface BellProps {
  userId: string;
}

export default function BellIcon({ userId }: BellProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return null;

    const q = query(
      collection(db, "notifications", userId, "userNotifications"),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/notifications/notificationsList",
          params: { userId },
        })
      }
    >
      <View style={{ position: "relative", padding: 10 }}>
        <Ionicons name="notifications" size={35} color={COLORS.pink} />
        {unreadCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              backgroundColor: "red",
              borderRadius: 10,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
