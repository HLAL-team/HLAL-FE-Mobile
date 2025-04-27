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
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PROFILE_API, EDIT_PROFILE_API } from "../../constants/api";
import { PRIMARY_COLOR } from "../../constants/colors";
import ProfileImage from "../../components/Profile/ProfileImage";
import BioField from "../../components/Profile/BioField";
import PasswordField from "../../components/Profile/PasswordField";
import { useRouter } from "expo-router";

interface Profile {
  fullname: string;
  username: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  balance: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("••••••••");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
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
          throw new Error("Failed to fetch profile");
        }

        const json = await response.json();
        setProfile(json);
        setNewUsername(json.username); // Pre-fill the username field
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No token found");
        return;
      }

      const formData = new FormData();
      formData.append("username", newUsername);
      formData.append("password", newPassword);

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
        throw new Error(errorResponse.message || "Failed to update profile");
      }

      const json = await response.json();
      setProfile((prev) => ({
        ...prev,
        username: json.username,
      }));
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("authToken"); // Clear the token
      router.replace("/login"); // Redirect to the login screen
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (loading) {
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
  style={{ backgroundColor: '#9ADBD7', minHeight: 20 }}  // (INI CUMA NGATUR WARNA BACKGROUND)
>        
<View style={{ width: '100%', position: 'relative' }}>
      <View style={styles.profileContainer}>
      <ProfileImage />
        </View>
          <View style={styles.whiteCard}>


        <View style={styles.usernameContainer}>
          {isEditing ? (
            <TextInput
              style={styles.usernameInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
            />
          ) : (
            <Text style={styles.username}>{profile?.username || "Guest"}</Text>
          )}
          <TouchableOpacity
            style={styles.editUsernameButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text>{isEditing ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <BioField title="Full Name" value={profile?.fullname || "N/A"} />
          <BioField title="Email" value={profile?.email || "N/A"} />
          <BioField title="Phone" value={profile?.phoneNumber || "N/A"} />
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
});