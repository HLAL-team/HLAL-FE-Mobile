import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function BalanceCard() {
  const [isVisible, setIsVisible] = useState(false);

  const fullName = 'John Doe';
  const accountNumber = '7060 4487 1';
  const balance = 'Rp 1.500.000';

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <LinearGradient
      colors={['#22DEB8', PRIMARY_COLOR]}
      style={styles.card}
      start={{ x: 0.9, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <View style={styles.topSection}>
        <View>
          <Text style={styles.fullName}>{fullName}</Text>
          <Text style={styles.accountNumber}>
            {isVisible ? accountNumber : '•••• •••• •••'}
          </Text>
        </View>
        <TouchableOpacity onPress={toggleVisibility}>
          <Ionicons
            name={isVisible ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balance}>
          {isVisible ? balance : 'Rp ••••••••'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  topSection: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullName: {
    fontSize: 14,
    color: '#fff',
  },
  accountNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  bottomSection: {},
  balanceLabel: {
    fontSize: 14,
    color: '#eee',
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
});
