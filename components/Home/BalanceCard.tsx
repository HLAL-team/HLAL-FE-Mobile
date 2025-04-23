import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_COLOR } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function BalanceCard() {
  const [isVisible, setIsVisible] = useState(false);

  const fullName = 'John Doe';
  const accountNumber = '7060 4487 1';
  const balance = 'Rp 1.500.000';

  return (
    <LinearGradient
      colors={['#22DEB8', PRIMARY_COLOR]}
      style={styles.card}
      start={{ x: 0.9, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.account}>
            {isVisible ? accountNumber : '•••• •••• •••'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
          <Ionicons
            name={isVisible ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.label}>Your Balance</Text>
        <Text style={styles.balance}>{isVisible ? balance : 'Rp ••••••••'}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 14,
    color: '#fff',
  },
  account: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    color: '#eee',
  },
  balance: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
});
