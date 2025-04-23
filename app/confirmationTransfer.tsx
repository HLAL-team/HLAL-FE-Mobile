// app/confirmationTransfer.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';

export default function ConfirmationTransferPage() {
  const router = useRouter();
  const { recipient, amount, notes } = useLocalSearchParams();

  const handleConfirm = () => {
    if (!recipient || !amount) {
      alert('Missing transfer data');
      return;
    }

    router.push({
      pathname: '/transferInvoice',
      params: {
        recipient,
        amount,
        notes,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Confirm Transfer</Text>

        <View style={styles.detailBox}>
          <Text style={styles.label}>Recipient</Text>
          <Text style={styles.value}>{recipient}</Text>

          <Text style={styles.label}>Transfer Nominal</Text>
          <Text style={styles.value}>Rp {parseFloat(amount as string).toLocaleString()}</Text>

          <Text style={styles.label}>Notes</Text>
          <Text style={styles.value}>{notes || '-'}</Text>
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
    marginTop: 12,
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
