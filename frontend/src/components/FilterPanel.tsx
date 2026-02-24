import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import kaData from "../data/ka.json";
import kbData from "../data/kb.json";

type Category = {
    id: number;
    name: string;
};


type Props = {
  categories : Category[] | null,
  selectedCategory: number | null;
  setSelectedCategory: (c: number | null) => void;
  sortOldest: boolean;
  setSortOldest: (val: boolean) => void;
  building: "KA" | "KB" | null;
  setBuilding: (val: "KA" | "KB" | null) => void;
  floor: string | null;
  setFloor: (val: string | null) => void;
  location: string | null;
  setLocation: (val: string | null) => void;
};

export default function FilterPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortOldest,
  setSortOldest,
  building,
  setBuilding,
  floor,
  setFloor,
  location,
  setLocation,
}: Props) {
  const locationData = building === "KA" ? kaData.KA : kbData.KB;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {categories?.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, selectedCategory === c.id && { backgroundColor: COLORS.navy }]}
            onPress={() => setSelectedCategory(selectedCategory === c.id ? null : c.id)}
          >
            <Text style={{ color: selectedCategory === c.id ? COLORS.white : COLORS.textMuted }}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>


      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {["Newest", "Oldest"].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, sortOldest && s === "Oldest" && { backgroundColor: COLORS.navy }]}
            onPress={() => setSortOldest(s === "Oldest")}
          >
            <Text style={{ color: sortOldest && s === "Oldest" ? COLORS.white : COLORS.textMuted }}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)} style={{ marginBottom: 8 }}>
        <Text style={{ color: COLORS.navy, fontWeight: "600" }}>
          {showAdvanced ? "Hide Filters" : "More Filters"}
        </Text>
      </TouchableOpacity>

      {/* Advanced filters */}
      {showAdvanced && (
        <>
          {/* Building */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {["KA", "KB"].map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.chip, building === b && { backgroundColor: COLORS.navy }]}
                onPress={() => {
                  setBuilding(building === b ? null : (b as "KA" | "KB"));
                  setFloor(null);
                  setLocation(null);
                }}
              >
                <Text style={{ color: building === b ? COLORS.white : COLORS.textMuted }}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Floor */}
          {building && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {Object.keys(locationData).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, floor === f && { backgroundColor: COLORS.navy }]}
                  onPress={() => {
                    setFloor(f === floor ? null : f);
                    setLocation(null);
                  }}
                >
                  <Text style={{ color: floor === f ? COLORS.white : COLORS.textMuted }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Location */}
          {floor && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(locationData as Record<string, string[]>)[floor].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roomChip, location === r && { backgroundColor: COLORS.navy }]}
                  onPress={() => setLocation(location === r ? null : r)}
                >
                  <Text style={{ color: location === r ? COLORS.white : COLORS.textMuted }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.textMuted + "20",
    marginRight: 8,
  },
  roomChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EEE",
    marginRight: 6,
  },
});
