import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BrandHeader from '../../components/BrandHeader';
import NetworkNodes from '../../components/NetworkNodes';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

// Main entry experience: sells the value of Malindi Business Network before
// asking the visitor to register. Business registration (KSh 100/month) is the
// visually strongest call to action; joining as a free member and logging in
// stay clearly available without competing with it.
const benefits = [
  {
    icon: 'megaphone-outline',
    title: 'Advertise',
    text: 'Put your business in front of people across Malindi.',
  },
  {
    icon: 'location-outline',
    title: 'Get Discovered',
    text: 'Customers find you by category and location.',
  },
  {
    icon: 'call-outline',
    title: 'Connect Directly',
    text: 'Customers can call or WhatsApp your business.',
  },
  {
    icon: 'people-outline',
    title: 'Build Connections',
    text: 'Discover partners and opportunities in Malindi.',
  },
];

function BenefitCard({ icon, title, text }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BrandHeader size="large" />
        </View>

        <View style={styles.hero}>
          <NetworkNodes />

          <Text style={styles.headline}>
            Let Your Business Be Discovered Across Malindi
          </Text>
          <Text style={styles.supporting}>
            Advertise your business, connect with customers and business
            partners, and let people call or WhatsApp you directly.
          </Text>
        </View>

        <View style={styles.benefitsGrid}>
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </View>

        <View style={styles.ctaSection}>
          <PrimaryButton
            title="Register Your Business"
            variant="navy"
            icon="storefront-outline"
            onPress={() => navigation.navigate('BusinessRegister')}
            style={[styles.registerButton, styles.registerGlow]}
          />
          <Text style={styles.priceLine}>KSh 100 / month</Text>
          <Text style={styles.priceSupport}>
            Advertise and promote your business on Malindi Business Network.
          </Text>
        </View>

        <View style={styles.memberSection}>
          <Text style={styles.memberLabel}>Just exploring?</Text>
          <PrimaryButton
            title="Join the Network for Free"
            variant="outline"
            icon="person-add-outline"
            onPress={() => navigation.navigate('MemberRegister')}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  headline: {
    ...typography.display,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 340,
  },
  supporting: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    ...typography.subtitle,
    fontSize: 15,
    marginTop: spacing.sm,
  },
  benefitText: {
    ...typography.bodySmall,
    lineHeight: 17,
    marginTop: 2,
    color: colors.textSecondary,
  },
  ctaSection: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  registerButton: {
    borderRadius: radius.lg,
    minHeight: 54,
  },
  registerGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  priceLine: {
    marginTop: spacing.sm,
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  priceSupport: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: spacing.md,
  },
  memberSection: {
    marginTop: spacing.lg,
  },
  memberLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  loginLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: spacing.xs,
    fontSize: 13,
  },
});