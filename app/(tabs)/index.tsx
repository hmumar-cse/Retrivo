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
import { Search, Filter, Sparkles, Plus } from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { ItemCard } from '../../src/components/items/ItemCard';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';
import { ItemCategory, ItemType } from '../../src/types/retrivo';

const CATEGORIES: { label: string; value: ItemCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
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
      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Search query
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

  return (
    <SafeAreaView style={styles.safe}>
      <Header subtitle="Campus Recovery Feed" />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items, keywords, buildings..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Segmented Type Control: ALL | LOST | FOUND */}
      <View style={styles.segmentedControl}>
        {(['all', 'lost', 'found'] as const).map((type) => {
          const isActive = typeFilter === type;
          return (
            <TouchableOpacity
              key={type}
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
                {type === 'all' ? 'All Feed' : type === 'lost' ? 'Lost Items' : 'Found Items'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category Filter Pills */}
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

      {/* Main List */}
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
            <Sparkles size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Campus Items Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or report a new lost or found item.
            </Text>
          </View>
        }
      />

      {/* Floating Action Button for Fast Report */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/report')}
      >
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
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
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: '#FFF',
  },
  categoryContainer: {
    marginBottom: SPACING.xs,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
    paddingBottom: SPACING.xs,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primaryLight,
  },
  categoryPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});

