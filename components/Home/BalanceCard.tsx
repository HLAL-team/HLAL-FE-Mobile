import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_COLOR } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store'; // Import auth store

export default function BalanceCard() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Get data from the auth store
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const fetchUserProfile = useAuthStore(state => state.fetchUserProfile);

  useEffect(() => {
    // Use store action to fetch user profile
    fetchUserProfile();
  }, []);

  if (loading || !user) {
    return (
      <LinearGradient
        colors={['#22DEB8', PRIMARY_COLOR]}
        style={[styles.card, styles.loadingCard]}
        start={{ x: 0.9, y: 1 }}
        end={{ x: 0, y: 0 }}
      >
        <ActivityIndicator size="small" color="#fff" />
      </LinearGradient>
    );
  }

  // Safely access balance to avoid the toString() error
  const formattedBalance = user.balance !== undefined && user.balance !== null 
    ? user.balance.toLocaleString() 
    : '0';

  return (
    <LinearGradient
      colors={['#22DEB8', PRIMARY_COLOR]}
      style={styles.card}
      start={{ x: 0.9, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{user?.fullname || 'Guest'}</Text>
          <Text style={styles.account}>
            {isVisible ? user?.accountNumber || 'N/A' : '•••• •••• •••'}
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
        <Text style={styles.balance}>
          {isVisible ? `Rp ${formattedBalance}` : 'Rp ••••••••'}
        </Text>
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
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150, // Ensure the card has height while loading
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