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
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("••••••••");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateMessageType, setUpdateMessageType] = useState<"success" | "error" | null>(null);
  
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

  // Clear update message when component unmounts or when editing mode changes
  useEffect(() => {
    return () => {
      setUpdateMessage("");
      setUpdateMessageType(null);
    };
  }, [isEditingUsername, isEditingPassword]);

  // Fetch profile data only once on component mount
  useEffect(() => {
    if (!hasInitialized.current) {
      fetchUserProfile();
      hasInitialized.current = true;
    }
  }, []);
  
  // Update local state when user data changes
  useEffect(() => {
    if (user && user.username) {
      setNewUsername(user.username);
    }
  }, [user?.username]);

  const handleEditProfile = async () => {
    try {
      // Clear previous update message
      setUpdateMessage("");
      setUpdateMessageType(null);
      
      // Create form data for the profile update
      const formData = new FormData();
      
      // Only update username if editing username and it's valid
      if (isEditingUsername) {
        if (!newUsername.trim()) {
          Alert.alert("Error", "Username cannot be empty");
          return;
        }
        formData.append("username", newUsername);
      }
      
      // Only update password if editing password and it's provided
      if (isEditingPassword) {
        if (!newPassword.trim()) {
          Alert.alert("Error", "Password cannot be empty");
          return;
        }
        formData.append("password", newPassword);
      }
  
      // Use store action to update profile and get the response
      const response = await updateUserProfile(formData);
      
      // Handle the response based on its structure
      if (response) {
        // Check if response has a status field
        if (response.status === "Success") {
          // Success case
          setUpdateMessage(response.message || "Profile updated successfully!");
          setUpdateMessageType("success");
          
          // Reset editing states
          setIsEditingUsername(false);
          setIsEditingPassword(false);
          setNewPassword(""); // Clear password field after update
          
          // IMPORTANT: Re-fetch user profile to get the updated data
          await fetchUserProfile();
          
          // Show success alert
          Alert.alert("Success", response.message || "Profile updated successfully!");
        } else if (response.status === "Error") {
          // Error case with specific message
          setUpdateMessage(response.message || "Failed to update profile.");
          setUpdateMessageType("error");
          
          // Show error alert with specific message
          Alert.alert("Error", response.message || "Failed to update profile.");
        } else {
          // Generic success case (backward compatibility)
          setUpdateMessage("Profile updated successfully!");
          setUpdateMessageType("success");
          
          // Reset editing states
          setIsEditingUsername(false);
          setIsEditingPassword(false);
          setNewPassword("");
          
          // IMPORTANT: Re-fetch user profile to get the updated data
          await fetchUserProfile();
          
          // Show generic success alert
          Alert.alert("Success", "Profile updated successfully!");
        }
      } else {
        throw new Error("No response received");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setUpdateMessage("Failed to update profile. Please try again.");
      setUpdateMessageType("error");
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleCancelEditing = () => {
    // Reset to original values
    if (user?.username) {
      setNewUsername(user.username);
    }
    setNewPassword("");
    setIsEditingUsername(false);
    setIsEditingPassword(false);
    setUpdateMessage("");
    setUpdateMessageType(null);
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
        <ProfileImage avatarUrl={user?.avatarUrl} />

        <View style={styles.usernameContainer}>
          {isEditingUsername ? (
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
            onPress={() => {
              // Toggle username editing only
              if (isEditingUsername) {
                // Reset username to original value
                if (user?.username) {
                  setNewUsername(user.username);
                }
              }
              setIsEditingUsername(!isEditingUsername);
              // If we're editing username, stop editing password
              if (!isEditingUsername) {
                setIsEditingPassword(false);
              }
            }}
          >
            <Text>{isEditingUsername ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <BioField title="Full Name" value={user?.fullname || "N/A"} />
          <BioField title="Email" value={user?.email || "N/A"} />
          <BioField title="Phone" value={user?.phoneNumber || "N/A"} />
          
          <View style={styles.passwordSection}>
            <View style={styles.passwordHeader}>
              <Text style={styles.passwordLabel}>Password</Text>
              <TouchableOpacity
                style={styles.editPasswordButton}
                onPress={() => {
                  // Toggle password editing only
                  if (isEditingPassword) {
                    setNewPassword("");
                  }
                  setIsEditingPassword(!isEditingPassword);
                  // If we're editing password, stop editing username
                  if (!isEditingPassword) {
                    setIsEditingUsername(false);
                  }
                }}
              >
                <Text>{isEditingPassword ? "Cancel" : "Edit"}</Text>
              </TouchableOpacity>
            </View>
            
            {isEditingPassword ? (
              <View>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showPassword}
                />
                <Text style={styles.passwordHintText}>
                  Password must be at least 8 characters and include uppercase,
                  lowercase, digit, and special character
                </Text>
              </View>
            ) : (
              <Text style={styles.passwordValue}>••••••••</Text>
            )}
            
            {isEditingPassword && (
              <TouchableOpacity 
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? "Hide Password" : "Show Password"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Display update message if available */}
        {updateMessage ? (
          <Text style={[
            styles.updateMessage, 
            updateMessageType === "success" ? styles.successMessage : styles.errorMessage
          ]}>
            {updateMessage}
          </Text>
        ) : null}

        {/* Show response message from general store error */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {(isEditingUsername || isEditingPassword) && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEditing}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleEditProfile}>
              <Text style={styles.submitText}>Submit Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    position: 'relative', // <-- ini PENTING BANGET
  },
  profileContainer: {
    position: 'absolute',
    top: 35, // Bukan 0 ya, 90 atau 100 tergantung tinggi background hijau kamu
    alignSelf: 'center',
    zIndex: 10,
    transform: [{ translateY: -10 }],
    backgroundColor: 'white',
    borderRadius: 120,
    padding: 5,
  },
  whiteCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 80, // ini penting supaya white card mulai di bawah foto
    paddingTop: 80, 
    paddingHorizontal: 20,
    paddingBottom: 50,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
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
  passwordSection: {
    marginTop: 15,
    marginBottom: 5,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  passwordLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  passwordValue: {
    fontSize: 16,
    color: "#333",
    letterSpacing: 2,
  },
  editPasswordButton: {
    padding: 5,
  },
  passwordInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
    paddingVertical: 5,
  },
  passwordHintText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
  },
  showPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 8,
    padding: 4,
  },
  showPasswordText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
  },
  editUsernameButton: {
    padding: 5,
  },
  bioContainer: {
    marginBottom: 30,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#333",
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
  updateMessage: {
    textAlign: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  successMessage: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
  },
  errorMessage: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
  },
});