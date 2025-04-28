import React, {
  useState,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BarChart } from "react-native-gifted-charts";
import { PRIMARY_COLOR } from "@/constants/colors";
import { TRANSACTION_API } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define Transaction interface with the new fields needed for transfer logic
interface Transaction {
  transactionDate: string;
  transactionType: string;
  amount: number;
  sender?: string;
  recipient?: string;
}

// Define a ref type for the chart for refresh functionality
export interface ChartRefType {
  refresh: () => Promise<void>;
}

// Define props interface
interface ChartProps {
  userFullname?: string;
}

const FinancialChart = forwardRef<ChartRefType, ChartProps>(
  ({ userFullname = "" }, ref) => {
    // State management
    const [selectedType, setSelectedType] = useState<
      "daily" | "weekly" | "monthly" | "quarterly"
    >("monthly");
    const [week, setWeek] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalIncome, setTotalIncome] = useState<number>(0);
    const [totalOutcome, setTotalOutcome] = useState<number>(0);

    // Initialize date filters
    useEffect(() => {
      const today = new Date();
      // Cap week at 4 to match our logic
      const weekNumber = Math.min(4, Math.ceil(today.getDate() / 7));
      setWeek(weekNumber.toString());
      setMonth((today.getMonth() + 1).toString());
      setYear(today.getFullYear().toString());
    }, []);

    // Format number as Rupiah with periods as thousand separators
    const formatRupiah = (number: number) => {
      // Convert to string and remove decimal part
      const parts = number.toString().split(".");
      const integerPart = parts[0];

      // Add thousand separators
      const formattedNumber = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      // Add Rp prefix
      return `Rp${formattedNumber}`;
    };

    // Add this function to calculate totals consistently
    const calculateTotals = (transactions: Transaction[]) => {
      let income = 0;
      let outcome = 0;

      if (
        !transactions ||
        !Array.isArray(transactions) ||
        transactions.length === 0
      ) {
        return { income, outcome };
      }

      transactions.forEach((transaction) => {
        try {
          if (!transaction) return;

          // Parse amount to ensure it's a number
          const amount = parseFloat(transaction.amount as any) || 0;

          // Use the same logic as in our aggregation functions
          if (transaction.transactionType === "Transfer") {
            // Check if this is an incoming transfer (money received)
            const isIncomingTransfer =
              userFullname &&
              transaction.recipient &&
              transaction.recipient.toLowerCase() ===
                userFullname.toLowerCase();

            if (isIncomingTransfer) {
              // Incoming transfer - count as income
              income += amount;
            } else {
              // Outgoing transfer - count as outcome
              outcome += amount;
            }
          } else if (transaction.transactionType === "Top Up") {
            // Top Up is always income
            income += amount;
          } else {
            // All other transaction types count as outcome
            outcome += amount;
          }
        } catch (error) {
          console.error("Error processing transaction for totals:", error);
        }
      });

      return { income, outcome };
    };

    // Extract fetch logic to a separate function for reuse
    const fetchTransactions = async () => {
      // Skip if we don't have all required parameters
      if (
        !year ||
        (selectedType === "daily" && (!week || !month)) ||
        ((selectedType === "weekly" || selectedType === "monthly") && !month)
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      let url = "";

      try {
        // Build URL based on selected type
        if (selectedType === "daily") {
          url = `${TRANSACTION_API}/range?type=daily&year=${Number(
            year
          )}&month=${Number(month)}&week=${Number(week)}`;
        } else if (selectedType === "weekly") {
          url = `${TRANSACTION_API}/range?type=weekly&year=${Number(
            year
          )}&month=${Number(month)}`;
        } else if (selectedType === "monthly") {
          url = `${TRANSACTION_API}/range?type=monthly&year=${Number(
            year
          )}&month=${Number(month)}`;
        } else if (selectedType === "quarterly") {
          url = `${TRANSACTION_API}/range?year=${Number(year)}&type=quarterly`;
        }

        console.log("Fetching API URL:", url);

        // Get authentication token
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication required. Please log in again.");
        }

        // Fetch data with authentication header
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Special handling for 404 - treat as "no data" instead of error
        if (response.status === 404) {
          console.log("No transaction data available for the selected period");
          setTransactions([]);
          setTotalIncome(0);
          setTotalOutcome(0);
          return;
        }

        // Check if response is OK
        if (response.status === 403) {
          throw new Error("Access denied. You may need to log in again.");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();

        if (!text || text.trim() === "") {
          console.log("Empty response received, treating as no data");
          setTransactions([]);
          setTotalIncome(0);
          setTotalOutcome(0);
          return;
        }

        try {
          const json = JSON.parse(text);
          console.log("API response parsed successfully");

          if (!json.data) {
            console.log("No data property in response");
            setTransactions([]);
            setTotalIncome(0);
            setTotalOutcome(0);
            return;
          }

          // Store the transactions
          setTransactions(json.data);

          // Calculate totals using our consistent logic
          const { income, outcome } = calculateTotals(json.data);
          setTotalIncome(income);
          setTotalOutcome(outcome);

          // Log for debugging
          console.log(
            `Calculated totals: Income=${income}, Outcome=${outcome}`
          );
          console.log(
            `API totals: Income=${json.totalIncome || 0}, Outcome=${
              json.totalOutcome || 0
            }`
          );
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          setTransactions([]);
          setTotalIncome(0);
          setTotalOutcome(0);
        }
      } catch (error) {
        console.error("Error in fetch operation:", error);
        setError(`Failed to load data: ${error.message}`);
        setTransactions([]);
        setTotalIncome(0);
        setTotalOutcome(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Expose the refresh method via ref
    useImperativeHandle(ref, () => ({
      refresh: async () => {
        console.log("Chart refresh called");
        await fetchTransactions();
        return;
      },
    }));

    // Fetch transactions from API when filters change
    useEffect(() => {
      fetchTransactions();
    }, [selectedType, year, month, week]);

    // Filter UI rendering
    const renderFilters = () => {
      const years = Array.from({ length: 5 }, (_, i) =>
        (new Date().getFullYear() - i).toString()
      );
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const months = monthNames.map((name, index) => ({
        label: name,
        value: (index + 1).toString(),
      }));
      const weeks = ["1", "2", "3", "4"];

      return (
        <View style={styles.filterContainer}>
          {selectedType === "daily" && (
            <>
              <Picker
                selectedValue={week}
                style={styles.filterDropdown}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setWeek(itemValue)}
              >
                {weeks.map((w) => (
                  <Picker.Item key={w} label={`Week ${w}`} value={w} />
                ))}
              </Picker>
              <Picker
                selectedValue={month}
                style={styles.filterDropdown}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setMonth(itemValue)}
              >
                {months.map((m) => (
                  <Picker.Item key={m.value} label={m.label} value={m.value} />
                ))}
              </Picker>
              <Picker
                selectedValue={year}
                style={styles.filterDropdown}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setYear(itemValue)}
              >
                {years.map((y) => (
                  <Picker.Item key={y} label={y} value={y} />
                ))}
              </Picker>
            </>
          )}
          {selectedType === "weekly" && (
            <>
              <Picker
                selectedValue={month}
                style={styles.filterDropdown}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setMonth(itemValue)}
              >
                {months.map((m) => (
                  <Picker.Item key={m.value} label={m.label} value={m.value} />
                ))}
              </Picker>
              <Picker
                selectedValue={year}
                style={styles.filterDropdown}
                itemStyle={styles.pickerItem}
                onValueChange={(itemValue) => setYear(itemValue)}
              >
                {years.map((y) => (
                  <Picker.Item key={y} label={y} value={y} />
                ))}
              </Picker>
            </>
          )}
          {(selectedType === "monthly" || selectedType === "quarterly") && (
            <Picker
              selectedValue={year}
              style={styles.filterDropdown}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) => setYear(itemValue)}
            >
              {years.map((y) => (
                <Picker.Item key={y} label={y} value={y} />
              ))}
            </Picker>
          )}
        </View>
      );
    };

    // Tab UI rendering
    const renderTabs = () => (
      <View style={styles.tabContainer}>
        {["weekly", "monthly", "quarterly"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type as any)}
          >
            <Text
              style={[styles.tab, selectedType === type && styles.activeTab]}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    // Updated aggregateByDay function that handles transfer logic
    const aggregateByDay = (transactions: Transaction[]) => {
      console.log(
        "Starting daily aggregation with transactions:",
        transactions?.length
      );

      // Get the days in the selected week
      const selectedMonthNum = parseInt(month);
      const selectedYearNum = parseInt(year);
      const selectedWeekNum = parseInt(week);

      console.log(
        `Selected period: Year ${selectedYearNum}, Month ${selectedMonthNum}, Week ${selectedWeekNum}`
      );

      let firstDayOfWeek: number;
      let lastDayOfWeek: number;

      // Calculate days in month
      const daysInMonth = new Date(
        selectedYearNum,
        selectedMonthNum,
        0
      ).getDate();

      console.log(`Days in month: ${daysInMonth}`);

      // Set date range based on selected week
      switch (selectedWeekNum) {
        case 1:
          firstDayOfWeek = 1;
          lastDayOfWeek = 7;
          break;
        case 2:
          firstDayOfWeek = 8;
          lastDayOfWeek = 14;
          break;
        case 3:
          firstDayOfWeek = 15;
          lastDayOfWeek = 21;
          break;
        case 4:
          firstDayOfWeek = 22;
          lastDayOfWeek = daysInMonth; // All remaining days in the month
          break;
        default:
          // Default to the current week if somehow we got an invalid week number
          const today = new Date();
          const todayDate = today.getDate();
          const weekOfToday = Math.min(4, Math.ceil(todayDate / 7));

          if (weekOfToday === 1) {
            firstDayOfWeek = 1;
            lastDayOfWeek = 7;
          } else if (weekOfToday === 2) {
            firstDayOfWeek = 8;
            lastDayOfWeek = 14;
          } else if (weekOfToday === 3) {
            firstDayOfWeek = 15;
            lastDayOfWeek = 21;
          } else {
            firstDayOfWeek = 22;
            lastDayOfWeek = daysInMonth;
          }
      }

      // Make sure the lastDayOfWeek doesn't exceed the days in the month
      lastDayOfWeek = Math.min(lastDayOfWeek, daysInMonth);

      console.log(
        `Date range for weekly view: ${firstDayOfWeek} to ${lastDayOfWeek}`
      );

      // Initialize result with days in the selected week
      const result = {};
      for (let i = firstDayOfWeek; i <= lastDayOfWeek; i++) {
        result[i.toString()] = { income: 0, outcome: 0 };
      }

      console.log(`Initialized days for result:`, Object.keys(result));

      // If no transactions, return the empty structure
      if (
        !transactions ||
        !Array.isArray(transactions) ||
        transactions.length === 0
      ) {
        console.log("No transactions to process");
        return result;
      }

      // Count how many transactions we process vs skip
      let processedCount = 0;
      let skippedCount = 0;
      let invalidDateCount = 0;
      let dayOutOfRangeCount = 0;

      // Process each transaction
      transactions.forEach((transaction, index) => {
        try {
          if (!transaction || !transaction.transactionDate) {
            console.log(`[${index}] Invalid transaction data:`, transaction);
            skippedCount++;
            return;
          }

          const date = new Date(transaction.transactionDate);

          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.log(
              `[${index}] Invalid date:`,
              transaction.transactionDate
            );
            invalidDateCount++;
            return;
          }

          // Get day of month
          const day = date.getDate().toString();
          const transactionMonth = date.getMonth() + 1; // JavaScript months are 0-indexed
          const transactionYear = date.getFullYear();

          // Only include transactions from the selected month and year
          if (
            transactionMonth !== selectedMonthNum ||
            transactionYear !== selectedYearNum
          ) {
            console.log(
              `[${index}] Transaction from different month/year: ${transactionMonth}/${transactionYear} (expected ${selectedMonthNum}/${selectedYearNum})`
            );
            skippedCount++;
            return;
          }

          // Skip if the day is not in our result object (not in selected week)
          if (!result[day]) {
            console.log(
              `[${index}] Transaction on day ${day} outside selected week range (${firstDayOfWeek}-${lastDayOfWeek})`
            );
            dayOutOfRangeCount++;
            return;
          }

          // Parse amount to ensure it's a number
          const amount = parseFloat(transaction.amount as any) || 0;

          console.log(
            `[${index}] Processing transaction: Day=${day}, Type=${transaction.transactionType}, Amount=${amount}`
          );

          // Updated logic for transfer handling
          if (transaction.transactionType === "Transfer") {
            // Check if this is an incoming transfer (money received)
            const isIncomingTransfer =
              userFullname &&
              transaction.recipient &&
              transaction.recipient.toLowerCase() ===
                userFullname.toLowerCase();

            if (isIncomingTransfer) {
              // Incoming transfer - count as income
              result[day].income += amount;
              console.log(
                `[${index}] Added ${amount} to income for day ${day} (incoming transfer)`
              );
            } else {
              // Outgoing transfer - count as outcome
              result[day].outcome += amount;
              console.log(
                `[${index}] Added ${amount} to outcome for day ${day} (outgoing transfer)`
              );
            }
          } else if (transaction.transactionType === "Top Up") {
            // Top Up is always income
            result[day].income += amount;
            console.log(
              `[${index}] Added ${amount} to income for day ${day} (top up)`
            );
          } else {
            // All other transaction types count as outcome
            result[day].outcome += amount;
            console.log(
              `[${index}] Added ${amount} to outcome for day ${day} (${transaction.transactionType})`
            );
          }

          processedCount++;
        } catch (error) {
          console.error(
            `[${index}] Error processing daily transaction:`,
            error,
            transaction
          );
          skippedCount++;
        }
      });

      console.log(
        `Aggregation complete. Processed: ${processedCount}, Skipped: ${skippedCount} (Invalid dates: ${invalidDateCount}, Day out of range: ${dayOutOfRangeCount})`
      );
      console.log("Final aggregated data:", result);

      return result;
    };

    // Updated aggregateByWeek function with transfer logic
    const aggregateByWeek = (transactions: Transaction[]) => {
      // Initialize result with all weeks
      const result = {
        "Week 1": { income: 0, outcome: 0 },
        "Week 2": { income: 0, outcome: 0 },
        "Week 3": { income: 0, outcome: 0 },
        "Week 4": { income: 0, outcome: 0 },
      };

      if (
        !transactions ||
        !Array.isArray(transactions) ||
        transactions.length === 0
      ) {
        return result;
      }

      transactions.forEach((transaction) => {
        try {
          if (!transaction || !transaction.transactionDate) {
            console.log("Invalid transaction data:", transaction);
            return;
          }

          const date = new Date(transaction.transactionDate);

          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.log("Invalid date:", transaction.transactionDate);
            return;
          }

          const day = date.getDate();
          const weekNumber = Math.min(4, Math.max(1, Math.ceil(day / 7)));
          const weekKey = `Week ${weekNumber}`;

          // Safety check for the week key
          if (!result[weekKey]) {
            result[weekKey] = { income: 0, outcome: 0 };
          }

          // Parse amount to ensure it's a number
          const amount = parseFloat(transaction.amount as any) || 0;

          // Updated logic for transfer handling
          if (transaction.transactionType === "Transfer") {
            // Check if this is an incoming transfer (money received)
            const isIncomingTransfer =
              userFullname &&
              transaction.recipient &&
              transaction.recipient.toLowerCase() ===
                userFullname.toLowerCase();

            if (isIncomingTransfer) {
              // Incoming transfer - count as income
              result[weekKey].income += amount;
            } else {
              // Outgoing transfer - count as outcome
              result[weekKey].outcome += amount;
            }
          } else if (transaction.transactionType === "Top Up") {
            // Top Up is always income
            result[weekKey].income += amount;
          } else {
            // All other transaction types count as outcome
            result[weekKey].outcome += amount;
          }
        } catch (error) {
          console.error(
            "Error processing weekly transaction:",
            error,
            transaction
          );
        }
      });

      return result;
    };

    // Updated aggregateByMonth function with transfer logic
    const aggregateByMonth = (transactions: Transaction[]) => {
      // Month names for labels
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Initialize result with all months
      const result = {};
      for (let i = 0; i < 12; i++) {
        result[monthNames[i]] = { income: 0, outcome: 0 };
      }

      if (
        !transactions ||
        !Array.isArray(transactions) ||
        transactions.length === 0
      ) {
        return result;
      }

      transactions.forEach((transaction) => {
        try {
          if (!transaction || !transaction.transactionDate) {
            console.log("Invalid transaction data:", transaction);
            return;
          }

          const date = new Date(transaction.transactionDate);

          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.log("Invalid date:", transaction.transactionDate);
            return;
          }

          const monthIndex = date.getMonth();
          if (monthIndex < 0 || monthIndex >= 12) {
            console.log("Invalid month index:", monthIndex);
            return;
          }

          const monthName = monthNames[monthIndex];

          // Safety check for month key
          if (!result[monthName]) {
            result[monthName] = { income: 0, outcome: 0 };
          }

          // Parse amount to ensure it's a number
          const amount = parseFloat(transaction.amount as any) || 0;

          // Updated logic for transfer handling
          if (transaction.transactionType === "Transfer") {
            // Check if this is an incoming transfer (money received)
            const isIncomingTransfer =
              userFullname &&
              transaction.recipient &&
              transaction.recipient.toLowerCase() ===
                userFullname.toLowerCase();

            if (isIncomingTransfer) {
              // Incoming transfer - count as income
              result[monthName].income += amount;
            } else {
              // Outgoing transfer - count as outcome
              result[monthName].outcome += amount;
            }
          } else if (transaction.transactionType === "Top Up") {
            // Top Up is always income
            result[monthName].income += amount;
          } else {
            // All other transaction types count as outcome
            result[monthName].outcome += amount;
          }
        } catch (error) {
          console.error(
            "Error processing monthly transaction:",
            error,
            transaction
          );
        }
      });

      return result;
    };

    // Updated aggregateByQuarter function with transfer logic
    const aggregateByQuarter = (transactions: Transaction[]) => {
      // Initialize result with all quarters
      const result = {
        Q1: { income: 0, outcome: 0 },
        Q2: { income: 0, outcome: 0 },
        Q3: { income: 0, outcome: 0 },
        Q4: { income: 0, outcome: 0 },
      };

      if (
        !transactions ||
        !Array.isArray(transactions) ||
        transactions.length === 0
      ) {
        return result;
      }

      transactions.forEach((transaction) => {
        try {
          if (!transaction || !transaction.transactionDate) {
            console.log("Invalid transaction data:", transaction);
            return;
          }

          const date = new Date(transaction.transactionDate);

          // Check if date is valid
          if (isNaN(date.getTime())) {
            console.log("Invalid date:", transaction.transactionDate);
            return;
          }

          const month = date.getMonth();
          let quarter: string;

          // Determine quarter based on month (0-indexed)
          if (month >= 0 && month <= 2) {
            quarter = "Q1";
          } else if (month >= 3 && month <= 5) {
            quarter = "Q2";
          } else if (month >= 6 && month <= 8) {
            quarter = "Q3";
          } else {
            quarter = "Q4";
          }

          // Safety check for quarter key
          if (!result[quarter]) {
            result[quarter] = { income: 0, outcome: 0 };
          }

          // Parse amount to ensure it's a number
          const amount = parseFloat(transaction.amount as any) || 0;

          // Updated logic for transfer handling
          if (transaction.transactionType === "Transfer") {
            // Check if this is an incoming transfer (money received)
            const isIncomingTransfer =
              userFullname &&
              transaction.recipient &&
              transaction.recipient.toLowerCase() ===
                userFullname.toLowerCase();

            if (isIncomingTransfer) {
              // Incoming transfer - count as income
              result[quarter].income += amount;
            } else {
              // Outgoing transfer - count as outcome
              result[quarter].outcome += amount;
            }
          } else if (transaction.transactionType === "Top Up") {
            // Top Up is always income
            result[quarter].income += amount;
          } else {
            // All other transaction types count as outcome
            result[quarter].outcome += amount;
          }
        } catch (error) {
          console.error(
            "Error processing quarterly transaction:",
            error,
            transaction
          );
        }
      });

      return result;
    };

    // Aggregate data based on selected type
    const aggregatedData = useMemo(() => {
      if (!transactions || transactions.length === 0) {
        return selectedType === "daily"
          ? aggregateByDay([])
          : selectedType === "weekly"
          ? aggregateByWeek([])
          : selectedType === "monthly"
          ? aggregateByMonth([])
          : aggregateByQuarter([]);
      }

      try {
        if (selectedType === "daily") {
          return aggregateByDay(transactions);
        } else if (selectedType === "weekly") {
          return aggregateByWeek(transactions);
        } else if (selectedType === "monthly") {
          return aggregateByMonth(transactions);
        } else if (selectedType === "quarterly") {
          return aggregateByQuarter(transactions);
        }
        return {};
      } catch (error) {
        console.error("Error in data aggregation:", error);
        return {};
      }
    }, [transactions, selectedType, week, month, year, userFullname]); // Added userFullname as dependency

    // Prepare chart data
    const chartData = useMemo(() => {
      try {
        const barData = [];
        let maxValue = 0;

        if (!aggregatedData || typeof aggregatedData !== "object") {
          return {
            barData: [],
            maxValue: 10000,
            hasData: false,
            yAxisLabels: Array(5)
              .fill(0)
              .map((_, i) => formatRupiah(i * 2500)),
          };
        }

        // For daily view, need to sort the keys numerically
        const keys = Object.keys(aggregatedData);
        if (selectedType === "daily") {
          keys.sort((a, b) => parseInt(a) - parseInt(b));
        }

        keys.forEach((key) => {
          const dataPoint = aggregatedData[key];
          if (!dataPoint) return;

          const income = parseFloat(dataPoint.income) || 0;
          const outcome = parseFloat(dataPoint.outcome) || 0;

          maxValue = Math.max(maxValue, income, outcome);

          // For daily view, append a day prefix to the label
          const label = selectedType === "daily" ? `Day ${key}` : key;

          barData.push(
            {
              value: income,
              label: label,
              frontColor: "#8AFFC1", // Green for income
              labelTextStyle: { color: "white", fontSize: 9 },
              spacing: 2,
              labelWidth: 25,
            },
            {
              value: outcome,
              frontColor: "#FFD580", // Orange for expenses
            }
          );
        });

        // Ensure max value is at least 10,000 and rounded up
        const roundedMaxValue =
          maxValue === 0 ? 10000 : Math.ceil(maxValue / 10000) * 10000;

        // Create formatted y-axis labels
        const sections = 4;
        const yAxisLabels = Array.from({ length: sections + 1 }, (_, i) => {
          const value = (i * roundedMaxValue) / sections;
          return formatRupiah(value);
        });

        return {
          barData,
          maxValue: roundedMaxValue,
          hasData: barData.length > 0 && maxValue > 0,
          yAxisLabels,
        };
      } catch (error) {
        console.error("Error preparing chart data:", error);
        return {
          barData: [],
          maxValue: 10000,
          hasData: false,
          yAxisLabels: Array(5)
            .fill(0)
            .map((_, i) => formatRupiah(i * 2500)),
        };
      }
    }, [aggregatedData, selectedType]);

    // Format currency function
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Main component render
    return (
      <View style={styles.container}>
        {renderTabs()}
        {renderFilters()}

        <View style={styles.chartContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading data...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : chartData.hasData ? (
            <BarChart
              data={chartData.barData}
              barWidth={
                selectedType === "quarterly"
                  ? 20
                  : selectedType === "weekly"
                  ? 16
                  : 8 // default for daily and monthly
              }
              spacing={
                selectedType === "daily"
                  ? 20
                  : selectedType === "quarterly"
                  ? 40
                  : selectedType === "weekly"
                  ? 30
                  : chartData.barData.length <= 2
                  ? 40
                  : 24
              }
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={1}
              yAxisColor="white"
              yAxisTextStyle={{ color: "white", fontSize: 7 }}
              noOfSections={4}
              maxValue={chartData.maxValue}
              initialSpacing={10}
              yAxisLabelTexts={chartData.yAxisLabels}
              lineConfig={{
                color: "#F29C6E",
                thickness: 3,
                curved: true,
                hideDataPoints: true,
                shiftY: 100,
                initialSpacing: 10,
              }}
              xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center" }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                No transaction data available
              </Text>
            </View>
          )}
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#8AFFC1" }]}
            />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#FFD580" }]}
            />
            <Text style={styles.legendText}>Expense</Text>
          </View>
        </View>

        {/* Total Income & Outcome Cards */}
        <View style={styles.totalsContainer}>
          <View
            style={[
              styles.totalCard,
              { borderLeftColor: "#8AFFC1", borderLeftWidth: 4 },
            ]}
          >
            <Text style={styles.totalLabel}>Total Income</Text>
            <Text style={[styles.totalAmount, { color: "#2E9464" }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View
            style={[
              styles.totalCard,
              { borderLeftColor: "#FFD580", borderLeftWidth: 4 },
            ]}
          >
            <Text style={styles.totalLabel}>Total Outcome</Text>
            <Text style={[styles.totalAmount, { color: "#FF8B3D" }]}>
              {formatCurrency(totalOutcome)}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterDropdown: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginHorizontal: 0,
  },
  pickerItem: {
    fontSize: 10, // Smaller font size to prevent truncation
    height: 120, // Adjust height for better visibility
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tab: {
    color: "gray",
    fontWeight: "normal",
    fontSize: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  activeTab: {
    color: "white",
    fontWeight: "bold",
    backgroundColor: PRIMARY_COLOR,
  },
  chartContainer: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
    height: 300,
    justifyContent: "center",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "white",
    textAlign: "center",
  },
  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  // Styles for total cards
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 8,
  },
  totalCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FinancialChart;
