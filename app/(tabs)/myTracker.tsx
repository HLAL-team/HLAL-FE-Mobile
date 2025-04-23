import { View, Text } from 'react-native'
import React from 'react'

const myTracker = () => {
  return (
    <View>
      <Text>myTracker</Text>
    </View>
  )
}

export default myTracker


// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
// import React, { useState, useEffect } from 'react'
// import { SelectList } from 'react-native-dropdown-select-list'
// import axios from 'axios'
// import { BarChart } from "react-native-chart-kit"
// import { Dimensions } from "react-native"

// interface Transaction {
//   amount: number;
//   transactionDate: string;
//   transactionType: string;
// }

// export default function MyTracker() {
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState<Transaction[]>([]);
//   const [timeRange, setTimeRange] = useState('month');
//   const [year, setYear] = useState('2025');
//   const [month, setMonth] = useState('1');
//   const [quarter, setQuarter] = useState('1');
//   const [week, setWeek] = useState('1');
  
//   const years = [
//     { key: '2023', value: '2023' },
//     { key: '2024', value: '2024' },
//     { key: '2025', value: '2025' },
//   ];

//   const months = Array.from({ length: 12 }, (_, i) => ({
//     key: `${i + 1}`, value: `${i + 1}`
//   }));

//   const quarters = [
//     { key: '1', value: '1' },
//     { key: '2', value: '2' },
//     { key: '3', value: '3' },
//     { key: '4', value: '4' },
//   ];

//   const weeks = [
//     { key: '1', value: '1' },
//     { key: '2', value: '2' },
//     { key: '3', value: '3' },
//     { key: '4', value: '4' },
//   ];

//   const timeRanges = [
//     { key: 'week', value: 'Weekly' },
//     { key: 'month', value: 'Monthly' },
//     { key: 'quarter', value: 'Quarterly' },
//   ];

//   useEffect(() => {
//     fetchData();
//   }, [timeRange, year, month, quarter, week]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       let url = `http://localhost:8080/api/transactions/range?type=${timeRange}&year=${year}`;
      
//       if (timeRange === 'month') {
//         url += `&month=${month}`;
//       } else if (timeRange === 'quarter') {
//         url += `&quarter=${quarter}`;
//       } else if (timeRange === 'week') {
//         url += `&month=${month}&week=${week}`;
//       }
      
//       const response = await axios.get(url);
//       setData(response.data.data);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processChartData = () => {
//     if (!data.length) return null;

//     // Group transactions by day/week/month depending on the selected timeRange
//     const groupedData: Record<string, number> = {};
//     const incomeData: Record<string, number> = {};
//     const outcomeData: Record<string, number> = {};
    
//     data.forEach(transaction => {
//       let groupKey;
//       const amount = transaction.amount;
//       const isIncome = transaction.transactionType === "Top Up";
      
//       if (timeRange === 'week') {
//         // Group by day for weekly view
//         groupKey = new Date(transaction.transactionDate).toLocaleDateString('en-US', { day: 'numeric' });
//       } else if (timeRange === 'month') {
//         // Group by week for monthly view
//         const date = new Date(transaction.transactionDate);
//         const weekNum = Math.ceil(date.getDate() / 7);
//         groupKey = `W${weekNum}`;
//       } else {
//         // Group by month for quarterly view
//         groupKey = new Date(transaction.transactionDate).toLocaleDateString('en-US', { month: 'short' });
//       }
      
//       if (!incomeData[groupKey]) incomeData[groupKey] = 0;
//       if (!outcomeData[groupKey]) outcomeData[groupKey] = 0;
      
//       if (isIncome) {
//         incomeData[groupKey] += amount;
//       } else {
//         outcomeData[groupKey] += amount;
//       }
//     });
    
//     const labels = Object.keys(isTimeRangeWeek() ? incomeData : outcomeData);
    
//     return {
//       labels,
//       datasets: [
//         {
//           data: labels.map(label => incomeData[label] || 0),
//           color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
//           label: 'Income'
//         },
//         {
//           data: labels.map(label => outcomeData[label] || 0),
//           color: (opacity = 1) => `rgba(255, 26, 26, ${opacity})`,
//           label: 'Outcome'
//         }
//       ],
//       legend: ['Income', 'Outcome']
//     };
//   };

//   const isTimeRangeWeek = () => timeRange === 'week';
//   const isTimeRangeMonth = () => timeRange === 'month';
//   const isTimeRangeQuarter = () => timeRange === 'quarter';

//   const chartData = processChartData();

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>Transaction Tracker</Text>
      
//       <View style={styles.filterContainer}>
//         <Text style={styles.label}>Time Range</Text>
//         <SelectList
//           setSelected={setTimeRange}
//           data={timeRanges}
//           defaultOption={{ key: 'month', value: 'Monthly' }}
//           save="key"
//           boxStyles={styles.dropdown}
//         />
        
//         <Text style={styles.label}>Year</Text>
//         <SelectList
//           setSelected={setYear}
//           data={years}
//           defaultOption={{ key: '2025', value: '2025' }}
//           save="key"
//           boxStyles={styles.dropdown}
//         />
        
//         {isTimeRangeQuarter() && (
//           <>
//             <Text style={styles.label}>Quarter</Text>
//             <SelectList
//               setSelected={setQuarter}
//               data={quarters}
//               defaultOption={{ key: '1', value: '1' }}
//               save="key"
//               boxStyles={styles.dropdown}
//             />
//           </>
//         )}
        
//         {(isTimeRangeMonth() || isTimeRangeWeek()) && (
//           <>
//             <Text style={styles.label}>Month</Text>
//             <SelectList
//               setSelected={setMonth}
//               data={months}
//               defaultOption={{ key: '1', value: '1' }}
//               save="key"
//               boxStyles={styles.dropdown}
//             />
//           </>
//         )}
        
//         {isTimeRangeWeek() && (
//           <>
//             <Text style={styles.label}>Week</Text>
//             <SelectList
//               setSelected={setWeek}
//               data={weeks}
//               defaultOption={{ key: '1', value: '1' }}
//               save="key"
//               boxStyles={styles.dropdown}
//             />
//           </>
//         )}
//       </View>
      
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
//       ) : chartData ? (
//         <View style={styles.chartContainer}>
//           <Text style={styles.chartTitle}>
//             {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Weekly' : 'Monthly'} Transactions
//           </Text>
//           <BarChart
//             data={chartData}
//             width={Dimensions.get("window").width - 32}
//             height={220}
//             yAxisLabel="$"
//             yAxisSuffix=""
//             chartConfig={{
//               backgroundColor: "#ffffff",
//               backgroundGradientFrom: "#ffffff",
//               backgroundGradientTo: "#ffffff",
//               decimalPlaces: 0,
//               color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//               labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//               style: {
//                 borderRadius: 16
//               },
//               barPercentage: 0.6,
//             }}
//             style={styles.chart}
//             verticalLabelRotation={30}
//           />
//         </View>
//       ) : (
//         <Text style={styles.noData}>No data available</Text>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   filterContainer: {
//     marginBottom: 20,
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 8,
//     marginTop: 12,
//   },
//   dropdown: {
//     borderColor: '#ddd',
//     marginBottom: 5,
//   },
//   chartContainer: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     alignItems: 'center',
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16,
//   },
//   noData: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   loader: {
//     marginTop: 40,
//   }
// });