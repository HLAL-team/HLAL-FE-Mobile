import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/colors';
import { useAuthStore } from '@/store'; // Import the auth store

export default function Header() {
  // Get user data and loading state from our auth store
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const fetchUserProfile = useAuthStore(state => state.fetchUserProfile);

  useEffect(() => {
    // Fetch user profile when component mounts
    fetchUserProfile();
    
    // No need to handle errors or loading states - the store does it for us!
  }, []);

  if (loading) {
    return <ActivityIndicator size="small" color={PRIMARY_COLOR} />;
  }

  // Handle case when user might be null
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.greeting}>Assalamu'alaikum,</Text>
          <Text style={styles.username}>Guest</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ 
          uri: user.avatarUrl || 
               `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=19918F&color=fff` 
        }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.greeting}>Assalamu'alaikum,</Text>
        <Text style={styles.username}>{user.username || 'Guest'}</Text>
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
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#e0e0e0'
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