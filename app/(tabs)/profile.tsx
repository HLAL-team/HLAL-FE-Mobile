import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { PRIMARY_COLOR } from "../../constants/colors";
import ProfileImage from "../../components/Profile/ProfileImage";
import BioField from "../../components/Profile/BioField";
import PasswordField from "../../components/Profile/PasswordField";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store"; // Import auth store

export default function Profile() {
  // Local UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("••••••••");
  
  // Prevent multiple fetch calls
  const hasInitialized = useRef(false);
  
  // Router for navigation
  const router = useRouter();
  
  // Get user data from store
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);
  const logout = useAuthStore(state => state.logout);
  
  // Get actions from store, but DON'T use them in render or effect dependencies
  const { fetchUserProfile, updateUserProfile } = useAuthStore();

  // Fetch profile data only once on component mount
  useEffect(() => {
    if (!hasInitialized.current) {
      fetchUserProfile();
      hasInitialized.current = true;
    }
    // Do NOT add fetchUserProfile to dependencies - that would cause infinite loops
  }, []);
  
  // Update local state when user data changes
  useEffect(() => {
    if (user && user.username) {
      setNewUsername(user.username);
    }
  }, [user?.username]);

  const handleEditProfile = async () => {
    try {
      if (!newUsername.trim()) {
        Alert.alert("Error", "Username cannot be empty");
        return;
      }
      
      // Create form data for the profile update
      const formData = new FormData();
      formData.append("username", newUsername);
      
      if (newPassword) {
        formData.append("password", newPassword);
      }

      // Use store action to update profile
      const success = await updateUserProfile(formData);
      
      if (success) {
        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
        setNewPassword(""); // Clear password field after update
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      // Use store action to log out
      await logout();
      router.replace("/login"); // Redirect to login screen
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <ProfileImage />

        <View style={styles.usernameContainer}>
          {isEditing ? (
            <TextInput
              style={styles.usernameInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
            />
          ) : (
            <Text style={styles.username}>{user?.username || "Guest"}</Text>
          )}
          <TouchableOpacity
            style={styles.editUsernameButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text>{isEditing ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <BioField title="Full Name" value={user?.fullname || "N/A"} />
          <BioField title="Email" value={user?.email || "N/A"} />
          <BioField title="Phone" value={user?.phoneNumber || "N/A"} />
          
          {isEditing && (
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
          )}
          <PasswordField
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.submitButton} onPress={handleEditProfile}>
            <Text style={styles.submitText}>Submit Changes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: "white",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 5,
  },
  usernameInput: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 5,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
    flex: 1,
  },
  passwordInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
    marginVertical: 10,
    padding: 5,
  },
  editUsernameButton: {
    padding: 5,
  },
  bioContainer: {
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },
  signOutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
  },
});