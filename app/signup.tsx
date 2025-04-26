import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import CheckboxWithText from '../components/CheckboxWithText';
import { useRouter } from 'expo-router';
import { PRIMARY_COLOR } from '../constants/colors';
import { REGISTER_API } from '../constants/api';

export default function SignUpScreen() {
  const router = useRouter();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [agree, setAgree] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!agree) {
      setErrorMessage('Please agree to the Terms & Conditions.');
      return;
    }

    try {
      const response = await fetch(REGISTER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname,
          email,
          username,
          password,
          phoneNumber: phone,
        }),
      });

      const data = await response.json();

      if (data.status === 'Success') {
        // On success, show success message
        Alert.alert(
          'Registration Successful',
          'Your account has been created. Please log in to continue.',
          [
            {
              text: 'Go to Login',
              onPress: () => router.push('/login'),
            },
          ]
        );
      } else {
        // Show error if registration fails
        setErrorMessage(data.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
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
            <Text style={styles.title}>Create Your Account</Text>
          </View>

          <View style={styles.formSection}>
            <InputField
              label="Full Name"
              value={fullname}
              onChangeText={setFullname}
            />
            <InputField
              label="Username"
              value={username}
              onChangeText={setUsername}
            />
            <InputField
              label="Email"
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
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>

        {/* Error message */}
        {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}

        <View style={styles.footer}>
          <CheckboxWithText checked={agree} onPress={() => setAgree(!agree)} />
          <PrimaryButton
            label="Sign Up"
            onPress={handleSubmit}
          />
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              onPress={() => router.push('/login')}
              style={styles.linkText}
            >
              Log In
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
