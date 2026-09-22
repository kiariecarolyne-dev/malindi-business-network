import { useEffect, useRef } from 'react';

import { useAuth } from '../context/AuthContext';
import {
  getOrCreateDeviceId,
  getExpoPushToken,
  IS_EXPO_GO,
  removePushTokenForUser,
  savePushTokenForUser,
} from '../services/pushNotifications';

// Handles everything notification-related that must live inside the app but
// outside any single screen: registering this device's push token for the
// signed-in user and reacting to token rotation. Tapping a notification while
// signed in is handled by each screen; there is no cross-dashboard deep
// linking in the Network (Malindi Business Network has a single member/
// business navigation).
export default function NotificationBridge() {
  const { currentUser, loading } = useAuth();

  const lastUidRef = useRef(null);

  // Register (or unregister) this device's push token when the signed-in user
  // changes. Runs after auth has settled so `currentUser` is reliable.
  useEffect(() => {
    if (loading) return;

    const uid = currentUser?.uid ?? null;
    if (IS_EXPO_GO) {
      // Expo Go has no remote push on SDK 53+: nothing to register or remove.
      // Keep lastUidRef in sync so a later dev-build session behaves itself.
      lastUidRef.current = uid;
      return;
    }

    if (uid) {
      lastUidRef.current = uid;
      (async () => {
        const deviceId = await getOrCreateDeviceId();
        const token = await getExpoPushToken();
        if (token) {
          await savePushTokenForUser(uid, token, deviceId);
        }
      })();
    } else {
      const previousUid = lastUidRef.current;
      lastUidRef.current = null;
      if (previousUid) {
        (async () => {
          const deviceId = await getOrCreateDeviceId();
          await removePushTokenForUser(previousUid, deviceId);
        })();
      }
    }
  }, [loading, currentUser?.uid]);

  // React to push token rotation (e.g. after a re-install / token refresh).
  // Skipped entirely inside Expo Go where the native token emitter is removed.
  useEffect(() => {
    if (IS_EXPO_GO) return undefined;
    try {
      const Notifications = require('expo-notifications');
      return Notifications.addPushTokenListener(({ data }) => {
        const uid = lastUidRef.current;
        if (!uid || typeof data !== 'string') return;
        getOrCreateDeviceId().then((deviceId) =>
          savePushTokenForUser(uid, data, deviceId)
        );
      }).remove;
    } catch (error) {
      console.warn('[push] token listener unavailable', error?.message);
      return undefined;
    }
  }, []);

  return null;
}