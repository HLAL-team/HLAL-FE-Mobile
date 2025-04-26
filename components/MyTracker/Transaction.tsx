import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { TRANSACTION_API } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRIMARY_COLOR } from "../../constants/colors";

interface Transaction {
  transactionId: number;
  sender: string;
  recipient: string;
  amount: number;
  transactionType: string;
  transactionDateFormatted: string;
}

export default function Transaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(
          `${TRANSACTION_API}?sortBy=transactionDate&order=desc&size=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const json = await response.json();
        setTransactions(json.data || []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transactionId.toString()}
        renderItem={({ item }) => {
          let label = "";
          let amountColor = "green";
          let amountPrefix = "+";

          if (item.transactionType === "Transfer") {
            label = `${item.recipient}`;
            amountColor = "red";
            amountPrefix = "-";
          } else if (item.transactionType === "Top Up") {
            label = "Top up";
            amountColor = "green";
            amountPrefix = "+";
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
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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