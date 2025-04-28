import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../../constants/colors';
import { BASE_URL, EDIT_PROFILE_API } from '../../constants/api'; // Add PROFILE_API import
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [imageError, setImageError] = useState(false);
  
  // Get user data and update function from auth store
  const user = useAuthStore(state => state.user);
  
  // Use fullName from props if provided, otherwise from auth store
  const fullName = propFullName || user?.fullname || '';

  // Debug effect to monitor avatarUrl changes
  useEffect(() => {
    setImageError(false); // Reset error state when avatar URL changes
  }, [avatarUrl]);
  
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
      
      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create form data with image
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Make sure the field name matches what your API expects
      formData.append('avatar', {
        uri,
        name: `profile-photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      
      // Use the EDIT_PROFILE_API endpoint instead of PROFILE_API
      const response = await fetch(EDIT_PROFILE_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type when uploading files with FormData
        },
        body: formData,
      });
      
      // Log the full response for debugging
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorText;
        try {
          // Try to get detailed error as JSON
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          // Fall back to text if not JSON
          errorText = await response.text();
        }
        console.error('Upload error:', response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      // Parse the response
      let responseData;
      try {
        responseData = await response.json();
        console.log('Upload success:', responseData);
      } catch (e) {
        console.log('Response was not JSON:', await response.text());
      }
      
      // Call the provided callback to refresh profile data in the parent
      if (onImageUpdated) {
        await onImageUpdated();
      }
      
      // Reset error state after successful upload
      setImageError(false);
      
      // Show success message
      Alert.alert(
        'Success', 
        'Profile image updated successfully!'
      );
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Upload Failed', 
        error instanceof Error 
          ? error.message 
          : 'Failed to update profile image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };
  
  // Get background color for avatar placeholder
  const avatarBgColor = getColorFromName(fullName);
  const initials = getInitials(fullName);
  
  // Construct the correct image URL using BASE_URL
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
  
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl && !imageError ? (
          <Image
            source={{ uri: getImageUrl(avatarUrl) }}
            style={styles.avatar}
            onError={(e) => {
              console.log('Image loading error:', e.nativeEvent.error);
              setImageError(true);
            }}
            // Add a key to force re-render when the URL changes
            key={avatarUrl}
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
    backgroundColor: '#f0f0f0', // Light background to see loading issues
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
  },
  debugText: {
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    marginTop: -5,
    marginBottom: 5,
    width: '80%',
  }
});