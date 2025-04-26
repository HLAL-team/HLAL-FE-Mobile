import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        ) : (
          <>
            <Text style={styles.greeting}>
              Hi, {username}
            </Text>
            <Text style={styles.subheading}>
              Here's your transaction journey.
            </Text>
            <View style={styles.chartContainer}>
              <IncomeOutcomeChart />
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