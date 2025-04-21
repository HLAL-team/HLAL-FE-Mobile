// app/onboarding.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import OnboardingSlide from '../components/OnboardingSlide';
import PaginationDots from '../components/PaginationDots';
import PrimaryButton from '../components/PrimaryButton';
import { PRIMARY_COLOR } from '../constants/colors';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Assalamu’alaikum,',
    subtitle: 'May peace fill your heart today.',
    description:
      'Introducing HLAL — A smart, sharia-friendly wallet made just for you. Simple, secure, and blessed.',
  },
  {
    title: 'Sharia First, Always',
    subtitle: '',
    description:
      'HLAL ensures every transaction is aligned with Islamic principles — safe, transparent, and riba-free.',
  },
  {
    title: 'Ready to get started?',
    subtitle: '',
    description:
      'Join thousands who’ve chosen HLAL as their go-to digital wallet. Let’s make every transaction meaningful.',
  },
];

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const router = useRouter(); // ✅ Use this for navigation

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      router.push('/signup'); // ✅ Go to SignUp screen
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Image
        source={require('../assets/images/onboarding/background-onboarding.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <PaginationDots slides={slides} currentIndex={currentIndex} />

      <View style={styles.buttonContainer}>
        <PrimaryButton
          label={currentIndex < slides.length - 1 ? 'Next' : 'Get Started'}
          onPress={handleNext}
        />

        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>
            Have an account?{' '}
            <Text style={{ color: PRIMARY_COLOR, fontWeight: '600' }}>
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loginText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
});
