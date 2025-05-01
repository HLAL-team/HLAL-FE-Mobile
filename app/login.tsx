import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { useRouter } from 'expo-router';
import { PRIMARY_COLOR } from '../constants/colors';
import { LOGIN_API } from '../constants/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  

  const handleLogin = async () => {
    try {
      const response = await fetch(LOGIN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: email,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (data.status === "Success") {
        // Store the token in AsyncStorage
        await AsyncStorage.setItem("authToken", data.token);
  
        // Navigate to the home screen
        router.push("(tabs)/home");
      } else {
        setErrorMessage(data.message || "Login failed.");
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>Welcome Back!</Text>
          </View>

          <View style={styles.formSection}>
            <InputField
              label="Email or username"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {/* Display error message */}
          {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}

          <PrimaryButton label="Login" onPress={handleLogin} />
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text
              onPress={() => router.push('/signup')}
              style={styles.linkText}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    textAlign: 'center',
  },
  formSection: {
    gap: 2,
  },
  footer: {
    gap: 6,
  },
  footerText: {
    color: '#444',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 16,
  },
  linkText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});
