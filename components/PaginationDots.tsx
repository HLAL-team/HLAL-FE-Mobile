// components/PaginationDots.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PRIMARY_COLOR } from '../constants/colors';

export default function PaginationDots({ slides, currentIndex }: any) {
  return (
    <View style={styles.dotsContainer}>
      {slides.map((_: any, index: number) => (
        <View
          key={index}
          style={[styles.dot, currentIndex === index && styles.activeDot]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: PRIMARY_COLOR,
    width: 16,
  },
});
