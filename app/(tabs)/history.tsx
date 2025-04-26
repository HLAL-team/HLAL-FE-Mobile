import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import Transaction from "@/components/MyTracker/Transaction";

export default function History() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>
      <View style={styles.content}>
        <Transaction />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "black",
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
  },
});