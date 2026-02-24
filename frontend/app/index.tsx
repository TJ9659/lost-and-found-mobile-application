import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../src/context/AuthContext";

export default function Index() {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (token) {
        router.replace("/home");      // logged-in users
      } else {
        router.replace("/welcome");   // not logged-in users
      }
    }
  }, [loading, token]);

  return null; // loader is handled by _layout.js
}
