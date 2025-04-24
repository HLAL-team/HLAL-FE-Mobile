import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { PRIMARY_COLOR } from '@/constants/colors';

const FinancialChart = () => {
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');

  const rawMockData = {
    daily: [
      { label: '1-7', topUp: 20000, transfer: 15000 },
      { label: '8-14', topUp: 40000, transfer: 18000 },
      { label: '15-21', topUp: 30000, transfer: 25000 },
      { label: '22-31', topUp: 45000, transfer: 27000 },
    ],
    weekly: [
      { label: 'W1', topUp: 120000, transfer: 90000 },
      { label: 'W2', topUp: 100000, transfer: 75000 },
      { label: 'W3', topUp: 95000, transfer: 70000 },
      { label: 'W4', topUp: 110000, transfer: 82000 },
    ],
    monthly: [
      { label: 'Jan', topUp: 50000, transfer: 30000 },
      { label: 'Feb', topUp: 75000, transfer: 42000 },
      { label: 'Mar', topUp: 100000, transfer: 50000 },
      { label: 'Apr', topUp: 120000, transfer: 40000 },
      { label: 'May', topUp: 87000, transfer: 55000 },
      { label: 'Jun', topUp: 95000, transfer: 48000 },
      { label: 'Jul', topUp: 110000, transfer: 62000 },
      { label: 'Aug', topUp: 103000, transfer: 57000 },
      { label: 'Sep', topUp: 98000, transfer: 63000 },
      { label: 'Oct', topUp: 102000, transfer: 60000 },
      { label: 'Nov', topUp: 93000, transfer: 47000 },
      { label: 'Dec', topUp: 115000, transfer: 52000 },
    ],
    quarterly: [
      { label: 'Q1', topUp: 225000, transfer: 122000 },
      { label: 'Q2', topUp: 302000, transfer: 143000 },
      { label: 'Q3', topUp: 311000, transfer: 177000 },
      { label: 'Q4', topUp: 310000, transfer: 159000 },
    ],
  };

  const { barData, maxValue, totalIncome, totalOutcome } = useMemo(() => {
    const currentData = rawMockData[selectedType];
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
    return { barData: data, maxValue: paddedMax, totalIncome: incomeSum, totalOutcome: outcomeSum };
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
