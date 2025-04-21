// app/signup.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import CheckboxWithText from '../components/CheckboxWithText';
import { useRouter } from 'expo-router';
import { PRIMARY_COLOR } from '../constants/colors';

export default function SignUpScreen() {
  const router = useRouter();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSubmit = () => {
    if (agree) {
      console.log({ fullname, email, password, phone });
    } else {
      alert('Please agree to the Terms & Conditions.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        {/* Scrollable content */}
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
            <InputField label="Full Name" value={fullname} onChangeText={setFullname} />
            <InputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <InputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <InputField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
        </ScrollView>

        {/* Fixed bottom section */}
        <View style={styles.footer}>
          <CheckboxWithText checked={agree} onPress={() => setAgree(!agree)} />
          <PrimaryButton label="Sign Up" onPress={handleSubmit} />
          <Text style={{ color: '#444', alignItems: 'center', textAlign: 'center', marginBottom: 16 }}>
            Already have an account?{' '}
            <Text
              onPress={() => router.push('/login')}
              style={{ color: PRIMARY_COLOR, fontWeight: '600' }}
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
});
