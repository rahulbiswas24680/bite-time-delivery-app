import { messaging } from './firebase';
import { getToken } from 'firebase/messaging';

export async function requestFCMPermission() {
  try {
    const token = await getToken(messaging, { vapidKey: 'YOUR-VAPID-KEY' });
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token', error);
  }
}
