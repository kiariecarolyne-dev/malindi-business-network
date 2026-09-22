import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MemberTabsScreen from '../screens/tabs/MemberTabsScreen';
import AdDetailScreen from '../screens/stage/AdDetailScreen';
import CreateAdScreen from '../screens/stage/CreateAdScreen';
import MyAdsScreen from '../screens/stage/MyAdsScreen';
import BusinessDetailScreen from '../screens/discover/BusinessDetailScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';
import BusinessSubscriptionScreen from '../screens/business/BusinessSubscriptionScreen';

import { colors } from '../utils/theme';

// Navigation for both new roles ('member' and 'business'). Members land on
// the five tabs immediately; business owners use the same tabs and reach the
// dashboard / profile / subscription flows through the tab screens or the
// pushed detail screens below.
const Stack = createNativeStackNavigator();

export default function MemberNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={MemberTabsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdDetail"
        component={AdDetailScreen}
        options={{ title: 'Advertisement' }}
      />
      <Stack.Screen
        name="CreateAd"
        component={CreateAdScreen}
        options={{ title: 'Post Advertisement' }}
      />
      <Stack.Screen
        name="MyAds"
        component={MyAdsScreen}
        options={{ title: 'My Advertisements' }}
      />
      <Stack.Screen
        name="BusinessDetail"
        component={BusinessDetailScreen}
        options={{ title: 'Business' }}
      />
      <Stack.Screen
        name="EditBusiness"
        component={BusinessProfileScreen}
        options={{ title: 'Business Profile' }}
      />
      <Stack.Screen
        name="BusinessDashboard"
        component={BusinessDashboardScreen}
        options={{ title: 'My Business' }}
      />
      <Stack.Screen
        name="BusinessSubscription"
        component={BusinessSubscriptionScreen}
        options={{ title: 'Membership' }}
      />
    </Stack.Navigator>
  );
}