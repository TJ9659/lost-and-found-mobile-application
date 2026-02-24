import { db, serverTimestamp } from "@/firebaseConfig";
import { COLORS } from "@/src/constants/colors";
import { AuthContext } from "@/src/context/AuthContext";
import { useGlobalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api, { API_URL } from "@/src/services/api";


type Message = {
  id: string;
  senderId?: string;
  senderName?: string;
  message: string;
  createdAt?: any;
};

export default function ChatRoom() {
  const { user } = useContext(AuthContext);
  const params = useGlobalSearchParams();
  const roomId = Array.isArray(params.roomId)
    ? params.roomId[0]
    : params.roomId;
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [chatDisabled, setChatDisabled] = useState(false);
  const { token } = useContext(AuthContext);

  // ensure room exists
  useEffect(() => {
    const ensureRoom = async () => {
      if (!roomId || !user) return;
      const roomRef = doc(db, "chat_rooms", roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        await setDoc(
          roomRef,
          {
            participants: [user.id.toString()],
            lastMessage: "",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
    };
    ensureRoom();
  }, [roomId, user]);

  // subscribe to Firestore messages
  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, "chat_rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"), limit(500));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs as Message[]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: false }),
        50,
      );
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    const fetchItem = async () => {
      if (!roomId || !token) return;

      try {
        const roomRef = doc(db, "chat_rooms", roomId);
        const roomSnap = await getDoc(roomRef);
        if (!roomSnap.exists()) return;

        const roomData = roomSnap.data();
        const itemId = roomData?.itemId;
        if (!itemId) return;

        const res = await api.get(`/claims/${roomId}`); // the roomId is based on the claim id to ensure chat is entirely based on claims
        const claimData = res.data;
        if (claimData.status !== "approved" || claimData.exchanged) {
          setChatDisabled(true);
        }
      } catch (err) {
        console.error("Failed to fetch item for chat:", err);
      }
    };

    fetchItem();
  }, [roomId, token]);

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !user || !roomId) return;

    // get reference to room and other participant
    const roomRef = doc(db, "chat_rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;

    // was used for push notification but since removed due to device constraints
    // const roomData = roomSnap.data();
    // const participants: string[] = roomData?.participants || [];
    // const receiverId = participants.find((id) => id !== user.id.toString());
    // if (!receiverId) return;

    const messagesRef = collection(db, "chat_rooms", roomId, "messages");
    await addDoc(messagesRef, {
      senderId: user.id.toString(),
      senderName: user.name,
      message: message.trim(),
      createdAt: serverTimestamp(),
    });

    await setDoc(
      roomRef,
      { lastMessage: message.trim(), updatedAt: serverTimestamp() },
      { merge: true },
    );
    // console.log("Message sent and room updated, receiverId:", receiverId);
    setMessage("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = String(item.senderId).trim() === String(user?.id).trim();
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text
          style={[styles.messageText, isMe ? styles.myText : styles.otherText]}
        >
          {item.message}
        </Text>
        {item.createdAt && (
          <Text style={styles.timestamp}>
            {item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          <View
            style={[
              styles.inputContainer,
              {
                paddingBottom:
                  Platform.OS === "android"
                    ? insets.bottom + 50
                    : insets.bottom,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                chatDisabled && { backgroundColor: "#eee" },
              ]}
              value={message}
              onChangeText={setMessage}
              placeholder={
                chatDisabled
                  ? "Chat disabled (item exchanged)"
                  : "Type a message..."
              }
              placeholderTextColor="#999"
              editable={!chatDisabled}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton,
                (!message.trim() || chatDisabled) && styles.sendButtonDisabled,
              ]}
              disabled={!message.trim() || chatDisabled}
            >
              <Text
                style={[
                  styles.sendText,
                  (!message.trim() || chatDisabled) && styles.sendTextDisabled,
                ]}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.pink,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.navy,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16, lineHeight: 20 },
  myText: { color: COLORS.textOnDark },
  otherText: { color: COLORS.textOnDark },
  timestamp: {
    fontSize: 10,
    color: COLORS.grayLight,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    backgroundColor: COLORS.grayLight,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: COLORS.pink,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  sendButtonDisabled: { backgroundColor: COLORS.grayLight },
  sendText: { color: COLORS.textOnDark, fontWeight: "bold", fontSize: 16 },
  sendTextDisabled: { color: "#999" },
});
