import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const TagList = ({
  tags,
  onRemove,
}: {
  tags: string[];
  onRemove: (tag: string) => void;
}) => {
  return (
    <React.Fragment>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
        Suggested Tags:
      </Text>
      <Text style={{ color: "#888", marginBottom: 8 }}>
        These tags are auto-generated. Remove irrelevant ones to improve search.
      </Text>
      <KeyboardAwareScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexDirection: "row", marginBottom: 12 }}
      >
        {tags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tagPill}
            onPress={() => onRemove(tag)}
          >
            <Text style={styles.tagText}>{tag}</Text>
            <Text style={styles.tagRemove}> ×</Text>
          </TouchableOpacity>
        ))}
      </KeyboardAwareScrollView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  tagPill: {
    flexDirection: "row",
    backgroundColor: "#e6f0ff",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: "center",
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  tagRemove: {
    fontSize: 16,
    marginLeft: 6,
    color: "#007AFF",
    fontWeight: "bold",
  },
});

export default TagList;
