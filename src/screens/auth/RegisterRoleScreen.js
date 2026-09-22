import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BrandHeader from '../../components/BrandHeader';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

// Account setup choices for new users. Two paths: a free Network member who
// browses and contacts businesses, or a business owner who pays KSh 100/month
// to advertise on the Business Stage.
const options = [
  {
    key: 'member',
    title: 'Join the Network',
    subtitle: 'Free access to discover Malindi businesses and contact them directly.',
    icon: 'account-heart-outline',
    navigate: 'MemberRegister',
  },
  {
    key: 'business',
    title: 'Register Your Business',
    subtitle: 'KSh 100/month to advertise and promote your business on Malindi Business Network.',
    icon: 'storefront-outline',
    navigate: 'BusinessRegister',
  },
];

export default function RegisterRoleScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BrandHeader size="medium" tagline={false} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>How would you like to use Malindi Business Network?</Text>
      </View>

      <View style={styles.list}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate(option.navigate)}
          >
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={option.icon} size={26} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 4,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  cardTitle: {
    ...typography.subtitle,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    marginTop: 2,
  },
});