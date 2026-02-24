import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

type PaginationProps = {
  current: number;
  last: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  current,
  last,
  onPageChange,
}: PaginationProps) => {
  if (last <= 1) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPageChange(current - 1)}
        disabled={current === 1}
        style={[styles.button, current === 1 && styles.disabled]}
      >
        <Ionicons name="arrow-back-outline" color={COLORS.pink} size={20}/>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={styles.currentText}>{current}</Text>
        <Text style={styles.lastText}> of {last}</Text>
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(current + 1)}
        disabled={current === last}
        style={[styles.button, current === last && styles.disabled]}
      >
        <Ionicons name="arrow-forward-outline" color={COLORS.pink} size={20}/>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.3,
  },
  arrow: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  pageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textOnLight,
  },
  lastText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
