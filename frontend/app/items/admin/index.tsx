import FilterPanel from "@/src/components/FilterPanel";
import ItemCard from "@/src/components/ItemCard";
import SearchBar from "@/src/components/SearchBar"; // fixed casing
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../../src/constants/colors";
import { AuthContext } from "../../../src/context/AuthContext";
import kaData from "../../../src/data/ka.json";
import kbData from "../../../src/data/kb.json";
import api from "../../../src/services/api";

type Item = {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  image_path?: string;
  created_at: string;
  similarity?: number;
  non_claimable: boolean;
  user: any;
};

export default function AdminItemsPage() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [useNlp, setUseNlp] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOldest, setSortOldest] = useState(false);

  const [building, setBuilding] = useState<"KA" | "KB" | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const locationData = building === "KA" ? kaData.KA : kbData.KB;

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAdminItems = async () => {
    setLoading(true);
    console.log("token", token);
    try {
      const res = await api.get("/items/admin", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch admin items", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    fetchAdminItems();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.pink} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                useNlp={useNlp}
                onPress={() => router.push(`/items/admin/${item.id}`)}
              />
            )}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 12,
            }}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={
              <Text style={styles.empty}>No found items reported.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: COLORS.textOnLight,
  },
  description: { fontSize: 14, marginBottom: 6, color: COLORS.textMuted },
  date: { fontSize: 12, color: COLORS.textMuted, textAlign: "right" },
  similarity: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", marginTop: 50, color: COLORS.textMuted },
  itemImage: { width: "100%", height: 120, borderRadius: 12, marginBottom: 8 },
});
