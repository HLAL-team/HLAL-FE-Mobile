import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';
import { EvilIcons } from '@expo/vector-icons';

export default function TransferInvoicePage() {
  const { amount, recipient, notes, transactionDateFormatted } = useLocalSearchParams<{
    amount: string;
    recipient: string;
    notes: string;
    transactionDateFormatted: string;
  }>();

  const handleBackToHome = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ✅ Green checklist icon */}
        <EvilIcons name="check" size={100} color="green" style={styles.icon} />

        <Text style={styles.successText}>Transfer Successful</Text>

        <View style={styles.detailBox}>
          <Text style={styles.label}>Recipient</Text>
          <Text style={styles.value}>{recipient || '-'}</Text>

          <Text style={[styles.label, { marginTop: 20 }]}>Amount</Text>
          <Text style={styles.value}>Rp {Number(amount || 0).toLocaleString()}</Text>

          <Text style={[styles.label, { marginTop: 20 }]}>Notes</Text>
          <Text style={styles.value}>{notes || '-'}</Text>

          <Text style={[styles.label, { marginTop: 20 }]}>Transaction Date</Text>
          <Text style={styles.value}>{transactionDateFormatted || '-'}</Text>
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
  icon: {
    marginBottom: 20,
    paddingBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 30,
  },
  detailBox: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
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