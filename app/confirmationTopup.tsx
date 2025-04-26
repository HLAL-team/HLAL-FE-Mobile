import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';
import { TOP_UP_TRANSFER_API, TRANSACTION_API } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConfirmationTopUpPage() {
  const router = useRouter();
  const { source, amount, notes } = useLocalSearchParams();
  const selectedNominal = amount ? parseFloat(amount as string) : null;

  const [sourceName, setSourceName] = useState<string | null>(null);
  const [loadingSource, setLoadingSource] = useState(true);

  useEffect(() => {
    const fetchSourceName = async () => {
      try {
        setLoadingSource(true);
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await fetch(`${TRANSACTION_API}/topupmethod`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch top-up methods');
        }

        const json = await response.json();
        const selectedSource = json.data.find((item: { id: number }) => item.id.toString() === source);

        if (selectedSource) {
          setSourceName(selectedSource.name);
        } else {
          setSourceName('Unknown Source');
        }
      } catch (error) {
        console.error('Failed to fetch source name:', error);
      } finally {
        setLoadingSource(false);
      }
    };

    fetchSourceName();
  }, [source]);

  const handleConfirm = async () => {
    if (!selectedNominal || !source) {
      console.error('Please fill all fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const payload = {
        recipientWalletId: null, // Assuming no recipient wallet is needed for top-up
        transactionTypeId: 1, // Fixed value for top-up
        topUpMethodId: parseInt(source as string, 10), // Use the selected source ID
        amount: selectedNominal,
        description: notes || 'Topup', // Use notes if provided, otherwise default to "Topup"
      };

      const response = await fetch(TOP_UP_TRANSFER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Failed to process top-up');
      }

      const responseData = await response.json();

      // Navigate to the invoice page with the required information
      router.push({
        pathname: '/topupInvoice',
        params: {
          sourceName,
          amount: responseData.data.amount.toString(),
          notes: responseData.data.description,
          transactionDateFormatted: responseData.data.transactionDateFormatted,
        },
      });
    } catch (error) {
      console.error('Top-up failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Confirm Top Up</Text>
        
        <View style={styles.detailBox}>
          <Text style={styles.label}>Source</Text>
          {loadingSource ? (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          ) : (
            <Text style={styles.value}>{sourceName || '-'}</Text>
          )}

          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>Rp {selectedNominal?.toLocaleString() || '-'}</Text>

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