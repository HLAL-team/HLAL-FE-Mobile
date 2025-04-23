import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
  } from "react-native";
  import React from "react";
  import { FontAwesome } from "@expo/vector-icons";
  import { PRIMARY_COLOR } from "../../constants/colors";
  
  interface PasswordFieldProps {
    password: string;
    setPassword: (value: string) => void;
    showPassword: boolean;
    setShowPassword: (value: boolean) => void;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
  }
  
  export default function PasswordField({
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isEditing,
    setIsEditing,
  }: PasswordFieldProps) {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitle}>Password</Text>
        <View style={styles.fieldValueContainer}>
          {isEditing ? (
            <View style={styles.passwordInputContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.fieldInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <FontAwesome
                  name={showPassword ? "eye" : "eye-slash"}
                  size={16}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.fieldValue}>{password}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.editPasswordButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editPasswordText}>
            {isEditing ? "Cancel" : "Change Password"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    fieldContainer: {
      marginBottom: 15,
    },
    fieldTitle: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 5,
      color: "#333",
    },
    fieldValueContainer: {
      backgroundColor: `${PRIMARY_COLOR}20`,
      padding: 12,
      borderRadius: 10,
    },
    fieldValue: {
      fontSize: 16,
      color: "#333",
    },
    passwordInputContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    fieldInput: {
      fontSize: 16,
      color: "#333",
      flex: 1,
    },
    eyeIcon: {
      padding: 5,
    },
    editPasswordButton: {
      alignSelf: "flex-end",
      marginTop: 8,
    },
    editPasswordText: {
      color: PRIMARY_COLOR,
      fontWeight: "600",
    },
  });
  