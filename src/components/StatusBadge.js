import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../utils/theme';

const statusColors = {
  Active: { bg: colors.primaryLight, fg: colors.primary },
  Inactive: { bg: colors.border, fg: colors.textSecondary },
  Draft: { bg: colors.warningLight, fg: colors.warning },
  Expired: { bg: colors.dangerLight, fg: colors.danger },
  Pending: { bg: colors.warningLight, fg: colors.warning },
  Processing: { bg: colors.warningLight, fg: colors.warning },
  Paid: { bg: colors.successLight, fg: colors.success },
  Verified: { bg: colors.successLight, fg: colors.success },
  Rejected: { bg: colors.dangerLight, fg: colors.danger },
  Available: { bg: colors.successLight, fg: colors.success },
  Open: { bg: colors.successLight, fg: colors.success },
  Closed: { bg: colors.dangerLight, fg: colors.danger },
};

export default function StatusBadge({ label }) {
  const palette = statusColors[label] || { bg: colors.border, fg: colors.textSecondary };
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.round,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});