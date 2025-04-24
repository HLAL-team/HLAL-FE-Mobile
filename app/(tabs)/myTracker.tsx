import { ScrollView, View, Text, StyleSheet } from "react-native";
import React from "react";
import Transaction from "@/components/MyTracker/Transaction";
import IncomeOutcomeChart from "@/components/MyTracker/IncomeOutcomeChart";

const MyTracker = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text
          style={{
            color: 'black',
            fontSize: 30,
            fontWeight: '600',
            textAlign: 'left',
            marginBottom: 8,
          }}
        >
          Hi, Idan
        </Text>
        <Text style={{ color: 'black', fontSize: 16, marginBottom: 20 }}>
          Here's your transaction journey.
        </Text>
        <IncomeOutcomeChart />
        <Transaction />
      </View>
    </ScrollView>
  );
};

export default MyTracker;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Ensures the content takes up the available space
  },
  container: {
    flex: 1,
    backgroundColor: 'white', // Set background color to white
    padding: 25, // Add padding around the entire screen
  },
  chartContainer: {
    marginBottom: 20, // Add margin below the chart to separate it from the transaction history
  },
});
