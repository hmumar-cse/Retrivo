import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Clock,
  Lock,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Laptop,
  CreditCard,
  Key,
  Briefcase,
  Shirt,
  BookOpen,
  Watch,
  Package,
} from 'lucide-react-native';
import { CampusItem, ItemCategory } from '../../types/retrivo';
import { COLORS, SPACING, RADIUS } from '../../styles/theme';

interface ItemCardProps {
  item: CampusItem;
  matchCount?: number;
  onPress?: () => void;
}

const getCategoryIcon = (category: ItemCategory, color: string) => {
  const size = 16;
  switch (category) {
    case 'electronics':
      return <Laptop size={size} color={color} />;
    case 'identification':
      return <CreditCard size={size} color={color} />;
    case 'keys':
      return <Key size={size} color={color} />;
    case 'wallets_bags':
      return <Briefcase size={size} color={color} />;
    case 'clothing':
      return <Shirt size={size} color={color} />;
    case 'stationery_books':
      return <BookOpen size={size} color={color} />;
    case 'accessories':
      return <Watch size={size} color={color} />;
    default:
      return <Package size={size} color={color} />;
  }
};

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, matchCount = 0, onPress }) => {
  const isLost = item.type === 'lost';
  const typeColor = isLost ? COLORS.lost : COLORS.found;
  const typeBg = isLost ? COLORS.lostSoft : COLORS.foundSoft;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            {getCategoryIcon(item.category, COLORS.textSecondary)}
            <Text style={styles.categoryText}>
              {item.category.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Status indicator */}
        <View style={[
          styles.statusBadge,
          item.status === 'returned' && { backgroundColor: COLORS.returnedSoft },
          item.status === 'under_verification' && { backgroundColor: COLORS.verifiedSoft },
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'returned' && { color: COLORS.returned },
            item.status === 'under_verification' && { color: COLORS.verified },
          ]}>
            {item.status === 'under_verification' ? 'In Verification' : item.status}
          </Text>
        </View>
      </View>

      <View style={styles.bodyRow}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Package size={28} color={COLORS.textMuted} />
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.metaRow}>
            <MapPin size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.campus_location.building}
              {item.campus_location.floor_or_room ? ` • ${item.campus_location.floor_or_room}` : ''}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Clock size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
        </View>
      </View>

      {/* Footer highlighting AI match and Hidden clue security */}
      <View style={styles.footerRow}>
        <View style={styles.securityHint}>
          <Lock size={12} color={COLORS.textMuted} />
          <Text style={styles.securityText}>Hidden clue protected</Text>
        </View>

        {matchCount > 0 ? (
          <View style={styles.matchBadge}>
            <Sparkles size={12} color={COLORS.primary} />
            <Text style={styles.matchText}>{matchCount} AI Match{matchCount > 1 ? 'es' : ''}</Text>
          </View>
        ) : (
          <ChevronRight size={16} color={COLORS.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.divider,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.divider,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  securityHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

