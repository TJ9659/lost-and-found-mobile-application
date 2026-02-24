import React from "react";
import { StyleSheet, View } from "react-native";
import DropdownLevel from "./DropdownLevel";

type Props = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;

  buildings: string[];
  floorsMap: Record<string, string[]>;
  roomsMap: Record<string, string[]>;

  selectedBuilding: string | null;
  selectedFloor: string | null;
  selectedRoom: string | null;
  onSelectBuilding: (b: string | null) => void;
  onSelectFloor: (f: string | null) => void;
  onSelectRoom: (r: string | null) => void;

  sortOldest: boolean;
  onSortChange: (sortOldest: boolean) => void;

  useNlp: boolean;
};

export default function SearchFiltersPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  buildings,
  floorsMap,
  roomsMap,
  selectedBuilding,
  selectedFloor,
  selectedRoom,
  onSelectBuilding,
  onSelectFloor,
  onSelectRoom,
  sortOldest,
  onSortChange,
  useNlp,
}: Props) {
  const disabled = useNlp; // disable filters if NLP search is active

  return (
    <View style={styles.container}>
      {/* Category */}
      <DropdownLevel
        options={categories}
        selected={selectedCategory}
        onSelect={onSelectCategory}
        placeholder="Category"
        disabled={disabled}
      />

      {/* Location */}
      <DropdownLevel
        options={buildings}
        selected={selectedBuilding}
        placeholder="Building"
        onSelect={(b) => onSelectBuilding(selectedBuilding === b ? null : b)}
        disabled={disabled}
      />
      {selectedBuilding && (
        <DropdownLevel
          options={floorsMap[selectedBuilding]}
          selected={selectedFloor}
          placeholder="Floor"
          onSelect={(f) => onSelectFloor(selectedFloor === f ? null : f)}
          disabled={disabled}
        />
      )}
      {selectedBuilding && selectedFloor && (
        <DropdownLevel
          options={roomsMap[`${selectedBuilding}-${selectedFloor}`]}
          selected={selectedRoom}
          placeholder="Room"
          onSelect={(r) => onSelectRoom(selectedRoom === r ? null : r)}
          disabled={disabled}
        />
      )}

      {/* Sort */}
      <DropdownLevel
        options={["Oldest", "Newest"]}
        selected={sortOldest ? "Oldest" : "Newest"}
        onSelect={(s) => onSortChange(s === "Oldest")}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
});
