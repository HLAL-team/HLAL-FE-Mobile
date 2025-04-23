// constants/styles.ts
import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#19918F',
  secondary: '#22DEB8',
  textPrimary: '#000',
  textSecondary: '#666',
  textMuted: '#888',
  background: '#fff',
  cardBackground: '#f9f9f9',
  income: 'green',
  outcome: 'red',
};

export const FONT = {
  small: 12,
  medium: 14,
  large: 16,
  xLarge: 18,
  xxLarge: 28,
};

export const SPACING = {
  xSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  xLarge: 24,
  xxLarge: 32,
};

export const RADIUS = {
  small: 8,
  medium: 10,
  large: 12,
  xLarge: 20,
  avatar: 30,
};

export const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 4,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xLarge,
  },
  sectionTitle: {
    fontSize: FONT.large,
    fontWeight: '600',
    marginBottom: SPACING.small,
  },
});
