import { initializeApp } from "firebase/app";
import { getToken, getMessaging, onMessage } from "firebase/messaging";
import { envConfig } from "../utility/env.config.js";
import axiosInstance from "../api/axiosInstance.js";

console.log("firebase config", envConfig.firebaseVAPID);

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
export const requestNotificationPermission = async () => {
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
export const getFCMToken = async () => {
  try {
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      alert('Permission not granted for notifications, please allow notifications');
      return;
    }

    // Get existing token or generate new one
    const currentToken = await getToken(messaging, {
      vapidKey: envConfig.firebaseVAPID,
    });
    console.log("current token", currentToken);
    
    if (!currentToken) {
      throw new Error('No registration token available');
    }

    return currentToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Function to update FCM token in backend
export const updateFCMTokenInBackend = async (token, darkStoreId) => {
  try {
    const response = await axiosInstance.patch('/api/v1/store/updateFcmToken', {
      fcmToken: token,
      storeId: darkStoreId
    });
    if (response.status === 200) {
      console.log('FCM token updated successfully', JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('Error updating FCM token:', error);
  }
};

// Handle incoming messages when app is in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;