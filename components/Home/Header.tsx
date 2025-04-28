import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { PRIMARY_COLOR } from '@/constants/colors';
import { BASE_URL } from '@/constants/api'; // Import BASE_URL
import { useAuthStore } from '@/store';

export default function Header() {
  // Get user data and loading state from our auth store
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const fetchUserProfile = useAuthStore(state => state.fetchUserProfile);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Fetch user profile when component mounts
    fetchUserProfile();
  }, []);

  // Reset image error state when user data changes
  useEffect(() => {
    setImageError(false);
  }, [user?.avatarUrl]);

  // Generate initials from name
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get random color based on name
  const getColorFromName = (name: string) => {
    if (!name) return PRIMARY_COLOR;
    
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
      '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
      '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
    ];
    
    // Simple hash function for name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Get color from array using the hash
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Construct proper image URL
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    
    if (url.startsWith('http')) {
      return url;
    } else {
      // Ensure path starts with '/'
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${BASE_URL}${path}`;
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color={PRIMARY_COLOR} />;
  }

  // Handle case when user might be null
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: PRIMARY_COLOR }]}>
          <Text style={styles.initialText}>?</Text>
        </View>
        <View>
          <Text style={styles.greeting}>Assalamu'alaikum,</Text>
          <Text style={styles.username}>Guest</Text>
        </View>
      </View>
    );
  }

  // Get the background color and initials for the avatar
  const avatarBgColor = getColorFromName(user.fullname || user.username);
  const initials = getInitials(user.fullname || user.username);

  return (
    <View style={styles.container}>
      {user.avatarUrl && !imageError ? (
        <Image
          source={{ uri: getImageUrl(user.avatarUrl) }}
          style={styles.avatar}
          onError={(e) => {
            console.log('Header image error:', e.nativeEvent.error);
            setImageError(true);
          }}
          key={user.avatarUrl} // Force re-render when URL changes
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: avatarBgColor }]}>
          <Text style={styles.initialText}>{initials}</Text>
        </View>
      )}
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
    backgroundColor: '#f0f0f0', // Light background to see loading issues
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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