import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Telemetry always goes to the real backend (even in demo) so the operator sees
// real crashes from clients in the /admin console.
const API_URL: string = (Constants.expoConfig?.extra?.apiUrl as string) ?? 'https://events.webon.org.il/v1';
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

let deviceId = '';
async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  let id = await AsyncStorage.getItem('simcha_device');
  if (!id) { id = 'mob-' + Math.random().toString(36).slice(2) + Date.now().toString(36); await AsyncStorage.setItem('simcha_device', id); }
  deviceId = id;
  return id;
}

export async function report(type: 'crash' | 'error' | 'event', message?: string, stack?: string) {
  try {
    const did = await getDeviceId();
    await fetch(`${API_URL}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type, platform: Platform.OS, appVersion: APP_VERSION, deviceId: did,
        message: (message ?? '').slice(0, 2000), stack: stack?.slice(0, 6000),
      }),
    });
  } catch {}
}

let installed = false;
export function initTelemetry() {
  if (installed) return;
  installed = true;
  // Catch fatal + non-fatal JS crashes
  const g: any = global as any;
  if (g.ErrorUtils?.getGlobalHandler) {
    const prev = g.ErrorUtils.getGlobalHandler();
    g.ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
      report(isFatal ? 'crash' : 'error', error?.message ?? String(error), error?.stack);
      prev?.(error, isFatal);
    });
  }
  report('event', 'app_open');
}
