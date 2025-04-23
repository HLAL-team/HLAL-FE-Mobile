import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { PRIMARY_COLOR } from "../../constants/colors";
import ProfileImage from "../../components/Profile/ProfileImage";
import BioField from "../../components/Profile/BioField";
import PasswordField from "../../components/Profile/PasswordField";

export default function Profile() {
  const [password, setPassword] = useState("••••••••");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    setIsEditing(false);
  };

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
          <Text style={styles.username}>username123</Text>
          <TouchableOpacity style={styles.editUsernameButton}>
            <Text>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <BioField title="Full Name" value="John Doe" />
          <BioField title="Email" value="johndoe@example.com" />
          <BioField title="Phone" value="+62 812 3456 7890" />
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
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Changes</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
