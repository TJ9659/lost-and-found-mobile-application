import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push("/welcome")} style={{ marginBottom: 20 }}>
      <Text style={{ color: "#3498db", fontWeight: "bold" }}>← Back to Welcome</Text>
    </TouchableOpacity>
  );
};

export default BackButton;
