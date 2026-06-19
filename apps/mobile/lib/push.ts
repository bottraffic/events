import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register the device for push notifications and send the Expo token to the
 * backend (stored on User.pushToken) so the server can push: new lead,
 * new message, RSVP, contract signed, task — exactly like the web realtime feed.
 */
export async function registerForPush(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  try {
    await api('/auth/push-token', { method: 'POST', body: JSON.stringify({ token }) });
  } catch {
    // demo mode / offline — ignore
  }
  return token;
}
