import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdCard from '../../components/AdCard';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ContactActions from '../../components/ContactActions';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { onBusiness } from '../../services/businessService';
import { onBusinessAdvertisements } from '../../services/advertisementService';
import { getProfilePhotoUrl } from '../../services/profilePhotoService';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Public business profile. Shows everything a customer or partner needs
// (category, what the business offers, location, hours) with direct Call and
// WhatsApp buttons. Its owner sees extra "Manage" actions.
export default function BusinessDetailScreen({ route, navigation }) {
  const { currentUser, isBusiness } = useAuth();
  const { businessId } = route.params;

  const [business, setBusiness] = useState(undefined);
  const [ads, setAds] = useState([]);

  const isOwner =
    isBusiness && !!currentUser && !!business && business.ownerUid === currentUser.uid;

  useEffect(() => {
    if (!businessId) {
      setBusiness(null);
      return undefined;
    }
    return onBusiness(businessId, (data) => {
      setBusiness(data);
      if (!data || data.isActive === false) {
        setAds([]);
      }
    });
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return undefined;
    return onBusinessAdvertisements(businessId, (list) => setAds(list));
  }, [businessId]);

  if (business === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (business === null) {
    return (
      <View style={styles.center}>
        <Ionicons name="storefront-outline" size={36} color={colors.textMuted} />
        <Text style={styles.centerTitle}>Business not found</Text>
        <Text style={styles.centerText}>
          This business may no longer be active on the Network.
        </Text>
      </View>
    );
  }

  const logoUri = business.isActive === false ? null : getProfilePhotoUrl(business.profilePhoto);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View
        style={[styles.banner, business.isActive === false && styles.bannerInactive]}
      >
        {business.isActive === false || !logoUri ? (
          <ImagePlaceholder icon="storefront-outline" iconSize={40} style={styles.logo} />
        ) : (
          <Image source={{ uri: logoUri }} style={styles.logo} />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.name}>{business.businessName || 'Business'}</Text>
            {business.category ? <Text style={styles.category}>{business.category}</Text> : null}
          </View>
        </View>

        {business.ownerName ? (
          <Text style={styles.owner}>Owned by {business.ownerName}</Text>
        ) : null}

        {business.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{business.location}</Text>
          </View>
        ) : null}
        {business.email ? (
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{business.email}</Text>
          </View>
        ) : null}
        {business.businessHours ? (
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{business.businessHours}</Text>
          </View>
        ) : null}

        {business.isActive === false ? (
          <View style={styles.inactiveCard}>
            <Ionicons name="pause-circle-outline" size={20} color={colors.warning} />
            <Text style={styles.inactiveText}>
              This business has been deactivated by its owner.
            </Text>
          </View>
        ) : null}

        <ContactActions phone={business.phone} whatsapp={business.whatsapp} />
      </View>

      {business.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{business.description}</Text>
        </View>
      ) : null}

      {business.productsServices && business.productsServices.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What this business offers</Text>
          <View style={styles.tagWrap}>
            {business.productsServices.map((item) => (
              <View key={item} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advertisements</Text>
        {ads.length === 0 ? (
          <Text style={styles.noAds}>This business has no active advertisements.</Text>
        ) : (
          ads.map((ad) => (
            <AdCard
              key={ad.adId}
              ad={ad}
              business={business}
              onPress={() => navigation.navigate('AdDetail', { adId: ad.adId })}
              onViewBusiness={() => {}}
            />
          ))
        )}
      </View>

      {isOwner ? (
        <View style={styles.section}>
          <PrimaryButton
            title="Edit Business Profile"
            icon="create-outline"
            variant="outline"
            onPress={() => navigation.navigate('EditBusiness')}
            style={styles.ownerButton}
          />
          <PrimaryButton
            title="Open My Business Dashboard"
            icon="grid-outline"
            onPress={() => navigation.navigate('BusinessDashboard')}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
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
    maxWidth: 260,
  },
  scroll: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xl,
  },
  banner: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
  },
  bannerInactive: {
    opacity: 0.5,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleText: {
    flex: 1,
  },
  name: {
    ...typography.title,
    fontSize: 22,
  },
  category: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  owner: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaText: {
    ...typography.body,
    marginLeft: spacing.xs,
    flex: 1,
    fontSize: 13,
  },
  inactiveCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  inactiveText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.warning,
    marginLeft: spacing.sm,
    lineHeight: 20,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.round,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  noAds: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  ownerButton: {
    marginBottom: spacing.sm,
  },
});