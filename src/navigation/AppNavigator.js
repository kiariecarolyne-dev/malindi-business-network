import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { navigationRef } from '../utils/navigationRef';

import LoadingScreen from '../components/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import MemberNavigator from './MemberNavigator';

// The navigator shown is selected based on the authenticated user's role
// (read from the Firestore users/{uid} profile). Malindi Business Network has
// exactly two roles: 'member' (free, browses and contacts) and 'business'
// (subscribed to advertise). While the Firebase auth state or the role is
// still loading, an appropriate loading state is shown so the wrong dashboard
// is never flashed.
export default function AppNavigator() {
  const { currentUser, userRole, loading } = useAuth();

  return (
    <NavigationContainer ref={navigationRef}>
      {loading ? (
        <LoadingScreen />
      ) : !currentUser ? (
        <AuthNavigator />
      ) : userRole === 'member' || userRole === 'business' ? (
        <MemberNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}