import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initTelemetry } from '@/lib/telemetry';

// Force RTL (Hebrew) app-wide. Applied on app launch — no reload loop.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  useEffect(() => { initTelemetry(); }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
