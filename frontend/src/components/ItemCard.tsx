// components/ItemCard.tsx
import { BASE_URL } from "@/src/services/api";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import { Image } from "expo-image";

type Item = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  image_path?: string;
  similarity?: number;
  level?: "High" | "Mid" | "Low";
};

export default function ItemCard({
  item,
  useNlp,
  onPress,
}: {
  item: Item;
  useNlp: boolean;
  onPress: () => void;
}) {
  const getLevelColor = () => {
    switch (item.level) {
      case "High":
        return "#28a745";
      case "Mid":
        return "#ffc107";
      case "Low":
        return "#dc3545"; // red but have omitted due to constraints with AI
      default:
        return COLORS.navy;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {item.image_path && (
        <Image
          source={{ uri: `${BASE_URL}/storage/${item.image_path}` }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      {useNlp && item.similarity !== undefined && (
        <View style={styles.badgeContainer}>
          <Text style={[styles.similarity, { color: getLevelColor() }]}>
            {Math.round(item.similarity * 100)}% match ({item.level})
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
    marginBottom: 12,
  },
  itemImage: { width: "100%", height: 120, borderRadius: 12, marginBottom: 8 },
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
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  badgeContainer: {
    alignItems: "flex-end",
  },
});
