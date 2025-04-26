import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PROFILE_API } from "@/constants/api";

type User = {
  fullname: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  accountNumber: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
} | null;

type UserContextType = {
  user: User;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(PROFILE_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setUser(data); // Set user data dari API
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    setUser(null);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
