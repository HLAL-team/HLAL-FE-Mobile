import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_COLOR } from '@/constants/colors';
import { PROFILE_API } from '@/constants/api';

export default function Header() {
  const [user, setUser] = useState(null);
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
    <View style={styles.container}>
      <Image
        source={{ uri: user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=19918F&color=fff` }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.greeting}>Assalamu’alaikum,</Text>
        <Text style={styles.username}>{user?.username || 'Guest'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});