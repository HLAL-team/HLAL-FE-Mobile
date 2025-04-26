import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIMARY_COLOR } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROFILE_API } from '@/constants/api';

interface User {
  fullname: string;
  accountNumber: string;
  balance: number;
}

export default function BalanceCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await fetch(PROFILE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const json = await response.json();
        // Update to match the API response structure
        setUser(json);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <ActivityIndicator size="small" color={PRIMARY_COLOR} />;
  }

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
          {isVisible ? `Rp ${user?.balance?.toLocaleString() || '0'}` : 'Rp ••••••••'}
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