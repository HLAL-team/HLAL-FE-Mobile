import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { PRIMARY_COLOR } from "../../constants/colors";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "@/store";
import { BASE_URL } from "@/constants/api"; // Import API base URL

export default function ProfileImage() {
  const [uploading, setUploading] = useState(false);

  // Get user data and actions from auth store
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);

  // Create full image URL by combining base URL with avatar path
  const getFullImageUrl = () => {
    if (!user) return null;

    // If avatarUrl starts with "http", it's already a full URL
    if (user.avatarUrl && user.avatarUrl.startsWith("http")) {
      return user.avatarUrl;
    }

    // If avatarUrl exists but is a relative path, prepend the API base URL
    if (user.avatarUrl) {
      // Remove leading slash if both base URL ends with slash and avatarUrl starts with slash
      const avatarPath = user.avatarUrl.startsWith("/")
        ? user.avatarUrl.substring(1)
        : user.avatarUrl;
        console.log("Avatar Path:", avatarPath); // Debugging line
      console.log("Base URL:", BASE_URL); // Debugging line
      return `${BASE_URL}/${avatarPath}`;
    }

    // Fallback to UI Avatars if no avatarUrl
    if (user.fullname) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.fullname
      )}&background=19918F&color=fff`;
    }

    return "https://via.placeholder.com/150";
  };

  useEffect(() => {
    // Fetch user profile when component mounts
    fetchUserProfile();
  }, []);

  const handleEditImage = async () => {
    try {
      // Request permission to access the media library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to your gallery."
        );
        return;
      }

      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      setUploading(true);

      // Create form data for the image upload
      const formData = new FormData();

      // Get the selected asset
      const asset = result.assets ? result.assets[0] : { uri: result.uri };

      formData.append("avatar", {
        uri: asset.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);

      // Use store action to update profile
      const success = await updateUserProfile(formData);

      if (success) {
        Alert.alert("Success", "Profile image updated successfully!");
      } else {
        throw new Error("Failed to update profile image");
      }
    } catch (error) {
      console.error("Failed to update profile image:", error);
      Alert.alert("Error", "Failed to update profile image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.profileImageContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.profileImageContainer}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: getFullImageUrl() }}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.editImageButton}
          onPress={handleEditImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome name="pencil" size={16} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderStyle: "dashed",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: PRIMARY_COLOR,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
