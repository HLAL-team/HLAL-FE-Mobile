import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { PRIMARY_COLOR } from "../../constants/colors";
import { useTransactionStore, useAuthStore } from "@/store"; // Import both stores

export default function RecentTransactionList() {
  // Get transactions data and actions from the transaction store
  const recentTransactions = useTransactionStore(state => state.recentTransactions);
  const loadingTransactions = useTransactionStore(state => state.loadingTransactions);
  const fetchRecentTransactions = useTransactionStore(state => state.fetchRecentTransactions);
  
  // Get user data from auth store to check if transfers are incoming or outgoing
  const user = useAuthStore(state => state.user);
  const loadingUser = useAuthStore(state => state.loading);

  useEffect(() => {
    // Fetch transactions when component mounts
    fetchRecentTransactions();
    // No need to handle token, errors or loading states - the store does it for us!
  }, []);

  if (loadingTransactions || loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recent transactions found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.transactionId.toString()}
        renderItem={({ item }) => {
          let label = "";
          let amountColor = "green";
          let amountPrefix = "+";

          if (item.transactionType === "Transfer") {
            // Check if this is an incoming transfer (recipient matches the user's fullname)
            const isIncomingTransfer = user?.fullname && 
                                      item.recipient.toLowerCase() === user.fullname.toLowerCase();
            
            if (isIncomingTransfer) {
              // Incoming transfer (money received) - GREEN
              label = `From: ${item.sender}`;
              amountColor = "green";
              amountPrefix = "+";
            } else {
              // Outgoing transfer (money sent) - RED
              label = `To: ${item.recipient}`;
              amountColor = "red";
              amountPrefix = "-";
            }
          } else if (item.transactionType === "Top Up") {
            // Top-up always adds money - GREEN
            label = "Top up";
            amountColor = "green";
            amountPrefix = "+";
          } else {
            // Other transaction types
            label = item.transactionType;
            // Default to green/+ for other types (can be customized as needed)
          }

          return (
            <View style={styles.transaction}>
              <View style={styles.textContainer}>
                <Text style={styles.name}>{label}</Text>
                <Text style={styles.time}>{item.transactionDateFormatted}</Text>
              </View>
              <Text style={[styles.amount, { color: amountColor }]}>
                {amountPrefix}Rp {item.amount.toLocaleString("id-ID")}
              </Text>
            </View>
          );
        }}
        scrollEnabled={false} // Disable scrolling since we only show 3 items
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // All your existing styles remain the same
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  list: {
    paddingBottom: 4,
  },
  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
  },
  time: {
    fontSize: 11,
    color: "#888",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});