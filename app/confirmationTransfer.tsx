import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';
import { TRANSACTION_API } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConfirmationTransferPage() {
  const router = useRouter();
  const { recipientAccountNumber, amount, notes } = useLocalSearchParams<{
    recipientAccountNumber: string;
    amount: string;
    notes: string;
  }>();

  const handleConfirm = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }
  
      const payload = {
        recipientAccountNumber: parseInt(recipientAccountNumber, 10),
        transactionTypeId: 2, // Fixed value for transfer
        topUpMethodId: null, // Not applicable for transfer
        amount: parseInt(amount, 10),
        description: notes || 'Transfer',
      };
  
      const response = await fetch(`${TRANSACTION_API}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Failed to process transfer');
      }
  
      // Check if the response has a body
      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : null;
  
      // Navigate to the invoice page with the required information
      router.push({
        pathname: '/transferInvoice',
        params: {
          recipient: responseData?.data?.recipient || 'Unknown',
          amount: responseData?.data?.amount?.toString() || '0',
          notes: responseData?.data?.description || 'Transfer',
          transactionDateFormatted: responseData?.data?.transactionDateFormatted || '-',
        },
      });
    } catch (error) {
      console.error('Transfer failed:', error);
      Alert.alert('Error', error.message || 'Failed to process transfer');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Confirm Transfer</Text>

        <View style={styles.detailBox}>
          <Text style={styles.label}>Recipient</Text>
          <Text style={styles.value}>{recipientAccountNumber || '-'}</Text>

          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>Rp {Number(amount || 0).toLocaleString()}</Text>

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