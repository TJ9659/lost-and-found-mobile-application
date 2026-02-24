// src/components/SearchBar.tsx
import { COLORS } from "@/src/constants/colors";
import React from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

type Props = {
  searchValue: string;
  setSearchValue: (text: string) => void;
  onSubmitEditing: () => void;
  useNlp: boolean;
  setUseNlp: (val: boolean) => void;
  placeholder?: string;
};

export default function SearchBar({
  searchValue,
  setSearchValue,
  onSubmitEditing,
  useNlp,
  setUseNlp,
  placeholder = "Search found items...",
}: Props) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={searchValue}
        onChangeText={setSearchValue}
        onSubmitEditing={onSubmitEditing}
      />
      <Switch
        value={useNlp}
        onValueChange={(value) => {
          setUseNlp(value);
          setSearchValue("");
        }}
        trackColor={{ false: COLORS.textMuted, true: COLORS.navy }}
      />
      <Text style={{ marginLeft: 8 }}>Semantic search</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
});
