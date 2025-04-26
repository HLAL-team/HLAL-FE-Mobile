import React, { ReactNode, useEffect, useState } from "react";
import { FavoriteProvider } from "./FavoriteContext";
import { UserProvider } from "./UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/login"); // Redirect to login if no token
        }
      } catch (error) {
        console.error("Error checking token:", error);
        setIsAuthenticated(false);
        router.replace("/login"); // Redirect to login on error
      }
    };

    checkToken();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <UserProvider>
      <FavoriteProvider>{children}</FavoriteProvider>
    </UserProvider>
  );
};