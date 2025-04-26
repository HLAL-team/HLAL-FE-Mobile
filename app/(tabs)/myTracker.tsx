import { FlatList, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import Transaction from "@/components/MyTracker/Transaction";
import IncomeOutcomeChart from "@/components/MyTracker/IncomeOutcomeChart";
import { PROFILE_API } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRIMARY_COLOR } from "@/constants/colors";

const MyTracker = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(PROFILE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const json = await response.json();
        setUsername(json.username || "Guest");
      } catch (error) {
        console.error("Failed to fetch username:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsername();
  }, []);

  const renderHeader = () => (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      ) : (
        <>
          <Text
            style={{
              color: "black",
              fontSize: 30,
              fontWeight: "600",
              textAlign: "left",
              marginBottom: 8,
            }}
          >
            Hi, {username}
          </Text>
          <Text style={{ color: "black", fontSize: 16, marginBottom: 20 }}>
            Here's your transaction journey.
          </Text>
          <IncomeOutcomeChart />
        </>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.transactionContainer}>
      <Transaction />
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={[]} // Empty data since the header and Transaction component handle content
      renderItem={null} // No items to render in the FlatList
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.scrollContainer}
    />
  );
};

export default MyTracker;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Ensures the content takes up the available space
  },
  container: {
    flex: 1,
    backgroundColor: "white", // Set background color to white
    paddingHorizontal: 25, // Add padding around the entire screen
    paddingTop: 25, // Add padding above the header
  },
  transactionContainer: {
    backgroundColor: "white", // Set background color to white for Transaction
    paddingHorizontal: 25, // Add padding around the Transaction component
    paddingTop: 0, // Add padding above the Transaction component
  },
  chartContainer: {
    marginBottom: 20, // Add margin below the chart to separate it from the transaction history
  },
});