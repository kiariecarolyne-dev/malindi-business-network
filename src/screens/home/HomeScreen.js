import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BrandHeader from '../../components/BrandHeader';
import AdCard from '../../components/AdCard';
import BusinessCard from '../../components/BusinessCard';
import PrimaryButton from '../../components/PrimaryButton';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { useAuth } from '../../context/AuthContext';
import { onActiveBusinesses } from '../../services/businessService';
import { onActiveAdvertisements } from '../../services/advertisementService';
import { businessCanAdvertise, isSubscribed } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Home tab: welcome, quick paths into the three core parts of the Network
// (Business Stage, Discover, and the business dashboard), and previews of
// the most recent advertisements and businesses.
export default function HomeScreen({ navigation, goToTab }) {
  const { currentUser, userProfile, isBusiness, isMember } = useAuth();

  const [ads, setAds] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [businessMap, setBusinessMap] = useState({});
  const [loading, setLoading] = useState(true);

  const subscribed = isBusiness ? isSubscribed(userProfile) : false;
  const canAdvertise = isBusiness ? businessCanAdvertise(userProfile) : false;

  useEffect(() => {
    const unsubAds = onActiveAdvertisements((list) => {
      setAds(list);
      setLoading(false);
    }, 6);
    const unsubBiz = onActiveBusinesses((list) => {
      setBusinesses(list);
      const map = {};
      for (const biz of list) map[biz.businessId] = biz;
      setBusinessMap(map);
    });
    return () => {
      unsubAds();
      unsubBiz();
    };
  }, []);

  const openAd = (ad) => navigation.navigate('AdDetail', { adId: ad.adId });
  const openBusiness = (biz) =>
    navigation.navigate('BusinessDetail', { businessId: biz.businessId });
  const openAdBusiness = (ad) => {
    const biz = ad.businessId ? businessMap[ad.businessId] : null;
    if (biz) openBusiness(biz);
    else navigation.navigate('BusinessDetail', { businessId: ad.businessId });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerPad}>
          <BrandHeader size="small" />
        </View>

        <Text style={styles.greeting}>
          Karibu{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}!
        </Text>
        <Text style={styles.intro}>
          Discover Malindi businesses, advertise on the Business Stage, and
          connect directly with customers and partners.
        </Text>

        <View style={styles.ctaRow}>
          <Pressable style={[styles.ctaCard, { backgroundColor: colors.primaryLight }]} onPress={() => goToTab('stage')}>
            <Ionicons name="storefront-outline" size={22} color={colors.primaryDark} />
            <Text style={styles.ctaTitle}>Business Stage</Text>
            <Text style={styles.ctaSub}>See what Malindi is advertising</Text>
          </Pressable>
          <Pressable style={[styles.ctaCard, { backgroundColor: colors.primaryLight }]} onPress={() => goToTab('discover')}>
            <Ionicons name="search-outline" size={22} color={colors.primaryDark} />
            <Text style={styles.ctaTitle}>Discover</Text>
            <Text style={styles.ctaSub}>Find businesses by category</Text>
          </Pressable>
        </View>

        {isMember ? (
          <View style={styles.inviteCard}>
            <Ionicons name="megaphone-outline" size={20} color={colors.primaryDark} />
            <View style={styles.inviteTextWrap}>
              <Text style={styles.inviteTitle}>Own a business?</Text>
              <Text style={styles.inviteText}>
                Advertise it on the Business Stage for only KSh 100/month and
                reach customers across Malindi.
              </Text>
            </View>
          </View>
        ) : isBusiness ? (
          <View style={styles.businessCard}>
            <View style={styles.businessRow}>
              <ImagePlaceholder icon="storefront-outline" iconSize={20} style={styles.businessIcon} />
              <View style={styles.businessTextWrap}>
                <Text style={styles.businessTitle}>
                  {canAdvertise ? 'Your Business is Live' : 'Subscription Required'}
                </Text>
                <Text style={styles.businessSub}>
                  {canAdvertise
                    ? 'Reach customers and partners across Malindi.'
                    : subscribed
                      ? 'Your subscription area is ready on your dashboard.'
                      : 'Activate your membership to post advertisements.'}
                </Text>
              </View>
            </View>
            <View style={styles.businessButtons}>
              {canAdvertise ? (
                <PrimaryButton
                  title="Post Advertisement"
                  icon="add-circle-outline"
                  onPress={() => navigation.navigate('CreateAd')}
                />
              ) : null}
              <PrimaryButton
                title="Manage My Business"
                variant={canAdvertise ? 'outline' : 'primary'}
                icon="settings-outline"
                onPress={() => navigation.navigate('BusinessDashboard')}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest on the Business Stage</Text>
          <Pressable onPress={() => goToTab('stage')}>
            <Text style={styles.sectionAction}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : ads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="megaphone-outline" size={30} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No advertisements yet</Text>
            <Text style={styles.emptyText}>
              Be the first business to advertise on the Malindi Business
              Network.
            </Text>
          </View>
        ) : (
          ads.map((ad) => (
            <AdCard
              key={ad.adId}
              ad={ad}
              business={businessMap[ad.businessId]}
              onPress={() => openAd(ad)}
              onViewBusiness={() => openAdBusiness(ad)}
            />
          ))
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Businesses in Malindi</Text>
          <Pressable onPress={() => goToTab('discover')}>
            <Text style={styles.sectionAction}>Discover all</Text>
          </Pressable>
        </View>

        {businesses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="business-outline" size={30} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No businesses listed yet</Text>
          </View>
        ) : (
          businesses.slice(0, 3).map((biz) => (
            <BusinessCard key={biz.businessId} business={biz} onPress={() => openBusiness(biz)} />
          ))
        )}
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
    paddingBottom: spacing.lg,
  },
  headerPad: {
    paddingTop: spacing.sm,
  },
  greeting: {
    ...typography.title,
    fontSize: 20,
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
    marginHorizontal: spacing.md,
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  ctaCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  ctaTitle: {
    ...typography.subtitle,
    fontSize: 15,
    marginTop: spacing.sm,
  },
  ctaSub: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  inviteTextWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  inviteTitle: {
    ...typography.subtitle,
    fontSize: 15,
  },
  inviteText: {
    ...typography.bodySmall,
    marginTop: 2,
    lineHeight: 18,
  },
  businessCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  businessTextWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  businessTitle: {
    ...typography.subtitle,
    fontSize: 15,
  },
  businessSub: {
    ...typography.bodySmall,
    marginTop: 2,
    lineHeight: 18,
  },
  businessButtons: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 17,
  },
  sectionAction: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  loader: {
    marginTop: spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
  },
  emptyTitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: 4,
  },
});