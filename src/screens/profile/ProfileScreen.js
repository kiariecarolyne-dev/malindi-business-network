import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProfileAvatar from '../../components/ProfileAvatar';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { businessCanAdvertise } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

// Profile tab. Shows the logged-in account and role. Business owners get a
// membership summary plus dashboard / advertisement shortcuts; regular
// members see what the free membership includes.
export default function ProfileScreen({ navigation }) {
  const { currentUser, userProfile, isBusiness, isMember, logout } = useAuth();

  const fullName = userProfile?.fullName || currentUser?.displayName || 'Member';
  const phone = userProfile?.phone || '';
  const email = currentUser?.email || userProfile?.email || '';
  const subscribed = isBusiness ? businessCanAdvertise(userProfile) : false;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileCard}>
          <ProfileAvatar
            profilePhoto={userProfile?.profilePhoto}
            size={72}
            fallbackIcon={isBusiness ? 'storefront-outline' : 'person-outline'}
          />
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {isBusiness ? 'Business Owner' : isMember ? 'Network Member' : 'Account'}
            </Text>
          </View>
          {phone ? <Text style={styles.contact}>{phone}</Text> : null}
          {email ? <Text style={styles.contact}>{email}</Text> : null}
          <View style={styles.memberSinceRow}>
            <Ionicons name="logo-octocat" size={14} color={colors.textMuted} />
            <Text style={styles.memberSince}>
              Member of Malindi Business Network
            </Text>
          </View>
        </View>

        {isBusiness ? (
          <View style={[styles.subCard, subscribed ? styles.subActive : styles.subInactive]}>
            <View style={styles.subRow}>
              <Text style={styles.subLabel}>Membership</Text>
              <View
                style={[styles.dot, { backgroundColor: subscribed ? colors.success : colors.warning }]}
              />
              <Text style={[styles.subStatus, { color: subscribed ? colors.success : colors.warning }]}>
                {subscribed ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <Text style={styles.subPrice}>KSh 100 / month</Text>
            <Text style={styles.subDetail}>
              {subscribed
                ? 'Your advertising membership is active.'
                : 'Subscribe to post advertisements on the Business Stage.'}
            </Text>
            <PrimaryButton
              title={subscribed ? 'Manage My Business' : 'Subscribe Now'}
              icon={subscribed ? 'grid-outline' : 'card-outline'}
              onPress={() =>
                subscribed
                  ? navigation.navigate('BusinessDashboard')
                  : navigation.navigate('BusinessSubscription')
              }
              style={styles.buttonTop}
            />
            <PrimaryButton
              title="My Advertisements"
              variant="outline"
              icon="list-outline"
              onPress={() => navigation.navigate('MyAds')}
              style={styles.buttonTop}
            />
            <PrimaryButton
              title="Edit Business Profile"
              variant="outline"
              icon="create-outline"
              onPress={() => navigation.navigate('EditBusiness')}
              style={styles.buttonTop}
            />
          </View>
        ) : null}

        {isMember ? (
          <View style={styles.memberCard}>
            <Text style={styles.memberCardTitle}>Your free membership</Text>
            {[
              'Browse the Business Stage',
              'Discover businesses by category and location',
              'View business profiles',
              'Contact businesses by Call and WhatsApp',
            ].map((item) => (
              <View key={item} style={styles.memberRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <Text style={styles.memberRowText}>{item}</Text>
              </View>
            ))}
            <Text style={styles.memberHint}>
              Own a business? Register a business owner account to advertise it
              on the Business Stage.
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          title="Logout"
          variant="danger"
          icon="log-out-outline"
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  name: {
    ...typography.title,
    fontSize: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.round,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: spacing.sm,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  contact: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  memberSinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  memberSince: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginLeft: 4,
  },
  subCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
    borderWidth: 2,
  },
  subActive: {
    borderColor: colors.primary,
  },
  subInactive: {
    borderColor: colors.border,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subLabel: {
    ...typography.caption,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  subStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  subPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.sm,
  },
  subDetail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  buttonTop: {
    marginTop: spacing.sm,
  },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  memberCardTitle: {
    ...typography.subtitle,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  memberRowText: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
  },
  memberHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 19,
  },
});