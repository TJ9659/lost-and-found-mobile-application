import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  options: string[];
  selected: string | null;
  placeholder?: string;
  onSelect: (value: string) => void;
};

export default function DropdownFilter({
  options,
  selected,
  placeholder,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      {selected === null && placeholder && (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.button, selected === opt && styles.buttonSelected]}
          onPress={() => onSelect(selected === opt ? null : opt)}
        >
          <Text style={[styles.text, selected === opt && styles.textSelected]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  button: {
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.textMuted + "20",
    marginRight: 8,
    marginBottom: 8,
  },
  buttonSelected: { backgroundColor: COLORS.navy },
  text: { fontSize: 12, color: COLORS.textMuted },
  textSelected: { color: COLORS.white },
  placeholder: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginRight: 8,
    marginBottom: 8,
  },
});
