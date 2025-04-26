import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { TRANSACTION_API } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRIMARY_COLOR } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

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
  const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(`${TRANSACTION_API}?sortBy=transactionDate&order=desc&size=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const json = await response.json();
      const fetchedTransactions = json.data || [];
      setOriginalTransactions(fetchedTransactions);
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filterTransactions = (type: string | null, searchText: string = "") => {
    setActiveFilter(type);
    
    let filtered = [...originalTransactions];
    
    // Apply type filter if selected
    if (type) {
      filtered = filtered.filter(transaction => 
        transaction.transactionType.toLowerCase() === type.toLowerCase()
      );
    }
    
    // Apply search filter if text provided
    if (searchText) {
      filtered = filtered.filter(transaction => 
        transaction.transactionType.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.recipient?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setTransactions(filtered);
  };

  const applySearch = () => {
    filterTransactions(activeFilter, keyword);
  };

  const clearFilters = () => {
    setActiveFilter(null);
    setKeyword("");
    setTransactions(originalTransactions);
  };

  // Filter UI section
  const renderFilterButtons = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Transactions History</Text>
      <View style={styles.filterButtonsContainer}>
        {searchVisible ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={applySearch}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={applySearch}
            >
              <Ionicons name="search" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setSearchVisible(false);
                setKeyword("");
              }}
            >
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[
                styles.filterButton,
                activeFilter === "Top Up" && styles.activeFilterButton
              ]} 
              onPress={() => filterTransactions(activeFilter === "Top Up" ? null : "Top Up")}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === "Top Up" && styles.activeFilterButtonText
              ]}>Top Up</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                activeFilter === "Transfer" && styles.activeFilterButton
              ]} 
              onPress={() => filterTransactions(activeFilter === "Transfer" ? null : "Transfer")}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === "Transfer" && styles.activeFilterButtonText
              ]}>Transfer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                activeFilter === "Bill Payment" && styles.activeFilterButton
              ]} 
              onPress={() => filterTransactions(activeFilter === "Bill Payment" ? null : "Bill Payment")}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === "Bill Payment" && styles.activeFilterButtonText
              ]}>Bills</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setSearchVisible(true)}
            >
              <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
            
            {activeFilter && (
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={clearFilters}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );

  // Content section - will render loading, empty state, or transaction list
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.emptyText}>
            {activeFilter ? `No ${activeFilter} transactions found.` : "No transactions found."}
          </Text>
        </View>
      );
    }

    return (
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
          } else if (item.transactionType === "Payment") {
            label = `Payment: ${item.recipient || "Unknown"}`;
            amountColor = "red";
            amountPrefix = "-";
          } else if (item.transactionType === "Bill Payment") {
            label = `Bill: ${item.recipient || "Unknown"}`;
            amountColor = "red";
            amountPrefix = "-";
          } else if (item.transactionType === "Withdrawal") {
            label = "Withdrawal";
            amountColor = "red";
            amountPrefix = "-";
          } else {
            label = item.transactionType;
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
    );
  };

  return (
    <View style={styles.container}>
      {renderFilterButtons()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap', // This allows buttons to wrap on smaller screens
  },
  filterButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8, // Add some bottom margin for wrapped buttons
  },
  activeFilterButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  iconButton: {
    padding: 6,
    marginRight: 4,
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    padding: 6,
    marginRight: 4,
  },
  closeButton: {
    padding: 6,
  }
});