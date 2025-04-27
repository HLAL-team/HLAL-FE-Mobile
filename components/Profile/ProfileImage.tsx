import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { PRIMARY_COLOR } from "../../constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { PROFILE_API, EDIT_PROFILE_API } from "../../constants/api";

export default function ProfileImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(PROFILE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile image");
        }

        const json = await response.json();
        setImageUrl(json.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(json.fullname)}&background=19918F&color=fff`);
      } catch (error) {
        console.error("Failed to fetch profile image:", error);
        setImageUrl("https://via.placeholder.com/150"); // Fallback image
      } finally {
        setLoading(false);
      }
    };

    fetchProfileImage();
  }, []);

  const handleEditImage = async () => {
    try {
      // Request permission to access the media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to allow access to your gallery.");
        return;
      }
  
      // Open the image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct usage
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
  
      if (pickerResult.cancelled) {
        return;
      }
  
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }
  
      setUploading(true);
  
      const formData = new FormData();
      formData.append("avatar", {
        uri: pickerResult.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);
  
      console.log("Sending request to:", EDIT_PROFILE_API);
      console.log("FormData:", formData);
  
      const response = await fetch(EDIT_PROFILE_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response:", errorResponse);
        throw new Error(errorResponse.message || "Failed to update profile image");
      }
  
      const json = await response.json();
      setImageUrl(json.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(json.fullname)}&background=19918F&color=fff`);
      Alert.alert("Success", "Profile image updated successfully!");
    } catch (error) {
      console.error("Failed to update profile image:", error);
      Alert.alert("Error", "Failed to update profile image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.profileImageContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.profileImageContainer}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.profileImage} />
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