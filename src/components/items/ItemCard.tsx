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
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { CampusItem, ItemCategory } from '../../types/retrivo';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

interface ItemCardProps {
  item: CampusItem;
  matchCount?: number;
  onPress?: () => void;
}

const getCategoryIcon = (category: ItemCategory, color: string) => {
  const size = 13;
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
  const typeBorder = isLost ? COLORS.lostBorder : COLORS.foundBorder;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={onPress}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <View style={[styles.typeBadge, { backgroundColor: typeBg, borderColor: typeBorder }]}>
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

        {/* Status Pill */}
        <View
          style={[
            styles.statusBadge,
            item.status === 'returned' && styles.statusReturned,
            item.status === 'under_verification' && styles.statusVerifying,
          ]}
        >
          {item.status === 'returned' && <CheckCircle2 size={11} color={COLORS.returned} />}
          {item.status === 'under_verification' && <ShieldCheck size={11} color={COLORS.verified} />}
          <Text
            style={[
              styles.statusText,
              item.status === 'returned' && { color: COLORS.returned },
              item.status === 'under_verification' && { color: COLORS.verified },
            ]}
          >
            {item.status === 'under_verification' ? 'In Verification' : item.status}
          </Text>
        </View>
      </View>

      {/* Main Body */}
      <View style={styles.bodyRow}>
        {item.image_url ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Package size={30} color={COLORS.textMuted} />
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Location & Time Pills */}
          <View style={styles.metaRow}>
            <MapPin size={12} color={COLORS.primary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.campus_location.building}
              {item.campus_location.floor_or_room ? ` • ${item.campus_location.floor_or_room}` : ''}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.metaTextTime}>{formatTimeAgo(item.timestamp)}</Text>
          </View>
        </View>
      </View>

      {/* Card Footer: Security & AI Match Status */}
      <View style={styles.footerRow}>
        <View style={styles.securityHint}>
          <Lock size={12} color={COLORS.primary} />
          <Text style={styles.securityText}>Hidden Clue Protected</Text>
        </View>

        {matchCount > 0 ? (
          <View style={styles.matchBadge}>
            <Sparkles size={13} color="#FFF" />
            <Text style={styles.matchText}>
              {matchCount} AI Match{matchCount > 1 ? 'es' : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.inspectHint}>
            <Text style={styles.inspectHintText}>View Details</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </View>
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
    ...SHADOWS.sm,
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
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.divider,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.divider,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusReturned: {
    backgroundColor: COLORS.returnedSoft,
    borderWidth: 1,
    borderColor: COLORS.returnedBorder,
  },
  statusVerifying: {
    backgroundColor: COLORS.verifiedSoft,
    borderWidth: 1,
    borderColor: COLORS.verifiedBorder,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.divider,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  metaTextTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  securityHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  securityText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  inspectHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inspectHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
