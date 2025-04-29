import React, { ReactNode, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { PRIMARY_COLOR } from "@/constants/colors";
import { initializeStores, useAuthStore } from "@/store"; // Import from our new store

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  
  // Get auth state from our Zustand store
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initialized = useAuthStore(state => state.initialized);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize our stores
        await initializeStores();
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!initializing && initialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initializing, initialized, isAuthenticated, router]);

  if (initializing || !initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return <>{children}</>;
};