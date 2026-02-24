import { useGlobalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/constants/colors";
import { AuthContext } from "../../src/context/AuthContext";
import api, { BASE_URL } from "../../src/services/api";
import { Image } from "expo-image";

export default function UserProfilePage({ onEdit }: { onEdit?: () => void }) {
  const { user: currentUser, token, logout } = useContext(AuthContext);
  const params = useGlobalSearchParams();
  const router = useRouter();
  const userIdParam = params.userId ? Number(params.userId) : undefined;

  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userIdParam || userIdParam === currentUser?.id;

  const loadUser = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const url = isOwnProfile ? "/me" : `/users/${userIdParam}`;
      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileUser(res.data);
    } catch (err: any) {
      console.error("Failed to fetch user:", err.response?.status || err);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadUser();
      }
    }, [token]),
  );

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    router.replace("/login");
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.pink} />
      </View>
    );
  if (!profileUser)
    return <Text style={styles.errorText}>User not found.</Text>;

  return (
    <View style={styles.container}>
      <Image
        source={
          profileUser.profile_pic
            ? { uri: `${BASE_URL}/storage/${profileUser.profile_pic}` }
            : require("../../assets/images/default.png")
        }
        style={styles.avatar}
      />
      <Text style={styles.name}>{profileUser.name}</Text>
      {isOwnProfile && <Text style={styles.email}>{profileUser.email}</Text>}

      {isOwnProfile && onEdit && (
        <View style={styles.button}>
          <Button
            title="Edit Profile"
            onPress={() => router.push("/profile/editProfile")}
            color={COLORS.pink}
          />
        </View>
      )}

      {isOwnProfile && (
        <View style={styles.button}>
          <Button title="Logout" onPress={handleLogout} color={COLORS.navy} />
        </View>
      )}

      {/* Reported Items */}
      <Text style={styles.sectionTitle}>Reported Items</Text>
      {profileUser.reported_items?.length > 0 ? (
        <FlatList
          data={profileUser.reported_items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => router.push(`/items/details/${item.id}`)}
            >
              <Image
                source={{ uri: `${BASE_URL}/storage/${item.image_path}` }}
                style={styles.itemImage}
              />
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>
                  {item.type === "found" ? "Found" : "Lost"}
                </Text>
                {item.description && (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <Text style={styles.noItemsText}>No reported items yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, alignSelf: "center" },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  email: { fontSize: 16, color: "gray", textAlign: "center" },
  button: { marginTop: 10, borderRadius: 15, overflow: "hidden" },
  sectionTitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  itemCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  itemText: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "500", color: COLORS.navy },
  itemType: { fontSize: 14, color: COLORS.textMuted },
  itemDesc: { fontSize: 14, color: COLORS.textMuted },
  noItemsText: { textAlign: "center", marginTop: 20, color: COLORS.textMuted },
  errorText: { textAlign: "center", marginTop: 20, color: "red" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
