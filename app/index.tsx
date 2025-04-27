// app/index.tsx
import { AppProvider } from '@/context/AppProvider';
import { Redirect } from 'expo-router';

export default function Index() {
  return (
      <Redirect href="/onboarding" />
  );
}
