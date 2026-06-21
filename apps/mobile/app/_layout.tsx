import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { initTelemetry } from '@/lib/telemetry';

// Force RTL (Hebrew) app-wide.
I18nManager.allowRTL(true);

export default function RootLayout() {
  useEffect(() => {
    initTelemetry();
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      // apply RTL by reloading once (production build); ignored in dev
      Updates.reloadAsync().catch(() => {});
    }
  }, []);

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
