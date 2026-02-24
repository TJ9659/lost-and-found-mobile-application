import React from "react";
import { DimensionValue, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { COLORS } from "../../src/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: "primary" | "secondary";
  disabled?: boolean;
  width?: DimensionValue;
  style?: ViewStyle | ViewStyle[];
}

export default function Button({
  title,
  onPress,
  type = "primary",
  disabled = false,
  width,
  style,
}: ButtonProps) {
  const widthStyle: ViewStyle = width !== undefined ? { width } : {};

  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === "primary" ? styles.primary : styles.secondary,
        disabled ? styles.disabled : {},
        widthStyle,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          type === "primary" ? styles.textPrimary : styles.textSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 6,
  },
  primary: {
    backgroundColor: COLORS.pink,
  },
  secondary: {
    backgroundColor: COLORS.navy,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
  },
  disabled: {
    backgroundColor: COLORS.grayMedium,
    borderColor: COLORS.grayMedium,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textPrimary: {
    color: COLORS.white,
  },
  textSecondary: {
    color: COLORS.white,
  },
});
