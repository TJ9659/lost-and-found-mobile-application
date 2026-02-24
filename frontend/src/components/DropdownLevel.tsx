// src/components/DropdownLevel.tsx
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function DropdownLevel({
  options,
  selected,
  onSelect,
  placeholder = "Select",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const handlePress = (value: string) => {
    if (!disabled) {
      onSelect(value);
      setOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          selected && styles.buttonSelected,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => !disabled && setOpen(!open)}
      >
        <Text
          style={[
            styles.buttonText,
            selected && styles.buttonTextSelected,
            disabled && styles.buttonTextDisabled,
          ]}
        >
          {selected || placeholder}
        </Text>
      </TouchableOpacity>

      {open && !disabled && (
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.option, item === selected && styles.optionSelected]}
              onPress={() => handlePress(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  item === selected && styles.optionTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: 8, marginBottom: 8 },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.textMuted + "20",
  },
  buttonSelected: {
    backgroundColor: COLORS.navy,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textMuted + "10",
  },
  buttonText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  buttonTextSelected: { color: COLORS.white },
  buttonTextDisabled: { color: COLORS.textMuted + "80" },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.textMuted + "20",
    marginTop: 4,
  },
  optionSelected: { backgroundColor: COLORS.navy },
  optionText: { fontSize: 14, color: COLORS.textMuted },
  optionTextSelected: { color: COLORS.white },
});
