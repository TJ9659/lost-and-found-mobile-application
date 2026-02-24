import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { Image } from "expo-image";

type Props = {
  uri: string;
  style?: object;
};

export default function FullScreenImage({ uri, style }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Image source={{ uri }} style={style} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setVisible(false)}
        >
          <Image
            source={{ uri }}
            style={styles.fullImage}
            contentFit="contain"
          />
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});
