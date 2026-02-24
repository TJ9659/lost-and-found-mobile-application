import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "@/src/context/AuthContext";
import api, { BASE_URL } from "@/src/services/api";
import { COLORS } from "@/src/constants/colors";
import * as ImageManipulator from "expo-image-manipulator";
import faculties from "@/src/data/faculties.json";
import { Picker } from "@react-native-picker/picker";

export default function EditProfilePage() {
  const { token, user, setUser } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [removePic, setRemovePic] = useState(false); // NEW
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setStudentId(user.student_id || "");
      setFaculty(user.faculty || "");
      setProfilePic(user.profile_pic || null);
      setRemovePic(false); // reset remove flag
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted")
      return alert("Permission denied to access media library.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const selectedUri = result.assets[0].uri;
    const manipResult = await ImageManipulator.manipulateAsync(
      selectedUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );

    setProfilePic(manipResult.uri);
    setRemovePic(false); // user selected a new pic, reset remove flag
  };

  // Remove profile picture
  const handleRemovePic = () => {
    setProfilePic(null);
    setRemovePic(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("student_id", studentId);
      formData.append("faculty", faculty);

      // only send profile pic if user selected a new one
      if (profilePic && profilePic.startsWith("file")) {
        const fileName = profilePic.split("/").pop()!;
        formData.append("profile_pic", {
          uri: profilePic,
          name: fileName,
          type: "image/jpeg",
        } as any);
      }

      // add remove flag if user clicked remove
      if (removePic) {
        formData.append("remove_profile_pic", "true");
      }

      formData.append("_method", "PUT");

      const response = await api.post("/profile/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        transformRequest: (data) => data,
      });

      setUser(response.data.user);
      alert("Profile updated successfully!");
      setRemovePic(false); // reset remove flag after update
    } catch (error: any) {
      console.error("Error updating profile:", error.response || error.message);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profilePic ? (
            <Image
              source={{
                uri: profilePic.startsWith("file")
                  ? profilePic
                  : `${BASE_URL}/storage/${profilePic}`,
              }}
              style={styles.image}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text>Select Image</Text>
            </View>
          )}
        </TouchableOpacity>
        {profilePic && !removePic && (
          <TouchableOpacity
            onPress={handleRemovePic}
            style={styles.removeButton}
          >
            <Text style={{ color: COLORS.white }}>Remove Profile Picture</Text>
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Student ID"
          value={studentId}
          onChangeText={setStudentId}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={faculty}
            onValueChange={(itemValue) => setFaculty(itemValue)}
          >
            <Picker.Item label="Select Faculty" value="" style={{padding: 1}} />
            {faculties.map((f) => (
              <Picker.Item key={f.code} label={f.name} value={f.code} />
            ))}
          </Picker>
        </View>
        <TextInput
          style={styles.input}
          placeholder="New Password (leave blank to keep current)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.pink} />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageContainer: { alignSelf: "center", marginBottom: 10 },
  image: { width: 120, height: 120, borderRadius: 60 },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    alignSelf: "center",
    backgroundColor: COLORS.pink,
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.navy,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginVertical: 10,
  },
});
