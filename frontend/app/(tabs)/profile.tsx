import React, { useContext } from "react";
import { Text } from "react-native";
import { AuthContext } from "../../src/context/AuthContext";
import UserProfilePage from "../profile";

export default function ProfileTab() {
  const { user } = useContext(AuthContext);

  if (!user) return <Text>Loading...</Text>;

  return (
    <UserProfilePage
      onEdit={() => console.log("Navigate to edit screen")}
    />
  );
}
