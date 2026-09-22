import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../utils/theme';

// Text-only brand wordmark for now: the official Malindi Business Network
// logo will be created separately. The name is set in navy with a soft,
// spaced tagline to read as a modern professional business network mark.
export default function BrandHeader({ size = 'large', tagline = true }) {
  const isLarge = size === 'large';
  return (
    <View style={styles.container}>
      <Text style={[styles.title, isLarge && styles.titleLarge]}>
        Malindi Business Network
      </Text>
      {tagline ? (
        <View style={styles.tagRow}>
          <View style={styles.tagLine} />
          <Text style={[styles.tagline, isLarge && styles.taglineLarge]}>
            Connecting Malindi Businesses
          </Text>
          <View style={styles.tagLine} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  titleLarge: {
    fontSize: 34,
    letterSpacing: 0.5,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  tagLine: {
    width: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.accent,
    marginHorizontal: 8,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  taglineLarge: {
    fontSize: 14,
  },
});