import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/colors';

// Mock fallback user data
const fallbackUser = {
  full_name: 'John Doe',
  image_url: 'https://example.com/image.jpg',
};

export default function Header() {
  const [user, setUser] = useState(fallbackUser);
  const [loading, setLoading] = useState(false);

  // Uncomment this block when the API is ready
  /*
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://yourdomain.com/api/v1/users/profile');
        const json = await response.json();
        if (json.status && json.data) {
          setUser(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  */

  if (loading) {
    return <ActivityIndicator size="small" color={PRIMARY_COLOR} />;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.image_url }} style={styles.avatar} />
      <View>
        <Text style={styles.greeting}>Assalamu’alaikum,</Text>
        <Text style={styles.username}>{user.full_name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
