import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { PRIMARY_COLOR } from '@/constants/colors';
const jsonData = require('./data.json');

const FinancialChart = () => {
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Default to today's parameters
  useEffect(() => {
    const today = new Date();
    setWeek(Math.ceil(today.getDate() / 7).toString());
    setMonth((today.getMonth() + 1).toString());
    setYear(today.getFullYear().toString());
  }, []);

  const renderFilters = () => {
    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const weeks = ['1', '2', '3', '4'];

    return (
      <View style={styles.filterContainer}>
        {selectedType === 'daily' && (
          <>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Week</Text>
              <TextInput
                style={styles.filterInput}
                value={week}
                onChangeText={setWeek}
                placeholder="Week"
              />
            </View>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Month</Text>
              <TextInput
                style={styles.filterInput}
                value={month}
                onChangeText={setMonth}
                placeholder="Month"
              />
            </View>
          </>
        )}
        {(selectedType === 'daily' || selectedType === 'weekly') && (
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Year</Text>
            <TextInput
              style={styles.filterInput}
              value={year}
              onChangeText={setYear}
              placeholder="Year"
            />
          </View>
        )}
        {(selectedType === 'monthly' || selectedType === 'quarterly') && (
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Year</Text>
            <TextInput
              style={styles.filterInput}
              value={year}
              onChangeText={setYear}
              placeholder="Year"
            />
          </View>
        )}
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['daily', 'weekly', 'monthly', 'quarterly'].map((type) => (
        <TouchableOpacity key={type} onPress={() => setSelectedType(type as any)}>
          <Text
            style={[
              styles.tab,
              selectedType === type && styles.activeTab,
            ]}
          >
            {type.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const transactions = jsonData.data;

  const aggregateByDay = (transactions) => {
    const result = {};
    for (let i = 1; i <= 31; i++) {
      result[i.toString()] = { income: 0, outcome: 0 };
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const day = date.getDate().toString();

      if (transaction.transactionType === 'Top Up') {
        result[day].income += transaction.amount;
      } else {
        result[day].outcome += transaction.amount;
      }
    });

    return result;
  };

  const aggregateByWeek = (transactions) => {
    const result = {
      week1: { income: 0, outcome: 0 },
      week2: { income: 0, outcome: 0 },
      week3: { income: 0, outcome: 0 },
      week4: { income: 0, outcome: 0 },
    };

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const day = date.getDate();
      const weekNumber = Math.ceil(day / 7);

      const weekKey = `week${weekNumber}`;
      if (transaction.transactionType === 'Top Up') {
        result[weekKey].income += transaction.amount;
      } else {
        result[weekKey].outcome += transaction.amount;
      }
    });

    return result;
  };

  const aggregateByMonth = (transactions) => {
    const result = {};
    for (let i = 1; i <= 12; i++) {
      result[i.toString()] = { income: 0, outcome: 0 };
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const month = (date.getMonth() + 1).toString();

      if (transaction.transactionType === 'Top Up') {
        result[month].income += transaction.amount;
      } else {
        result[month].outcome += transaction.amount;
      }
    });

    return result;
  };

  const aggregatedData = useMemo(() => {
    if (selectedType === 'daily') {
      return aggregateByDay(transactions);
    } else if (selectedType === 'weekly') {
      return aggregateByWeek(transactions);
    } else if (selectedType === 'monthly' || selectedType === 'quarterly') {
      return aggregateByMonth(transactions);
    }
    return {};
  }, [transactions, selectedType]);

  const chartData = useMemo(() => {
    const barData = [];
    let maxValue = 0;

    Object.keys(aggregatedData).forEach((key) => {
      const { income, outcome } = aggregatedData[key];
      maxValue = Math.max(maxValue, income, outcome);

      barData.push(
        {
          value: income,
          label: key,
          frontColor: '#8AFFC1',
        },
        {
          value: outcome,
          frontColor: '#FFD580',
        }
      );
    });

    return { barData, maxValue: Math.ceil(maxValue / 10000) * 10000 };
  }, [aggregatedData]);

  return (
    <View>
      {renderTabs()}
      {renderFilters()}
      <View style={{ backgroundColor: PRIMARY_COLOR, borderRadius: 10, padding: 16 }}>
        <BarChart
          data={chartData.barData}
          barWidth={8}
          spacing={chartData.barData.length <= 4 ? 48 : 24}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={1}
          yAxisColor="white"
          yAxisTextStyle={{ color: 'white', fontSize: 10 }}
          noOfSections={4}
          maxValue={chartData.maxValue}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    color: 'white',
    marginBottom: 5,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tab: {
    color: 'gray',
    fontWeight: 'normal',
    fontSize: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  activeTab: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: PRIMARY_COLOR,
  },
});

export default FinancialChart;