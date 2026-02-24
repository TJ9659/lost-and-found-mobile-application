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
import { Pagination } from "@/src/components/Pagination";

type Item = {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  image_path?: string;
  created_at: string;
  similarity?: number;
  user: any;
};

type Category = {
  id: number;
  name: string;
};

export default function LostItemsPage() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState({ current: 1, last: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [useNlp, setUseNlp] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortOldest, setSortOldest] = useState(false);

  const [building, setBuilding] = useState<"KA" | "KB" | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const locationData = building === "KA" ? kaData.KA : kbData.KB;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCategories = async () => {
    setCategoryLoading(true);

    try {
      const res = await api.get("/categories");
      const data = res.data;

      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchItems = async () => {
    if (!searchQuery && useNlp) return; // don't search empty query semantically

    setLoading(true);

    try {
      if (useNlp) {
        const res = await api.post(
          "/semantic-search",
          { query: searchQuery, status: "lost" },
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        );
        setItems(res.data);
      } else {
        const res = await api.get(`/items?page=${page}`, {
          params: {
            search: searchQuery || undefined,
            status: "lost",
            category: selectedCategory || undefined,
            building: building || undefined,
            floor: floor || undefined,
            location: location || undefined,
            oldest: sortOldest ? true : undefined,
          },
        });

        setItems(res.data.data);
        setPagination({
          current: res.data.current_page,
          last: res.data.last_page,
        });
      }
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchItems();
    }, 400);
  }, [
    searchQuery,
    useNlp,
    selectedCategory,
    building,
    floor,
    location,
    sortOldest,
    page,
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Search & NLP */}
        <SearchBar
          searchValue={searchQuery}
          setSearchValue={setSearchQuery}
          onSubmitEditing={fetchItems}
          useNlp={useNlp}
          setUseNlp={setUseNlp}
          placeholder="Search lost items..."
        />

        {!useNlp && (
          <FilterPanel
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortOldest={sortOldest}
            setSortOldest={setSortOldest}
            building={building}
            setBuilding={setBuilding}
            floor={floor}
            setFloor={setFloor}
            location={location}
            setLocation={setLocation}
          />
        )}

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
                onPress={() => router.push(`/items/details/${item.id}`)}
              />
            )}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 12,
            }}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={
              <Text style={styles.empty}>No lost items reported.</Text>
            }
          />
        )}
        {!useNlp && (
          <Pagination
            current={pagination.current}
            last={pagination.last}
            onPageChange={(newPage) => setPage(newPage)}
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
