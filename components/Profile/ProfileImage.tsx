// ProfileImage.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store';

interface ProfileImageProps {
  avatarUrl?: string;
  fullName?: string;
  onImageUpdated?: () => Promise<void>;
  isUpdating?: boolean;
}

export default function ProfileImage({ 
  avatarUrl, 
  fullName: propFullName, 
  onImageUpdated, 
  isUpdating = false 
}: ProfileImageProps) {
  const [uploading, setUploading] = useState(false);
  
  // Get user data and update function from auth store
  const user = useAuthStore(state => state.user);
  const updateUserProfile = useAuthStore(state => state.updateUserProfile);
  
  // Use fullName from props if provided, otherwise from auth store
  const fullName = propFullName || user?.fullname || '';
  
  // Generate initials from full name
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Get random color based on name (for consistent color)
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
  
  const pickImage = async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'We need permission to access your photos');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      
      // Create form data with image
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('avatar', {
        uri,
        name: `profile-photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      
      // Use our Zustand store to update the profile
      await updateUserProfile(formData);
      
      // Call the provided callback to refresh profile data in the parent
      if (onImageUpdated) {
        await onImageUpdated();
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to update profile image');
    } finally {
      setUploading(false);
    }
  };
  
  // Get background color for avatar placeholder
  const avatarBgColor = getColorFromName(fullName);
  const initials = getInitials(fullName);
  
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl.startsWith('http') 
              ? avatarUrl 
              : `https://api.hlal.com${avatarUrl}` // Replace with your actual API base URL
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.initialAvatar, { backgroundColor: avatarBgColor }]}>
            <Text style={styles.initialText}>{initials}</Text>
          </View>
        )}
        {(uploading || isUpdating) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.editButton}
        onPress={pickImage}
        disabled={uploading || isUpdating}
      >
        <Ionicons name="camera" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    position: 'absolute',
    bottom: 10,
    right: '35%',
    backgroundColor: PRIMARY_COLOR,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});