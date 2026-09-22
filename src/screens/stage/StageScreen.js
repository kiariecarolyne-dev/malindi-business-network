import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AdCard from '../../components/AdCard';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { onActiveBusinesses } from '../../services/businessService';
import { onActiveAdvertisements } from '../../services/advertisementService';
import { AD_TYPES } from '../../utils/adTypes';
import { businessCanAdvertise } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

const FILTERS = [{ key: 'all', label: 'All' }, ...AD_TYPES];

// The heart of the Network: a live feed of every active advertisement posted
// by subscribed Malindi businesses. Filter by advertisement type with the
// chip row; tapping a card opens the full post, "View Business" opens the
// business profile, and the contact buttons call or WhatsApp instantly.
export default function StageScreen({ navigation }) {
  const { currentUser, userProfile, isBusiness } = useAuth();

  const [ads, setAds] = useState([]);
  const [businessMap, setBusinessMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const canAdvertise = isBusiness ? businessCanAdvertise(userProfile) : false;

  useEffect(() => {
    const unsubAds = onActiveAdvertisements((list) => {
      setAds(list);
      setLoading(false);
    });
    const unsubBiz = onActiveBusinesses((list) => {
      const map = {};
      for (const biz of list) map[biz.businessId] = biz;
      setBusinessMap(map);
    });
    return () => {
      unsubAds();
      unsubBiz();
    };
  }, []);

  const visibleAds = useMemo(() => {
    if (filter === 'all') return ads;
    return ads.filter((ad) => ad.type === filter);
  }, [ads, filter]);

  const openAd = (ad) => navigation.navigate('AdDetail', { adId: ad.adId });
  const openBusiness = (ad) =>
    navigation.navigate('BusinessDetail', { businessId: ad.businessId });

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Business Stage</Text>
          <Text style={styles.subtitle}>Live feed of Malindi businesses</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={() => navigation.navigate('MyAds')}
          >
            <Ionicons name="list-outline" size={22} color={colors.primaryDark} />
          </TouchableOpacity>
          {canAdvertise ? (
            <PrimaryButton
              title="Post"
              icon="add-circle-outline"
              onPress={() => navigation.navigate('CreateAd')}
              style={styles.postButton}
            />
          ) : null}
        </View>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator={false}>
        {FILTERS.map((item) => {
          const selected = item.key === filter;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : visibleAds.length === 0 ? (
        <View style={styles.emptyWrap}>
          {ads.length === 0 ? (
            <>
              <Ionicons name="storefront-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>The Stage is empty</Text>
              <Text style={styles.emptyText}>
                No businesses have advertised yet. Check back soon.{' '}
                {canAdvertise
                  ? 'You can be the first - post your advertisement now.'
                  : ''}
              </Text>
              {canAdvertise ? (
                <PrimaryButton
                  title="Post Advertisement"
                  icon="add-circle-outline"
                  onPress={() => navigation.navigate('CreateAd')}
                  style={styles.emptyButton}
                />
              ) : null}
            </>
          ) : (
            <>
              <Ionicons name="funnel-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No {filter} posts</Text>
              <Text style={styles.emptyText}>
                Try another advertisement type or view all posts.
              </Text>
              <PrimaryButton
                title="Show All"
                variant="outline"
                onPress={() => setFilter('all')}
                style={styles.emptyButton}
              />
            </>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.feed} showsVerticalScrollIndicator={false}>
          {visibleAds.map((ad) => (
            <AdCard
              key={ad.adId}
              ad={ad}
              business={businessMap[ad.businessId]}
              onPress={() => openAd(ad)}
              onViewBusiness={() => openBusiness(ad)}
            />
          ))}
          <Text style={styles.footerNote}>
            {visibleAds.length} active advertisement{visibleAds.length === 1 ? '' : 's'}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.title,
    fontSize: 20,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  postButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filters: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterLabelSelected: {
    color: colors.white,
  },
  feed: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.subtitle,
    fontSize: 18,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
  footerNote: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});