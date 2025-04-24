import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { PRIMARY_COLOR } from '@/constants/colors';
const jsonData = require('./data.json');

const FinancialChart = () => {
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');

  function getCustomWeek(date: Date): string {
    const day = date.getDate();

    if (day >= 1 && day <= 7) {
      return 'week1';
    } else if (day >= 8 && day <= 14) {
      return 'week2';
    } else if (day >= 15 && day <= 21) {
      return 'week3';
    } else {
      return 'week4';
    }
  }

  const aggregateByWeek = (transactions: Transaction[]): Record<string, { income: number; outcome: number }> => {
    const result: Record<string, { income: number; outcome: number }> = {
      week1: { income: 0, outcome: 0 },
      week2: { income: 0, outcome: 0 },
      week3: { income: 0, outcome: 0 },
      week4: { income: 0, outcome: 0 },
    };

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const weekNumber = getCustomWeek(date);

      if (transaction.transactionType === 'Top Up') {
        result[weekNumber].income += transaction.amount;
      } else if (['Transfer', 'Payment', 'Withdrawal', 'Bill Payment'].includes(transaction.transactionType)) {
        result[weekNumber].outcome += transaction.amount;
      }
    });

    return result;
  };

  interface Transaction {
    transactionDate: string;
    transactionType: string;
    amount: number;
  }

  interface DailyAggregate {
    [day: string]: { income: number; outcome: number };
  }

  const aggregateByDay = (transactions: Transaction[]): DailyAggregate => {
    const result: DailyAggregate = {};

    for (let i = 1; i <= 31; i++) {
      result[i.toString()] = { income: 0, outcome: 0 };
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const day = date.getDate().toString();

      if (transaction.transactionType === 'Top Up') {
        result[day].income += transaction.amount;
      } else if (transaction.transactionType === 'Transfer') {
        result[day].outcome += transaction.amount;
      }
    });

    return result;
  };

  interface QuarterlyAggregate {
    [quarter: string]: { income: number; outcome: number };
  }

  const aggregateByQuarter = (transactions: Transaction[]): QuarterlyAggregate => {
    const result: QuarterlyAggregate = {
      Q1: { income: 0, outcome: 0 },
      Q2: { income: 0, outcome: 0 },
      Q3: { income: 0, outcome: 0 },
      Q4: { income: 0, outcome: 0 },
    };

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const month = date.getMonth();

      let quarter: keyof QuarterlyAggregate;
      if (month >= 0 && month <= 2) {
        quarter = 'Q1';
      } else if (month >= 3 && month <= 5) {
        quarter = 'Q2';
      } else if (month >= 6 && month <= 8) {
        quarter = 'Q3';
      } else {
        quarter = 'Q4';
      }

      if (transaction.transactionType === 'Top Up') {
        result[quarter].income += transaction.amount;
      } else if (['Transfer', 'Payment', 'Withdrawal', 'Bill Payment'].includes(transaction.transactionType)) {
        result[quarter].outcome += transaction.amount;
      }
    });

    return result;
  };

  interface MonthlyAggregate {
    [month: string]: { income: number; outcome: number };
  }

  const aggregateByMonth = (transactions: Transaction[]): MonthlyAggregate => {
    const result: MonthlyAggregate = {
      '1': { income: 0, outcome: 0 },
      '2': { income: 0, outcome: 0 },
      '3': { income: 0, outcome: 0 },
      '4': { income: 0, outcome: 0 },
      '5': { income: 0, outcome: 0 },
      '6': { income: 0, outcome: 0 },
      '7': { income: 0, outcome: 0 },
      '8': { income: 0, outcome: 0 },
      '9': { income: 0, outcome: 0 },
      '10': { income: 0, outcome: 0 },
      '11': { income: 0, outcome: 0 },
      '12': { income: 0, outcome: 0 },
    };

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const month = (date.getMonth() + 1).toString();

      if (transaction.transactionType === 'Top Up') {
        result[month].income += transaction.amount;
      } else if (['Transfer', 'Payment', 'Withdrawal', 'Bill Payment'].includes(transaction.transactionType)) {
        result[month].outcome += transaction.amount;
      }
    });

    return result;
  };

  const transactions = jsonData.data;

  const weeklyData = aggregateByWeek(transactions);
  const dailyData = aggregateByDay(transactions);
  const quarterlyData = aggregateByQuarter(transactions);
  const monthlyData = aggregateByMonth(transactions);

  const aggregatedData = {
    daily: Object.keys(dailyData).map((day) => ({
      label: day,
      topUp: dailyData[day].income,
      transfer: dailyData[day].outcome,
    })),
    weekly: Object.keys(weeklyData).map((week) => ({
      label: week,
      topUp: weeklyData[week].income,
      transfer: weeklyData[week].outcome,
    })),
    monthly: Object.keys(monthlyData).map((month) => ({
      label: new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'short' }),
      topUp: monthlyData[month].income,
      transfer: monthlyData[month].outcome,
    })),
    quarterly: Object.keys(quarterlyData).map((quarter) => ({
      label: quarter,
      topUp: quarterlyData[quarter].income,
      transfer: quarterlyData[quarter].outcome,
    })),
  };

  console.log('Aggregated Data:', aggregatedData);

  const { barData, maxValue, totalIncome, totalOutcome } = useMemo(() => {
    const currentData = aggregatedData[selectedType];
    let max = 0;
    let incomeSum = 0;
    let outcomeSum = 0;
    const data = [];

    currentData.forEach(({ label, topUp, transfer }) => {
      max = Math.max(max, topUp, transfer);
      incomeSum += topUp;
      outcomeSum += transfer;

      data.push(
        {
          value: topUp,
          label: label,
          spacing: 2,
          labelWidth: currentData.length <= 4 ? 50 : 30,
          labelTextStyle: { color: 'white' },
          frontColor: '#8AFFC1',
        },
        {
          value: transfer,
          frontColor: '#FFD580',
        }
      );
    });

    const paddedMax = Math.ceil(max / 10000) * 10000;
    return { 
      barData: data as { value: number; label?: string; spacing?: number; labelWidth?: number; labelTextStyle?: object; frontColor: string }[], 
      maxValue: paddedMax as number, 
      totalIncome: incomeSum as number, 
      totalOutcome: outcomeSum as number 
    };
  }, [selectedType]);

  const renderTabs = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
      {['daily', 'weekly', 'monthly', 'quarterly'].map((type) => (
        <TouchableOpacity key={type} onPress={() => setSelectedType(type as any)}>
          <Text
            style={{
              color: selectedType === type ? 'white' : 'lightgray',
              fontWeight: selectedType === type ? 'bold' : 'normal',
              fontSize: 12,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 6,
              backgroundColor: selectedType === type ? '#2BB58C' : 'transparent',
            }}
          >
            {type.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSummaryCards = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
      <View
        style={{
          flex: 1,
          marginRight: 8,
          backgroundColor: '#8AFFC1',
          borderRadius: 10,
          padding: 12,
          elevation: 2,
        }}
      >
        <Text style={{ color: '#004D40', fontSize: 14, fontWeight: 'bold' }}>Total Income</Text>
        <Text style={{ color: '#004D40', fontSize: 16, fontWeight: '600' }}>
          Rp {totalIncome.toLocaleString('id-ID')}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          marginLeft: 8,
          backgroundColor: '#FFD580',
          borderRadius: 10,
          padding: 12,
          elevation: 2,
        }}
      >
        <Text style={{ color: '#6A4100', fontSize: 14, fontWeight: 'bold' }}>Total Outcome</Text>
        <Text style={{ color: '#6A4100', fontSize: 16, fontWeight: '600' }}>
          Rp {totalOutcome.toLocaleString('id-ID')}
        </Text>
      </View>
    </View>
  );

  return (
    <View>
      {/* Chart Card */}
      <View style={{ backgroundColor: PRIMARY_COLOR, borderRadius: 10, padding: 16 }}>
        {renderTabs()}
        <BarChart
          data={barData}
          barWidth={8}
          spacing={selectedType === 'daily' || barData.length <= 4 ? 48 : 24}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={1}
          yAxisColor="white"
          yAxisTextStyle={{ color: 'white', fontSize: 10 }}
          noOfSections={4}
          maxValue={maxValue}
        />
      </View>

      {/* Summary Cards */}
      {renderSummaryCards()}
    </View>
  );
};

export default FinancialChart;
