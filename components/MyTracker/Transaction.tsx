import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Platform } from "react-native";
import { TRANSACTION_API } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRIMARY_COLOR } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

interface Transaction {
  transactionId: number;
  sender: string;
  recipient: string;
  amount: number;
  transactionType: string;
  transactionDateFormatted: string;
  transactionDate: string; // "2025-04-27T19:38:58.488799"
}

export default function Transaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState("");
  
  // Date filter states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dateFilterActive, setDateFilterActive] = useState(false);

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

  const filterTransactions = (type: string | null, searchText: string = "", applyDateFilter: boolean = true) => {
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
    
    // Apply date range filter if both dates are available and filter is requested
    if (applyDateFilter && (startDate || endDate)) {
      filtered = filtered.filter(transaction => {
        // Parse the ISO date string from transactionDate
        const transactionDate = new Date(transaction.transactionDate);
        
        // Check if transaction date is after start date (if set)
        if (startDate) {
          // Clone the start date and set time to beginning of day (00:00:00)
          const startOfDay = new Date(startDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          if (transactionDate < startOfDay) {
            return false;
          }
        }
        
        // Check if transaction date is before end date (if set)
        if (endDate) {
          // Clone the end date and set time to end of day (23:59:59)
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          if (transactionDate > endOfDay) {
            return false;
          }
        }
        
        return true;
      });
      
      setDateFilterActive(true);
    } else if (!applyDateFilter) {
      setDateFilterActive(false);
    }
    
    setTransactions(filtered);
  };

  const applySearch = () => {
    filterTransactions(activeFilter, keyword);
  };

  const applyDateFilter = () => {
    filterTransactions(activeFilter, keyword, true);
  };

  const clearFilters = () => {
    setActiveFilter(null);
    setKeyword("");
    clearDateFilter();
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDateFilterActive(false);
    filterTransactions(activeFilter, keyword, false);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is already set, apply filter immediately
      if (endDate) {
        setTimeout(() => {
          filterTransactions(activeFilter, keyword, true);
        }, 300);
      }
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    
    if (selectedDate) {
      setEndDate(selectedDate);
      // If start date is already set, apply filter immediately
      if (startDate) {
        setTimeout(() => {
          filterTransactions(activeFilter, keyword, true);
        }, 300);
      }
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter UI section
  const renderFilterButtons = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Transactions History</Text>
      
      {/* Filter status indicator */}
      {dateFilterActive && (
        <View style={styles.filterStatusContainer}>
          <Text style={styles.filterStatusText}>
            Date Filter: {startDate ? formatDate(startDate) : "Any"} - {endDate ? formatDate(endDate) : "Any"}
          </Text>
          <TouchableOpacity onPress={clearDateFilter} style={styles.clearFilterButton}>
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
      
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
              onPress={() => filterTransactions(activeFilter === "Top Up" ? null : "Top Up", keyword)}
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
              onPress={() => filterTransactions(activeFilter === "Transfer" ? null : "Transfer", keyword)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === "Transfer" && styles.activeFilterButtonText
              ]}>Transfer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setSearchVisible(true)}
            >
              <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
            
            {/* Date Filter Buttons */}
            <View style={styles.dateFiltersContainer}>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  startDate && styles.activeDateButton
                ]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={startDate ? PRIMARY_COLOR : "#666"} 
                  style={styles.dateButtonIcon} 
                />
                <Text style={[
                  styles.dateButtonText,
                  startDate && styles.activeDateButtonText
                ]}>
                  {startDate ? formatDate(startDate) : "Start"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  endDate && styles.activeDateButton
                ]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={endDate ? PRIMARY_COLOR : "#666"} 
                  style={styles.dateButtonIcon} 
                />
                <Text style={[
                  styles.dateButtonText,
                  endDate && styles.activeDateButtonText
                ]}>
                  {endDate ? formatDate(endDate) : "End"}
                </Text>
              </TouchableOpacity>
            </View>
            
            {(activeFilter || dateFilterActive) && (
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
      
      {/* DatePickers */}
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          maximumDate={endDate || undefined}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate || undefined}
        />
      )}
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
            {activeFilter && dateFilterActive
              ? `No ${activeFilter} transactions found in the selected date range.`
              : activeFilter
              ? `No ${activeFilter} transactions found.`
              : dateFilterActive
              ? `No transactions found in the selected date range.`
              : "No transactions found."}
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
        ListHeaderComponent={transactions.length > 0 ? (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        ) : null}
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
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
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
  dateFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeDateButton: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#F0F8FF',
  },
  dateButtonIcon: {
    marginRight: 2,
  },
  dateButtonText: {
    fontSize: 11,
    color: '#666',
  },
  activeDateButtonText: {
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  filterStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F8FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1E5FF',
  },
  filterStatusText: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    flex: 1,
  },
  clearFilterButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearFilterText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 4,
  },
  resultsHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FAFAFA',
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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