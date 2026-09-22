import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import PrimaryButton from '../../components/PrimaryButton';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { normalizeKenyanPhoneE164 } from '../../utils/format';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:3000';
const SUBSCRIPTION_AMOUNT = 100;
const TRANSACTION_DESC = 'Malindi Business Network membership';

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

// KSh 100/month advertising & network membership for business owners, paid
// via M-Pesa STK Push on the MBN backend. The status only becomes 'active'
// after the backend confirms the payment callback, so this screen keeps
// listening to the user's subscription fields.
export default function BusinessSubscriptionScreen({ navigation }) {
  const { currentUser, userProfile, logout } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [liveProfile, setLiveProfile] = useState(userProfile);

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

  const expiredPreviously =
    !isSubscribed && expiryMs !== null && Number.isFinite(expiryMs);

  const expiryDate = formatDate(subscription?.subscriptionExpiryDate);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setLiveProfile((prev) => ({ ...(prev || {}), ...data }));
      if (data.subscriptionStatus === 'active') {
        const expiry = data.subscriptionExpiryDate;
        const expiryMsVal =
          typeof expiry?.toMillis === 'function'
            ? expiry.toMillis()
            : expiry
              ? new Date(expiry).getTime()
              : null;
        const valid = !expiryMsVal || expiryMsVal > Date.now();
        if (valid) {
          setStatusMessage('');
          setPending(false);
        }
      }
    });
    return unsubscribe;
  }, [currentUser?.uid]);

  const handleSubscribe = async () => {
    if (loading || pending) return;

    const normalized = normalizeKenyanPhoneE164(phoneNumber);
    if (!normalized) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Kenyan M-Pesa number.\nExamples: 07XXXXXXXX, 2547XXXXXXXX'
      );
      return;
    }

    setLoading(true);
    setStatusMessage('Sending M-Pesa payment prompt…');

    try {
      const token = await currentUser.getIdToken(false);
      const response = await fetch(`${BACKEND_URL}/api/payments/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: normalized,
          amount: SUBSCRIPTION_AMOUNT,
          transactionDesc: TRANSACTION_DESC,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.log('[FIRESTORE/PAYMENT FAILURE]', {
          operation: 'STK Push',
          httpStatus: response.status,
          message: result.error || result.detail || 'Unknown error',
        });
        setStatusMessage('');
        Alert.alert(
          'Payment Failed',
          result.error || 'Could not initiate M-Pesa payment. Please try again.'
        );
        return;
      }

      setPending(true);
      setStatusMessage(
        'M-Pesa payment prompt sent. Check your phone and enter your M-Pesa PIN.'
      );
    } catch (error) {
      console.log('[FIRESTORE/PAYMENT FAILURE]', {
        operation: 'STK Push',
        httpStatus: 0,
        message: error?.message || 'Network error',
      });
      setStatusMessage('');
      setPending(false);
      Alert.alert(
        'Network Error',
        'Could not reach the payment server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPending = () => {
    if (loading) return;
    setPending(false);
    setStatusMessage('');
  };

  const handleContinue = () => {
    navigation.navigate('BusinessDashboard');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.title}>Business Network Membership</Text>
          <Text style={styles.tagline}>
            Advertise your business on Malindi Business Network for only
            KSh 100/month.
          </Text>
          {isSubscribed ? (
            <>
              <StatusBadge label="Active" />
              <Text style={styles.expiryText}>
                Membership active until {expiryDate}
              </Text>
            </>
          ) : expiredPreviously ? (
            <>
              <StatusBadge label="Expired" />
              <View style={styles.expiredCard}>
                <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
                <Text style={styles.expiredText}>
                  Your membership expired on {expiryDate}. Renew below to keep
                  advertising on the Business Stage.
                </Text>
              </View>
            </>
          ) : (
            <StatusBadge label="Inactive" />
          )}
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Network Membership</Text>
          <Text style={styles.planPrice}>KES {SUBSCRIPTION_AMOUNT} / month</Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>What you get</Text>
          {[
            'A public business profile in Discover',
            'Post advertisements on the Business Stage',
            'Direct calls and WhatsApp messages from customers and partners',
            'Be found by members searching your category and location',
          ].map((item) => (
            <View key={item} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
        </View>

        {!isSubscribed && (
          <>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="07XXXXXXXX"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={13}
              />
              <Text style={styles.inputHint}>
                Enter the number linked to your M-Pesa account
              </Text>
            </View>

            {statusMessage ? (
              <View style={styles.statusCard}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <PrimaryButton
                title={
                  loading
                    ? 'Processing…'
                    : pending
                      ? 'Waiting for Payment…'
                      : expiredPreviously
                        ? 'Renew with M-Pesa'
                        : 'Subscribe with M-Pesa'
                }
                icon={loading || pending ? undefined : 'phone-portrait-outline'}
                onPress={handleSubscribe}
                disabled={loading || pending}
              />
              {loading || pending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.spinner}
                />
              ) : null}
              {pending ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCancelPending}
                  style={styles.pendingCancel}
                >
                  <Text style={styles.pendingCancelText}>
                    Haven't received the prompt? Dismiss this and try again.
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}

        {isSubscribed && (
          <View style={styles.actions}>
            <PrimaryButton
              title="Open My Business Dashboard"
              icon="arrow-forward-outline"
              onPress={handleContinue}
            />
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.infoText}>
            This is an advertising and network membership fee. It does not buy
            products, guarantee sales, or invest in any business. Opportunities
            posted as "Investment Opportunity" are informational - contact the
            business directly to discuss them.
          </Text>
        </View>

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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    fontSize: 22,
  },
  tagline: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  expiryText: {
    ...typography.bodySmall,
    color: colors.success,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  expiredCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  expiredText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 20,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow,
  },
  planLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  benefitsTitle: {
    ...typography.subtitle,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  phoneInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inputHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.primaryDark,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  actions: {
    marginBottom: spacing.md,
  },
  spinner: {
    marginTop: spacing.sm,
  },
  pendingCancel: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  pendingCancelText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
});