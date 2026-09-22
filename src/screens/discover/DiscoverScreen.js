import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BusinessCard from '../../components/BusinessCard';
import { onActiveBusinesses } from '../../services/businessService';
import { BUSINESS_CATEGORIES } from '../../utils/businessCategories';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

// Discover section: browse registered Malindi businesses by category or
// search across name, service/product, description and location. Free for
// every member - no subscription needed to look around.
export default function DiscoverScreen({ navigation }) {
  const [businesses, setBusinesses] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    return onActiveBusinesses((list) => setBusinesses(list));
  }, []);

  const visible = useMemo(() => {
    if (!businesses) return [];
    let list = businesses;
    if (category !== 'all') {
      list = list.filter((biz) => biz.category === category);
    }
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter((biz) => {
        const haystack = [
          biz.businessName,
          biz.description,
          biz.category,
          biz.location,
          biz.ownerName,
          ...(Array.isArray(biz.productsServices) ? biz.productsServices : []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      });
    }
    return list;
  }, [businesses, query, category]);

  const openBusiness = (biz) =>
    navigation.navigate('BusinessDetail', { businessId: biz.businessId });

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>
          Search Malindi businesses by name, service, category or location.
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search businesses…"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {[{ key: 'all', label: 'All Categories' }, ...BUSINESS_CATEGORIES.map((c) => ({ key: c, label: c }))].map(
            (item) => {
              const selected = item.key === category;
              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.8}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setCategory(item.key)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>
      </View>

      <View style={styles.resultsWrap}>
        {businesses === null ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : visible.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No businesses found</Text>
            <Text style={styles.emptyText}>
              {query || category !== 'all'
                ? 'Try a different search term or category.'
                : 'Businesses that register will appear here.'}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.count}>
              {visible.length} business{visible.length === 1 ? '' : 'es'}
            </Text>
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {visible.map((biz) => (
                <BusinessCard key={biz.businessId} business={biz} onPress={() => openBusiness(biz)} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 20,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  clearBtn: {
    padding: 4,
  },
  chips: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.white,
  },
  resultsWrap: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  count: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
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
});