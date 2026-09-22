import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../utils/theme';
import { getAdType } from '../utils/adTypes';
import { formatRelativeTime } from '../utils/format';
import { getProfilePhotoUrl } from '../services/profilePhotoService';
import ImagePlaceholder from './ImagePlaceholder';
import ContactActions from './ContactActions';

// A single card on the Business Stage feed. Tapping the card opens the
// advertisement detail; "View Business" opens the business profile; the
// Contact actions call or WhatsApp the business owner directly.
export default function AdCard({ ad, business, onPress, onViewBusiness }) {
  const type = getAdType(ad.type);
  const photoUri = getProfilePhotoUrl(ad.image) || getProfilePhotoUrl(ad?.businessImage);
  const bizPhotoUri = getProfilePhotoUrl(business?.profilePhoto);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        {bizPhotoUri ? (
          <Image source={{ uri: bizPhotoUri }} style={styles.avatar} />
        ) : (
          <ImagePlaceholder icon="storefront-outline" iconSize={18} style={styles.avatar} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.businessName} numberOfLines={1}>
            {ad.businessName || business?.businessName || 'Business'}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(ad.createdAt)}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.typeBadgeText}>{type.emoji} {type.label}</Text>
        </View>
      </View>

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.media} resizeMode="cover" />
      ) : null}

      <Text style={styles.title} numberOfLines={2}>{ad.title}</Text>
      {ad.description ? (
        <Text style={styles.description} numberOfLines={3}>{ad.description}</Text>
      ) : null}

      {ad.location ? (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>{ad.location}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.businessButton}
          onPress={onViewBusiness}
        >
          <Ionicons name="storefront-outline" size={15} color={colors.primary} />
          <Text style={styles.businessButtonText}>View Business</Text>
        </TouchableOpacity>
        <View style={styles.footerContacts}>
          <ContactActions
            phone={ad.phone || business?.phone}
            whatsapp={ad.whatsapp || business?.whatsapp}
            compact
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  businessName: {
    ...typography.subtitle,
    fontSize: 15,
  },
  time: {
    ...typography.bodySmall,
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.round,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  media: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginTop: spacing.md,
    backgroundColor: colors.logoBackground,
  },
  title: {
    ...typography.subtitle,
    fontSize: 17,
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    marginLeft: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  businessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  businessButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  footerContacts: {
    flex: 1,
  },
});