import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, typography } from '../utils/theme';
import { getProfilePhotoUrl } from '../services/profilePhotoService';
import { telLink, resolveWhatsapp } from '../utils/contactUtils';
import ImagePlaceholder from './ImagePlaceholder';

// Compact vertical business card used in Discover, Home and search results.
// Tapping the card opens the public business profile.
export default function BusinessCard({ business, onPress }) {
  const [photoError, setPhotoError] = useState(false);
  const photoUri = getProfilePhotoUrl(business?.profilePhoto);
  const hasContact = !!(telLink(business?.phone) || resolveWhatsapp(business?.whatsapp, business?.phone));

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        {photoUri && !photoError ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.logo}
            onError={() => setPhotoError(true)}
          />
        ) : (
          <ImagePlaceholder icon="storefront-outline" iconSize={20} style={styles.logo} />
        )}
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {business?.businessName || 'Unnamed Business'}
          </Text>
          {business?.category ? <Text style={styles.category}>{business.category}</Text> : null}
          {business?.location ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color={colors.textMuted} />
              <Text style={styles.meta} numberOfLines={1}>{business.location}</Text>
            </View>
          ) : null}
        </View>
        {hasContact ? (
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
        ) : null}
      </View>
      {business?.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {business.description}
        </Text>
      ) : null}
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
  logo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  body: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    fontSize: 15,
  },
  category: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  meta: {
    ...typography.bodySmall,
    marginLeft: 4,
    flex: 1,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});