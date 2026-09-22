import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

const STEPS = [
  {
    icon: 'search-outline',
    title: 'Find a business',
    text: 'Open Discover or the Business Stage and open a business or advertisement that interests you.',
  },
  {
    icon: 'call-outline',
    title: 'Tap Call or WhatsApp',
    text: 'Every business profile and advertisement has direct Call and WhatsApp buttons that open your phone app instantly.',
  },
  {
    icon: 'chatbubble-ellipses-outline',
    title: 'Agree the details',
    text: 'Message the business directly about products, services, prices or partnerships.',
  },
];

// Messages tab. This phase keeps contact direct (Call / WhatsApp deep links),
// so this screen explains how to reach businesses. In-app messaging with a
// saved message history is planned for a later phase.
export default function MessagesScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            Talk to businesses the way they prefer - by phone or WhatsApp.
          </Text>
        </View>

        {STEPS.map((step, index) => (
          <View key={step.title} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <Ionicons name={step.icon} size={22} color={colors.primaryDark} />
              </View>
              <Text style={styles.stepIndex}>Step {index + 1}</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardText}>{step.text}</Text>
          </View>
        ))}

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.noteText}>
            Your phone number and WhatsApp are never shown publicly - customers
            reach you through the in-app buttons.
          </Text>
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
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 22,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndex: {
    ...typography.caption,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 15,
  },
  cardText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  noteText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
});