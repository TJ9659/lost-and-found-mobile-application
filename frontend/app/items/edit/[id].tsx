import CustomPicker from "@/src/components/CustomPicker";
import TagList from "@/src/components/TagList";
import * as ImagePicker from "expo-image-picker";
import React, { useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { COLORS } from "../../../src/constants/colors";
import { Image } from "expo-image";
import { AuthContext } from "@/src/context/AuthContext";
import api, { BASE_URL } from "@/src/services/api";
import kaData from "../../../src/data/ka.json";
import kbData from "../../../src/data/kb.json";
import { useRouter, useGlobalSearchParams } from "expo-router";

interface Category {
  id: string;
  name: string;
}
export default function EditScreen() {
  const { token } = useContext(AuthContext);
  const { id } = useGlobalSearchParams<{ id: string }>();
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"lost" | "found" | "">("");
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchItem = async () => {
    if (!id || !token) return;
    try {
      setLoading(true);
      const res = await api.get(`/items/edit/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const item = res.data;
      setItemName(item.name);
      setDescription(item.description);
      setStatus(item.status);
      setCategory(item.category);
      setBuilding(item.building);
      setFloor(item.floor);
      setLocation(item.location);
      setTags(
        Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || "[]"),
      );
      setImage(item.image_path || null);
    } catch (err) {
      console.error("Failed to fetch item:", err);
      alert("Failed to load item data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const data = res.data;
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchItem();
    fetchCategories();
  }, [id, token]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [5, 5],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        setImage(selectedUri);
        setTags([]);
        await analyzeImage(selectedUri);
      }
    } catch (err) {
      console.error("Image pick error:", err);
      alert("Failed to pick image. Please try again.");
    }
  };

  const analyzeImage = async (uri: string) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "upload.jpg",
        type: "image/jpeg",
      } as any);

      const timeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Image analysis took too long")),
          10000,
        ),
      );

      const res = await Promise.race([
        api.post(`/vision/analyze`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
        timeout,
      ]);

      const { labels } = (res as any).data;
      if (labels?.length) {
        setTags(labels);
      } else {
      }
    } catch (err: any) {
      console.error("Vision analyze error:", err);
      setTags([]);
      alert(
        err.message ||
          "Image analysis failed or took too long. You can still submit without tags.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getFloors = () =>
    building === "KA"
      ? Object.keys(kaData.KA)
      : building === "KB"
        ? Object.keys(kbData.KB)
        : [];
  const getLocations = () =>
    building === "KA" && floor
      ? (kaData.KA as Record<string, string[]>)[floor] || []
      : building === "KB" && floor
        ? (kbData.KB as Record<string, string[]>)[floor] || []
        : [];

  // Validate form
  const validateForm = () => {
    if (!itemName.trim()) return "Item name is required.";
    if (!description.trim()) return "Description is required.";
    if (!status) return "Please select Lost or Found.";
    if (!category) return "Please select a category.";
    if (!building) return "Please select a building.";
    if (!floor) return "Please select a floor.";
    if (!location) return "Please select a location.";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      if (image && image.startsWith("file://")) {
        formData.append("image", {
          uri: image,
          name: "item.jpg",
          type: "image/jpeg",
        } as any);
      }

      formData.append("name", itemName);
      formData.append("description", description);
      formData.append("building", building);
      formData.append("floor", floor);
      formData.append("location", location);
      formData.append("status", status);
      formData.append("category_id", String(category!.id));
      formData.append("_method", "PUT");
      tags.forEach((tag) => {
        formData.append("tags[]", tag);
      });

      await api.post(`/items/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Item updated successfully!");
      router.dismissAll();
      router.push(`/items/details/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={styles.container}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Edit Item</Text>

        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image
              source={{
                uri:
                  image.startsWith("http") || image.startsWith("file://")
                    ? image
                    : `${BASE_URL}/storage/${image}`,
              }}
              style={styles.image}
            />
          ) : (
            <Text style={styles.imageText}>Tap to select image</Text>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={{ marginBottom: 8, color: "#555" }}>
            Analyzing image...
          </Text>
        )}

        {tags.length > 0 && !loading && (
          <>
            <Text style={{ marginBottom: 4, color: "#555" }}>
              Image analyzed! You can remove any incorrect tags:
            </Text>
            <TagList
              tags={tags}
              onRemove={(tag) => setTags(tags.filter((t) => t !== tag))}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Enter item name"
          value={itemName}
          onChangeText={setItemName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <CustomPicker
          selectedValue={status}
          onValueChange={(value) => setStatus(value as "lost" | "found")}
          items={[
            { label: "Lost", value: "lost" },
            { label: "Found", value: "found" },
          ]}
          placeholder="Select Status"
        />
        <CustomPicker
          selectedValue={category?.id}
          onValueChange={(id) => {
            const selected = categories.find((c) => c.id === id);
            setCategory(selected || null);
          }}
          items={categories.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }))}
          placeholder="Select Category"
        />
        <CustomPicker
          selectedValue={building}
          onValueChange={(value) => {
            setBuilding(value);
            setFloor("");
            setLocation("");
          }}
          items={[
            { label: "KA", value: "KA" },
            { label: "KB", value: "KB" },
          ]}
          placeholder="Select Building"
        />
        {building && (
          <CustomPicker
            selectedValue={floor}
            onValueChange={(value) => {
              setFloor(value);
              setLocation("");
            }}
            items={getFloors().map((f) => ({ label: f, value: f }))}
            placeholder="Select Floor"
          />
        )}
        {floor && (
          <CustomPicker
            selectedValue={location}
            onValueChange={(value) => setLocation(value)}
            items={getLocations().map((loc) => ({ label: loc, value: loc }))}
            placeholder="Select Location"
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Updating..." : "Update Item"}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 100 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  imageBox: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  imageText: { color: "#888" },
  image: { width: "100%", height: "100%", borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  button: {
    backgroundColor: COLORS.navy,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
