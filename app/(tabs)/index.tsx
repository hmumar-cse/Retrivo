import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Filter,
  Sparkles,
  Plus,
  Compass,
  AlertCircle,
  CheckCircle,
  X,
  TrendingUp,
  MapPin,
} from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { ItemCard } from '../../src/components/items/ItemCard';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/styles/theme';
import { ItemCategory, ItemType } from '../../src/types/retrivo';

const CATEGORIES: { label: string; value: ItemCategory | 'all' }[] = [
  { label: 'All Items', value: 'all' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'ID Cards', value: 'identification' },
  { label: 'Keys', value: 'keys' },
  { label: 'Wallets & Bags', value: 'wallets_bags' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Books', value: 'stationery_books' },
  { label: 'Clothing', value: 'clothing' },
];

export default function FeedScreen() {
  const router = useRouter();
  const { items, matches } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ItemType>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesBuilding = item.campus_location.building.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesBuilding;
      }

      return true;
    });
  }, [items, typeFilter, selectedCategory, searchQuery]);

  const lostCount = items.filter((i) => i.type === 'lost').length;
  const foundCount = items.filter((i) => i.type === 'found').length;
  const activeMatchesCount = matches.length;

  return (
    <SafeAreaView style={styles.safe}>
      <Header subtitle="Campus Recovery Feed" />

      {/* Campus Recovery Quick Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <TrendingUp size={14} color={COLORS.primary} />
          <Text style={styles.statText}>
            <Text style={styles.statBold}>{activeMatchesCount}</Text> AI Matches Active
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statText}>
            <Text style={[styles.statBold, { color: COLORS.lost }]}>{lostCount}</Text> Lost
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statText}>
            <Text style={[styles.statBold, { color: COLORS.found }]}>{foundCount}</Text> Found
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items, keywords, buildings..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Segmented Control Switcher */}
      <View style={styles.segmentedControl}>
        {(['all', 'lost', 'found'] as const).map((type) => {
          const isActive = typeFilter === type;
          return (
            <TouchableOpacity
              key={type}
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                isActive && styles.segmentTabActive,
                isActive && type === 'lost' && { backgroundColor: COLORS.lost },
                isActive && type === 'found' && { backgroundColor: COLORS.found },
                isActive && type === 'all' && { backgroundColor: COLORS.primary },
              ]}
              onPress={() => setTypeFilter(type)}
            >
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}
              >
                {type === 'all'
                  ? `All Feed (${items.length})`
                  : type === 'lost'
                  ? `Lost (${lostCount})`
                  : `Found (${foundCount})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category Horizontal Pills */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.8}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Items Feed List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const matchCount = matches.filter(
            (m) => m.lost_item_id === item.id || m.found_item_id === item.id
          ).length;

          return (
            <ItemCard
              item={item}
              matchCount={matchCount}
              onPress={() => router.push(`/item/${item.id}`)}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Sparkles size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Campus Items Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or report a new lost or found item.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push('/(tabs)/report')}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.emptyActionText}>Report an Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/report')}
      >
        <Plus size={26} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  statText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statBold: {
    fontWeight: '900',
    color: COLORS.primary,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  segmentTabActive: {
    ...SHADOWS.sm,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  categoryContainer: {
    marginVertical: 4,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    paddingBottom: 2,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primaryBorder,
  },
  categoryPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginTop: 6,
    ...SHADOWS.sm,
  },
  emptyActionText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
});
