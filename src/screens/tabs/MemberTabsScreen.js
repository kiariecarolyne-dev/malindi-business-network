import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomTabBar from '../../components/BottomTabBar';
import HomeScreen from '../home/HomeScreen';
import StageScreen from '../stage/StageScreen';
import DiscoverScreen from '../discover/DiscoverScreen';
import MessagesScreen from '../messages/MessagesScreen';
import ProfileScreen from '../profile/ProfileScreen';
import { colors } from '../../utils/theme';

// Host for the five main tabs: Home, Business Stage, Discover, Messages and
// Profile. Each section is a plain component - a custom BottomTabBar switches
// between them, while detail screens are pushed on top of the parent stack
// navigator (MemberNavigator).
export default function MemberTabsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');

  const goToTab = (key) => setActiveTab(key);

  const renderSection = () => {
    switch (activeTab) {
      case 'stage':
        return <StageScreen navigation={navigation} />;
      case 'discover':
        return <DiscoverScreen navigation={navigation} />;
      case 'messages':
        return <MessagesScreen navigation={navigation} />;
      case 'profile':
        return <ProfileScreen navigation={navigation} />;
      case 'home':
      default:
        return <HomeScreen navigation={navigation} goToTab={goToTab} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderSection()}</View>
      <BottomTabBar activeTab={activeTab} onChange={goToTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});