import { initializeApp } from 'firebase/app';
import { getToken, getMessaging, onMessage } from 'firebase/messaging';
import { envConfig } from '../utility/env.config';
import axiosInstance from '../api/axiosInstance';

console.log('firebase config', envConfig.firebaseVAPID);

const firebaseConfig = {
  apiKey: envConfig.firebaseApiKey,
  authDomain: envConfig.firebaseAuthDomain,
  projectId: envConfig.firebaseProjectId,
  storageBucket: envConfig.firebaseStorageBucket,
  messagingSenderId: envConfig.firebaseMessagingSenderId,
  appId: envConfig.firebaseAppId,
  measurementId: envConfig.firebaseMeasurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Permission not granted for notifications, please allow notifications');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Function to get or create token
export const getFCMToken = async (): Promise<string | undefined> => {
  try {
    const permission = await requestNotificationPermission();

    if (permission !== true) {
      alert('Permission not granted for notifications, please allow notifications');
      return;
    }

    // Get existing token or generate new one
    const currentToken = await getToken(messaging, {
      vapidKey: envConfig.firebaseVAPID,
    });

    if (!currentToken) {
      console.log('No registration token available. Request permission to generate one.');
      return;
    }

    console.log('FCM Token:', currentToken);
    return currentToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return;
  }
};

// Function to save FCM token to backend
export const saveFCMTokenToBackend = async (token: string, userId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/api/v1/notification/register-device', {
      token,
      userId,
    });

    if (response.status === 200) {
      console.log('FCM token saved to backend successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving FCM token to backend:', error);
    return false;
  }
};

// Function to handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export default { getFCMToken, saveFCMTokenToBackend, onMessageListener };