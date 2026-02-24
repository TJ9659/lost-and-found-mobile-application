import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

type LocationData = {
  floors: Record<string, string[]>;
};

type LocationDropdownProps = {
  building?: "KA" | "KB" | null;
  data: LocationData;
  selectedFloor: string | null;
  selectedLocation: string | null;
  onSelectFloor: (floor: string | null) => void;
  onSelectLocation: (loc: string | null) => void;
};

export default function LocationDropdown({
  building,
  data,
  selectedFloor,
  selectedLocation,
  onSelectFloor,
  onSelectLocation,
}: LocationDropdownProps) {
  if (!building || !data) return null;

  return (
    <ScrollView style={{ maxHeight: 250, marginBottom: 8 }}>
      {/* Floor buttons */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
        {Object.keys(data.floors).map((floor) => (
          <TouchableOpacity
            key={floor}
            style={[styles.dropdownItem, selectedFloor === floor && { backgroundColor: COLORS.navy }]}
            onPress={() => {
              onSelectFloor(selectedFloor === floor ? null : floor);
              if (selectedFloor !== floor) onSelectLocation(null); // reset location
            }}
          >
            <Text style={{ color: selectedFloor === floor ? COLORS.white : COLORS.textMuted }}>
              {floor}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedFloor && (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {data.floors[selectedFloor].map((loc) => (
            <TouchableOpacity
              key={loc}
              style={[styles.roomButton, selectedLocation === loc && { backgroundColor: COLORS.navy }]}
              onPress={() => onSelectLocation(selectedLocation === loc ? null : loc)}
            >
              <Text style={{ color: selectedLocation === loc ? COLORS.white : COLORS.textMuted }}>
                {loc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dropdownItem: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.textMuted + "20",
    marginRight: 8,
    marginBottom: 8,
  },
  roomButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EEE",
    marginRight: 6,
    marginBottom: 6,
  },
});
