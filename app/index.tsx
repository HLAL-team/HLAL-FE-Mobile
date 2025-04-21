// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // You can later use AsyncStorage here to check if onboarding is completed
  return <Redirect href="/onboarding" />;
}
