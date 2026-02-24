import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          await fetchUser(storedToken);
        }
      } catch (err) {
        console.log("Failed to load auth state:", err);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadAuthState();
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem("token");
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });
      const userToken = res.data.token;
      await AsyncStorage.setItem("token", userToken);
      setToken(userToken);
      await fetchUser(userToken);
      return res.data; // success
    } catch (error) {
      const errData = error.response?.data;
      throw {
        message: errData?.message || error.message || "Login failed",
        resendUrl: errData?.resend_verification_url || null,
      };
    }
  };

  const register = async ({
    name,
    email,
    password,
    password_confirmation,
    studentId,
    faculty,
  }) => {
    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: password_confirmation || password,
        student_id: studentId || null, // optional
        faculty,
      });

      return res; // return full axios response
    } catch (error) {
      const errData = error.response?.data;

      if (errData?.errors) {
        const messages = Object.values(errData.errors).flat();
        throw new Error(messages.join("\n")); // show nicely
      }

      throw new Error(errData?.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post(
          "/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (_) {
    } finally {
      await AsyncStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  };

  // Memoize context to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ user, token, loading, login, register, logout, setUser }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
