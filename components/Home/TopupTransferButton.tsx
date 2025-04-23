// components/Home/TopupTransferButton.tsx
import { Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

interface Props {
  label: string;
  icon: React.ReactNode;
  backgroundColor: string;
  route: string;
}

export default function TopupTransferButton({
  label,
  icon,
  backgroundColor,
  route,
}: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(route as any)}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
});
