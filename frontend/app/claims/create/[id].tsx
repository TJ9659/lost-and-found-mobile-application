import api from "@/src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../../src/constants/colors";
import { saveNotification } from "@/src/services/notifications";
import * as ImageManipulator from "expo-image-manipulator";

export default function ClaimForm() {
  const { id } = useGlobalSearchParams(); // item_id from URL
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImage(selectedUri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "dismissed") return;

    if (selectedDate) {
      setDate(selectedDate);
      setShowTimePicker(true); // after picking date, ask for time
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === "dismissed") return;

    if (selectedTime && date) {
      const updated = new Date(date);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setDate(updated);
    }
  };

  const validateForm = () => {
    if (!message.trim()) return "Please explain why you’re claiming this item.";
    if (!location.trim()) return "Please provide location details.";
    if (!date) return "Please provide date and time details.";
    return null; // no errors
  };

  const handleClaim = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    if (!id) {
      Alert.alert("Error", "Item ID not found.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      let uploadUri = image;

      // 1. Compress / resize image if any
      if (uploadUri) {
        const manipResult = await ImageManipulator.manipulateAsync(
          uploadUri,
          [{ resize: { width: 1024 } }], // resize to max 1024px width
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // convert to JPEG
        );
        uploadUri = manipResult.uri;
      }

      const formData = new FormData();
      formData.append("item_id", String(id));
      formData.append("message", message);
      formData.append("location_detail", location);
      formData.append("datetime_detail", date.toISOString());

      if (uploadUri) {
        formData.append("proof_image", {
          uri: uploadUri,
          name: "proof.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await api.post(`/claims`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const claimId = res.data.id;
      const owner = res.data.item.user;
      const itemName = res.data.item.name;
      const claimerName = res.data.claimer.name;

      if (owner?.id) {
        await saveNotification(
          owner.id,
          "Item Claimed",
          `${claimerName} claimed your item "${itemName}"`,
          { type: "claim", claimId, itemName, claimerName }
        );
      }

      Alert.alert("Success", "Claim submitted!");
      router.replace("/home");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not submit claim."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Why do you claim this item? (e.g. It's mine because...)"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Text style={styles.label}>Location Detail</Text>
      <TextInput
        style={styles.input}
        placeholder="Where did you lose it specifically? (e.g. on a table)"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Date Time</Text>
      <TouchableOpacity
        onPress={() => {
          Keyboard.dismiss();
          setShowDatePicker(true);
        }}
        style={[styles.input, { marginBottom: 10 }]}
      >
        <Text style={{}}>
          {date ? date.toLocaleString() : "Select date & time"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
        <Text style={styles.imageBtnText}>
          {image ? "Change Proof Image" : "Upload Proof Image"}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <TouchableOpacity
        onPress={handleClaim}
        style={styles.submitBtn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Claim</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    color: COLORS.textOnLight,
  },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  imageBtn: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: COLORS.navy,
    borderRadius: 8,
  },
  imageBtnText: { color: "#fff", textAlign: "center" },
  preview: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
  submitBtn: {
    marginTop: 20,
    backgroundColor: COLORS.pink,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: COLORS.textOnDark, fontSize: 16, fontWeight: "bold" },
});
