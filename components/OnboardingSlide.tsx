// components/OnboardingSlide.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PRIMARY_COLOR } from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function OnboardingSlide({ item }: { item: any }) {
  return (
    <View style={styles.slide}>
      <View style={styles.content}>
        <Text style={styles.heading}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.subheading}>{item.subtitle}</Text> : null}
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.3,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
