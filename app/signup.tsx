import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import CheckboxWithText from '../components/CheckboxWithText';
import { useRouter } from 'expo-router';
import { PRIMARY_COLOR } from '../constants/colors';
import { useAuthStore } from '@/store'; // Import auth store

export default function SignUpScreen() {
  const router = useRouter();

  // Local form state
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [agree, setAgree] = useState(false);
  
  // Get state and actions from auth store
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);
  const register = useAuthStore(state => state.register);
  const clearError = useAuthStore(state => state.clearError);
  
  // Clear any error messages when component unmounts
  useEffect(() => {
    return () => clearError();
  }, []);

  const handleSubmit = async () => {
    // Clear previous errors
    clearError();

    if (!agree) {
      // Using local validation for agreement since this is UI specific
      Alert.alert('Error', 'Please agree to the Terms & Conditions.');
      return;
    }

    // Validate form fields
    if (!fullname || !email || !password || !username || !phone) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    // Use store action to register
    const success = await register({
      fullname,
      email,
      username,
      password,
      phoneNumber: phone,
    });
    
    if (success) {
      // On success, show success message and navigate to login
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
    }
    // No need to handle errors here - the store will update the error state
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
              onChangeText={(text) => {
                setFullname(text);
                if (error) clearError();
              }}
              editable={!loading}
            />
            <InputField
              label="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) clearError();
              }}
              editable={!loading}
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) clearError();
              }}
              keyboardType="email-address"
              editable={!loading}
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              secureTextEntry
              editable={!loading}
            />
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (error) clearError();
              }}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </ScrollView>

        {/* Error message from store */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.footer}>
          <CheckboxWithText 
            checked={agree} 
            onPress={() => setAgree(!agree)}
            disabled={loading} 
          />
          <PrimaryButton
            label={loading ? "Creating Account..." : "Sign Up"}
            onPress={handleSubmit}
            disabled={loading || !fullname || !email || !password || !username || !phone || !agree}
            icon={loading ? () => <ActivityIndicator size="small" color="#fff" /> : undefined}
          />
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              onPress={() => !loading && router.push('/login')}
              style={[styles.linkText, loading && styles.disabledLink]}
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
  disabledLink: {
    opacity: 0.5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});