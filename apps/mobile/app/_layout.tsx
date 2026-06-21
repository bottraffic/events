import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { initTelemetry } from '@/lib/telemetry';

// Enable + force RTL (Hebrew) app-wide.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  useEffect(() => {
    initTelemetry();
    // Apply RTL on first launch via a single guarded reload (flag prevents any loop).
    (async () => {
      try {
        if (!I18nManager.isRTL && !(await AsyncStorage.getItem('rtl_applied'))) {
          await AsyncStorage.setItem('rtl_applied', '1');
          await Updates.reloadAsync();
        }
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
