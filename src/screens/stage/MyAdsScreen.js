import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAdvertisement,
  onMyAdvertisements,
  updateAdvertisement,
} from '../../services/advertisementService';
import { AD_STATUSES, getAdType } from '../../utils/adTypes';
import { formatRelativeTime } from '../../utils/format';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

// Business owner's own posts in every state (active / inactive / draft) with
// pause, edit and delete actions.
export default function MyAdsScreen({ navigation }) {
  const { currentUser, isBusiness } = useAuth();
  const [ads, setAds] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    return onMyAdvertisements(currentUser.uid, (list) => setAds(list));
  }, [currentUser?.uid]);

  const statusLabel = (status) => {
    switch (status) {
      case AD_STATUSES.ACTIVE:
        return 'Active';
      case AD_STATUSES.INACTIVE:
        return 'Inactive';
      case AD_STATUSES.DRAFT:
        return 'Draft';
      default:
        return 'Active';
    }
  };

  const handleToggle = (ad) => {
    const next =
      ad.status === AD_STATUSES.ACTIVE ? AD_STATUSES.INACTIVE : AD_STATUSES.ACTIVE;
    updateAdvertisement(ad.adId, { status: next }).catch((error) => {
      Alert.alert('Update failed', error?.message || 'Could not update this advertisement.');
    });
  };

  const handleDelete = (ad) => {
    Alert.alert(
      'Delete advertisement',
      `"${ad.title}" will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAdvertisement(ad.adId).catch((error) => {
              Alert.alert('Delete failed', error?.message || 'Could not delete this advertisement.');
            });
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const type = getAdType(item.type);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <Text style={styles.typeText}>{type.emoji} {type.label}</Text>
            <StatusBadge label={statusLabel(item.status)} />
          </View>
          <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
            <Text style={styles.meta}>{item.location}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
            onPress={() => navigation.navigate('CreateAd', { adId: item.adId })}
          >
            <Ionicons name="create-outline" size={16} color={colors.primaryDark} />
            <Text style={[styles.actionText, { color: colors.primaryDark }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, { backgroundColor: colors.warningLight }]}
            onPress={() => handleToggle(item)}
          >
            <Ionicons
              name={item.status === AD_STATUSES.ACTIVE ? 'pause-outline' : 'play-outline'}
              size={16}
              color={colors.warning}
            />
            <Text style={[styles.actionText, { color: colors.warning }]}>
              {item.status === AD_STATUSES.ACTIVE ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, { backgroundColor: colors.dangerLight }]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!isBusiness) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={36} color={colors.textMuted} />
        <Text style={styles.centerText}>Only business owners can manage advertisements.</Text>
      </View>
    );
  }

  if (ads === null) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={ads}
      keyExtractor={(item) => item.adId}
      renderItem={renderItem}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="megaphone-outline" size={36} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No advertisements yet</Text>
          <Text style={styles.emptyText}>
            Post your first advertisement and appear on the Business Stage.
          </Text>
          <PrimaryButton
            title="Post Advertisement"
            icon="add-circle-outline"
            onPress={() => navigation.navigate('CreateAd')}
            style={styles.emptyButton}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  centerText: {
    ...typography.bodySmall,
    textAlign: 'center',
    maxWidth: 260,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  typeText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primaryDark,
    flexShrink: 1,
  },
  time: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  title: {
    ...typography.subtitle,
    fontSize: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.bodySmall,
    marginLeft: spacing.xs,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emptyTitle: {
    ...typography.subtitle,
    fontSize: 17,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 260,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
});