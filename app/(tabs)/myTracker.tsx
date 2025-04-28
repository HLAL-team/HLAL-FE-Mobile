import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import IncomeOutcomeChart from "@/components/MyTracker/IncomeOutcomeChart";
import { PRIMARY_COLOR } from "@/constants/colors";
import { useAuthStore } from "@/store"; // Import auth store

const MyTracker = () => {
  // Add refreshing state
  const [refreshing, setRefreshing] = useState(false);
  
  // Get user data and loading state from the auth store
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const fetchUserProfile = useAuthStore(state => state.fetchUserProfile);
  
  // Prevent multiple fetch calls
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    // Fetch user profile only once
    if (!hasInitialized.current) {
      fetchUserProfile();
      hasInitialized.current = true;
    }
  }, []);

  // Add refresh handler function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      // Refresh user profile data
      await fetchUserProfile();
      
      // Force chart to refresh by remounting it
      setChartKey(prev => prev + 1);
      
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserProfile]);
  
  // Add key state to force remount the chart component
  const [chartKey, setChartKey] = useState(0);

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[PRIMARY_COLOR]}
          tintColor={PRIMARY_COLOR}
        />
      }
    >
      <View style={styles.container}>
        {loading && !user ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        ) : (
          <>
            <Text style={styles.greeting}>
              Hi, {user?.username || "Guest"}
            </Text>
            <Text style={styles.subheading}>
              Here's your transaction journey.
            </Text>
            <View style={styles.chartContainer}>
              <IncomeOutcomeChart key={chartKey} />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default MyTracker;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 30,
  },
  greeting: {
    color: "black",
    fontSize: 30,
    fontWeight: "600",
    textAlign: "left",
    marginBottom: 8,
  },
  subheading: {
    color: "black",
    fontSize: 16,
    marginBottom: 20,
  },
  chartContainer: {
    marginTop: 20,
  },
});