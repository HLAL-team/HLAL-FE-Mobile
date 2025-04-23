// app/confirmationTopUp.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';

export default function ConfirmationTopUpPage() {
  const router = useRouter();
  const { source, amount } = useLocalSearchParams();
  const selectedNominal = amount ? parseFloat(amount as string) : null;

  const handleConfirm = () => {
    if (!selectedNominal || !source) {
      alert('Please fill all fields');
      return;
    }

    // Navigate to the topUpInvoice page with source and amount params
    router.push({
      pathname: '/topupInvoice',
      params: {
        source,
        amount: selectedNominal.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Confirm Top Up</Text>
        
        <View style={styles.detailBox}>
          <Text style={styles.label}>Source</Text>
          <Text style={styles.value}>{source || '-'}</Text>

          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>Rp {selectedNominal?.toLocaleString() || '-'}</Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
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
  header: {
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
    marginBottom: 20,
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
  confirmButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
