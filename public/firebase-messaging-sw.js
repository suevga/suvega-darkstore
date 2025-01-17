// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging-compat.js');
import { envConfig } from "../src/utility/env.config.js";


const firebaseConfig = {
  apiKey: envConfig.firebaseApiKey,
  authDomain: envConfig.firebaseAuthDomain,
  projectId: envConfig.firebaseProjectId,
  storageBucket: envConfig.firebaseStorageBucket,
  messagingSenderId: envConfig.firebaseMessagingSenderId,
  appId: envConfig.firebaseAppId,
  measurementId: envConfig.firebaseMeasurementId,
}


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions); 
});
