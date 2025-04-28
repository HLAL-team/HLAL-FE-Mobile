// app/(tabs)/home.tsx
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import Header from "@/components/Home/Header";
import BalanceCard from "@/components/Home/BalanceCard";
import TopupTransferButton from "@/components/Home/TopupTransferButton";
import { FontAwesome6 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import FavoriteList from "@/components/Home/FavoriteList";
import RecentTransaction from "@/components/Home/RecentTransaction";
import { useAuthStore, useTransactionStore, useFavoriteStore } from "@/store";
import { PRIMARY_COLOR } from "@/constants/colors";

export default function Home() {
  // State for refresh control
  const [refreshing, setRefreshing] = useState(false);
  
  // Get refresh functions from stores
  const fetchUserProfile = useAuthStore(state => state.fetchUserProfile);
  const fetchRecentTransactions = useTransactionStore(state => state.fetchRecentTransactions);
  const fetchFavorites = useFavoriteStore(state => state.fetchFavorites);

  // Refresh function that updates all data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Refresh all data in parallel
      await Promise.all([
        fetchUserProfile(),
        fetchRecentTransactions(),
        fetchFavorites(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserProfile, fetchRecentTransactions, fetchFavorites]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#19918F']} // Using your PRIMARY_COLOR
          tintColor={'#19918F'}
        />
      }
    >
      <Header />
      <BalanceCard />
      <View style={styles.buttonRow}>
        <TopupTransferButton
          label="Top Up"
          icon={<FontAwesome6 name="plus" size={24} color="black" />}
          backgroundColor="rgba(123, 241, 60, 0.07)"
          route="/topup"
        />
        <TopupTransferButton
          label="Transfer"
          icon={<Feather name="send" size={24} color="black" />}
          backgroundColor="rgba(125, 255, 203, 0.07)"
          route="/transfer"
        />
      </View>
      <FavoriteList />
      <RecentTransaction />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40, // Extra padding at the bottom for better scrolling
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});