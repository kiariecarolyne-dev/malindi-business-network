import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { onMyBusiness } from '../../services/businessService';
import { businessCanAdvertise } from '../../utils/testMode';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

function formatDate(dateVal) {
  if (!dateVal) return '';
  const ms =
    typeof dateVal?.toMillis === 'function'
      ? dateVal.toMillis()
      : new Date(dateVal).getTime();
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Hub for a business owner: subscription status and expiry, their business
// profile, and the main actions (post/ manage ads, edit profile, renew).
export default function BusinessDashboardScreen({ navigation }) {
  const { currentUser, userProfile, isBusiness } = useAuth();

  const [business, setBusiness] = useState(undefined);
  const [liveProfile, setLiveProfile] = useState(userProfile);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    return onMyBusiness(currentUser.uid, (data) => setBusiness(data));
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    return onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
      if (!snapshot.exists()) return;
      setLiveProfile((prev) => ({ ...(prev || {}), ...snapshot.data() }));
    });
  }, [currentUser?.uid]);

  const subscription = liveProfile || userProfile;

  const expiryMs = (() => {
    const expiry = subscription?.subscriptionExpiryDate;
    if (!expiry) return null;
    return typeof expiry?.toMillis === 'function'
      ? expiry.toMillis()
      : new Date(expiry).getTime();
  })();

  const isSubscribed =
    subscription?.subscriptionStatus === 'active' &&
    (expiryMs === null || (Number.isFinite(expiryMs) && expiryMs > Date.now()));

  const canAdvertise = businessCanAdvertise(subscription);

  if (!isBusiness) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={36} color={colors.textMuted} />
        <Text style={styles.centerTitle}>Business accounts only</Text>
        <Text style={styles.centerText}>
          The dashboard is available to registered business owners.
        </Text>
      </View>
    );
  }

  if (business === undefined) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>My Business</Text>
        <Text style={styles.heroSub}>
          Manage your membership, profile and advertisements.
        </Text>
      </View>

      <View style={[styles.card, isSubscribed ? styles.cardActive : styles.cardInactive]}>
        <View style={styles.subRow}>
          <Text style={styles.subLabel}>Membership</Text>
          <StatusBadge label={isSubscribed ? 'Active' : business?.isActive === false ? 'Inactive' : 'Inactive'} />
        </View>
        <Text style={styles.subPrice}>KSh 100 / month</Text>
        {isSubscribed ? (
          <Text style={styles.subDetail}>Active until {formatDate(subscription?.subscriptionExpiryDate)}</Text>
        ) : (
          <Text style={styles.subDetail}>
            Your membership is inactive. An active membership lets you post
            advertisements on the Business Stage.
          </Text>
        )}
        <PrimaryButton
          title={isSubscribed ? 'Renew Membership' : 'Subscribe Now'}
          icon="card-outline"
          onPress={() => navigation.navigate('BusinessSubscription')}
          style={styles.subButton}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business Profile</Text>
        {business ? (
          <>
            <Text style={styles.bizName}>{business.businessName}</Text>
            {business.category ? (
              <Text style={styles.bizMeta}>{business.category}</Text>
            ) : null}
            {business.location ? (
              <Text style={styles.bizMeta}>{business.location}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.bizMissing}>
            You have not created a business profile yet.
          </Text>
        )}
        <PrimaryButton
          title={business ? 'Edit Business Profile' : 'Set Up Business Profile'}
          variant={business ? 'outline' : 'primary'}
          icon="storefront-outline"
          onPress={() => navigation.navigate('EditBusiness')}
          style={styles.spaceTop}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Advertisements</Text>
        <View style={styles.actions}>
          <PrimaryButton
            title="Post Advertisement"
            icon="add-circle-outline"
            onPress={() => navigation.navigate('CreateAd')}
          />
          {!canAdvertise ? (
            <Text style={styles.actionHint}>
              You need an active membership before you can post new
              advertisements.
            </Text>
          ) : null}
          <PrimaryButton
            title="My Advertisements"
            variant="outline"
            icon="list-outline"
            onPress={() => navigation.navigate('MyAds')}
            style={styles.spaceTop}
          />
        </View>
      </View>

      <PrimaryButton
        title="View My Public Business Page"
        variant="outline"
        icon="storefront-outline"
        onPress={() => navigation.navigate('BusinessDetail', { businessId: currentUser?.uid })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  centerTitle: {
    ...typography.subtitle,
    fontSize: 18,
    marginTop: spacing.md,
  },
  centerText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
    lineHeight: 20,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.title,
    fontSize: 22,
  },
  heroSub: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardInactive: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subLabel: {
    ...typography.caption,
  },
  subPrice: {
    fontSize: 26,
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
  subButton: {
    marginTop: spacing.md,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  bizName: {
    ...typography.body,
    fontWeight: '700',
  },
  bizMeta: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  bizMissing: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '600',
  },
  spaceTop: {
    marginTop: spacing.sm,
  },
  actionHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});