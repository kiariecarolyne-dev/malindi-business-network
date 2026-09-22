import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, glow } from '../utils/theme';

// Abstract "business connections & discovery" mark used on the main entry
// screen. A central network glyph linked to satellite nodes and a location
// pin - subtle technology treatment that supports the business message
// without game-like decoration.
export default function NetworkNodes() {
  return (
    <View style={styles.frame}>
      <View style={styles.ring}>
        <Ionicons name="git-network" size={58} color={colors.primary} />
      </View>
      <View style={styles.dotA} />
      <View style={styles.dotB} />
      <View style={styles.pin}>
        <Ionicons name="location" size={18} color={colors.navy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 210,
    height: 150,
    alignSelf: 'center',
  },
  ring: {
    position: 'absolute',
    top: 6,
    left: 36,
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    ...glow,
  },
  dotA: {
    position: 'absolute',
    top: 18,
    left: 120,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
  },
  dotB: {
    position: 'absolute',
    bottom: 22,
    left: 24,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(10, 26, 60, 0.9)',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pin: {
    position: 'absolute',
    bottom: 14,
    right: 30,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});