import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import ContactActions from '../../components/ContactActions';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { useAuth } from '../../context/AuthContext';
import {
  onBusiness,
} from '../../services/businessService';
import {
  deleteAdvertisement,
  onAdvertisement,
  updateAdvertisement,
} from '../../services/advertisementService';
import { getAdType, AD_STATUSES } from '../../utils/adTypes';
import { formatRelativeTime } from '../../utils/format';
import { getProfilePhotoUrl } from '../../services/profilePhotoService';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Full view of a single advertisement, including the business summary and
// call/WhatsApp buttons. The business owner sees edit / pause / delete
// controls that act only on their own posts.
export default function AdDetailScreen({ route, navigation }) {
  const { currentUser, isBusiness } = useAuth();
  const { adId } = route.params;

  const [ad, setAd] = useState(null);
  const [business, setBusiness] = useState(null);

  const isOwner = !!currentUser && !!ad && ad.ownerUid === currentUser.uid;

  useEffect(() => {
    const unsubAd = onAdvertisement(adId, (data) => {
      if (!data) {
        Alert.alert('Not found', 'This advertisement no longer exists.');
        navigation.goBack();
        return;
      }
      setAd(data);
    });
    return unsubAd;
  }, [adId, navigation]);

  useEffect(() => {
    if (!ad?.businessId) return undefined;
    return onBusiness(ad.businessId, (data) => setBusiness(data));
  }, [ad?.businessId]);

  const type = getAdType(ad?.type);
  const photoUri = getProfilePhotoUrl(ad?.image);
  const bizPhotoUri = getProfilePhotoUrl(business?.profilePhoto);

  const handleToggleStatus = () => {
    if (!ad) return;
    const next = ad.status === AD_STATUSES.ACTIVE ? AD_STATUSES.INACTIVE : AD_STATUSES.ACTIVE;
    const act = next === AD_STATUSES.ACTIVE ? 'activate' : 'pause';
    Alert.alert(
      `${act === 'activate' ? 'Activate' : 'Pause'} advertisement`,
      act === 'activate'
        ? 'This advertisement will appear on the Business Stage again.'
        : 'This advertisement will be hidden from the Business Stage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: act === 'activate' ? 'Activate' : 'Pause',
          style: act === 'activate' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await updateAdvertisement(ad.adId, { status: next });
            } catch (error) {
              Alert.alert('Update failed', error?.message || 'Could not update this advertisement.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!ad) return;
    Alert.alert(
      'Delete advertisement',
      'This will permanently delete this advertisement. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdvertisement(ad.adId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Delete failed', error?.message || 'Could not delete this advertisement.');
            }
          },
        },
      ]
    );
  };

  if (!ad) {
    return (
      <View style={styles.center}>
        <Ionicons name="megaphone-outline" size={36} color={colors.textMuted} />
        <Text style={styles.loadingText}>Loading advertisement…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.media} resizeMode="cover" />
      ) : (
        <ImagePlaceholder icon={type.icon} iconSize={44} style={styles.media} />
      )}

      <View style={styles.section}>
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{type.emoji} {type.label}</Text>
          </View>
          <Text style={styles.time}>{formatRelativeTime(ad.createdAt)}</Text>
        </View>
        <Text style={styles.title}>{ad.title}</Text>
        {ad.description ? <Text style={styles.description}>{ad.description}</Text> : null}
        {ad.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{ad.location}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business</Text>
        <View style={styles.businessRow}>
          {bizPhotoUri ? (
            <Image source={{ uri: bizPhotoUri }} style={styles.bizLogo} />
          ) : (
            <ImagePlaceholder icon="storefront-outline" iconSize={22} style={styles.bizLogo} />
          )}
          <View style={styles.bizInfo}>
            <Text style={styles.bizName} numberOfLines={1}>
              {ad.businessName || business?.businessName || 'Business'}
            </Text>
            {business?.location ? (
              <Text style={styles.bizMeta} numberOfLines={1}>{business.location}</Text>
            ) : null}
          </View>
          <PrimaryButton
            title="View Profile"
            variant="outline"
            onPress={() =>
              navigation.navigate('BusinessDetail', { businessId: ad.businessId })
            }
            style={styles.bizButton}
          />
        </View>

        <View style={styles.contactWrap}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <ContactActions phone={ad.phone || business?.phone} whatsapp={ad.whatsapp || business?.whatsapp} />
        </View>
      </View>

      {isOwner && isBusiness ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage this advertisement</Text>
          <PrimaryButton
            title="Edit Details"
            icon="create-outline"
            variant="outline"
            onPress={() => navigation.navigate('CreateAd', { adId: ad.adId })}
            style={styles.ownerButton}
          />
          <PrimaryButton
            title={ad.status === AD_STATUSES.ACTIVE ? 'Pause Advertisement' : 'Activate Advertisement'}
            icon={ad.status === AD_STATUSES.ACTIVE ? 'pause-circle-outline' : 'play-circle-outline'}
            variant="outline"
            onPress={handleToggleStatus}
            style={styles.ownerButton}
          />
          <PrimaryButton
            title="Delete Advertisement"
            icon="trash-outline"
            variant="danger"
            onPress={handleDelete}
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
  },
  loadingText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
  scroll: {
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  media: {
    width: '100%',
    height: 220,
    backgroundColor: colors.logoBackground,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.round,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  time: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaText: {
    ...typography.body,
    marginLeft: spacing.xs,
    flex: 1,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bizLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  bizInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  bizName: {
    ...typography.subtitle,
    fontSize: 15,
  },
  bizMeta: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  bizButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  contactWrap: {
    marginTop: spacing.md,
  },
  ownerButton: {
    marginBottom: spacing.sm,
  },
});