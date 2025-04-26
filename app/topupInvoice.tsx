import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';

export default function TopupInvoicePage() {
  const { sourceName, amount, notes, transactionDateFormatted } = useLocalSearchParams<{
    sourceName: string;
    amount: string;
    notes: string;
    transactionDateFormatted: string;
  }>();

  const handleBackToHome = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.successText}>Top Up Successful</Text>

        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceHeader}>Transaction Details</Text>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Source</Text>
            <Text style={styles.value}>{sourceName || '-'}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>Rp {Number(amount || 0).toLocaleString()}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{notes || '-'}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Transaction Date</Text>
            <Text style={styles.value}>{transactionDateFormatted || '-'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 30,
  },
  invoiceBox: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  invoiceHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 15,
    textAlign: 'center',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});