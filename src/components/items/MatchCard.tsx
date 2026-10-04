import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import {
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Camera,
  Compass,
  Calendar,
  Layers,
} from 'lucide-react-native';
import { MatchResult } from '../../types/retrivo';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../styles/theme';

interface MatchCardProps {
  match: MatchResult;
  onInitiateClaim?: () => void;
  onViewDetails?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onInitiateClaim,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { lost_item, found_item, match_score, breakdown, recommended_action } = match;

  if (!lost_item || !found_item) return null;

  const isHighMatch = match_score >= 8.5;
  const isMediumMatch = match_score >= 6.0 && match_score < 8.5;
  const scoreColor = isHighMatch ? COLORS.found : isMediumMatch ? COLORS.lost : COLORS.textMuted;
  const scoreBg = isHighMatch ? COLORS.foundSoft : isMediumMatch ? COLORS.lostSoft : COLORS.divider;
  const scoreBorder = isHighMatch ? COLORS.foundBorder : isMediumMatch ? COLORS.lostBorder : COLORS.border;

  return (
    <View style={styles.card}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.scoreRow}>
          <View style={[styles.scoreBadge, { backgroundColor: scoreBg, borderColor: scoreBorder }]}>
            <Sparkles size={14} color={scoreColor} />
            <Text style={[styles.scoreText, { color: scoreColor }]}>
              {match_score.toFixed(1)} / 10.0 Match
            </Text>
          </View>

          {recommended_action === 'notify_owner' && (
            <View style={styles.verifiedTag}>
              <ShieldCheck size={12} color={COLORS.primary} />
              <Text style={styles.verifiedTagText}>High Probability</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
        >
          <Text style={styles.expandText}>
            {expanded ? 'Hide Signals' : 'View AI Signals'}
          </Text>
          {expanded ? (
            <ChevronUp size={14} color={COLORS.primary} />
          ) : (
            <ChevronDown size={14} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Comparison Grid: Lost vs Found */}
      <View style={styles.comparisonGrid}>
        {/* Lost Item */}
        <View style={styles.itemBox}>
          <View style={[styles.typePill, { backgroundColor: COLORS.lostSoft, borderColor: COLORS.lostBorder }]}>
            <Text style={[styles.typePillText, { color: COLORS.lost }]}>LOST ITEM</Text>
          </View>
          {lost_item.image_url ? (
            <Image source={{ uri: lost_item.image_url }} style={styles.itemImage} />
          ) : (
            <View style={styles.imageFallback} />
          )}
          <Text style={styles.itemTitle} numberOfLines={2}>
            {lost_item.title}
          </Text>
          <View style={styles.metaRow}>
            <MapPin size={11} color={COLORS.primary} />
            <Text style={styles.itemMeta} numberOfLines={1}>
              {lost_item.campus_location.building}
            </Text>
          </View>
        </View>

        {/* Center Connection Arrow */}
        <View style={styles.centerDivider}>
          <View style={styles.arrowCircle}>
            <ArrowRight size={14} color={COLORS.primary} />
          </View>
          <Text style={styles.matchVsText}>PAIRED</Text>
        </View>

        {/* Found Item */}
        <View style={styles.itemBox}>
          <View style={[styles.typePill, { backgroundColor: COLORS.foundSoft, borderColor: COLORS.foundBorder }]}>
            <Text style={[styles.typePillText, { color: COLORS.found }]}>FOUND ITEM</Text>
          </View>
          {found_item.image_url ? (
            <Image source={{ uri: found_item.image_url }} style={styles.itemImage} />
          ) : (
            <View style={styles.imageFallback} />
          )}
          <Text style={styles.itemTitle} numberOfLines={2}>
            {found_item.title}
          </Text>
          <View style={styles.metaRow}>
            <MapPin size={11} color={COLORS.found} />
            <Text style={styles.itemMeta} numberOfLines={1}>
              {found_item.campus_location.building}
            </Text>
          </View>
        </View>
      </View>

      {/* Multimodal Score Breakdown (Expandable) */}
      {expanded && (
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownHeaderRow}>
            <Layers size={13} color={COLORS.primary} />
            <Text style={styles.breakdownTitle}>Multimodal Signal Breakdown</Text>
          </View>

          <View style={styles.signalRow}>
            <View style={styles.signalLabel}>
              <FileText size={13} color={COLORS.textSecondary} />
              <Text style={styles.signalText}>Text & Description (35%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(breakdown.text_score * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.signalValue}>
              {Math.round(breakdown.text_score * 100)}%
            </Text>
          </View>

          <View style={styles.signalRow}>
            <View style={styles.signalLabel}>
              <Camera size={13} color={COLORS.textSecondary} />
              <Text style={styles.signalText}>Visual CLIP Vector (40%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(breakdown.image_score * 100)}%`, backgroundColor: COLORS.found },
                ]}
              />
            </View>
            <Text style={styles.signalValue}>
              {Math.round(breakdown.image_score * 100)}%
            </Text>
          </View>

          <View style={styles.signalRow}>
            <View style={styles.signalLabel}>
              <Compass size={13} color={COLORS.textSecondary} />
              <Text style={styles.signalText}>Location Proximity (15%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(breakdown.location_score * 100)}%`, backgroundColor: '#0284C7' },
                ]}
              />
            </View>
            <Text style={styles.signalValue}>
              {Math.round(breakdown.location_score * 100)}%
            </Text>
          </View>

          <View style={styles.signalRow}>
            <View style={styles.signalLabel}>
              <Calendar size={13} color={COLORS.textSecondary} />
              <Text style={styles.signalText}>Time Temporal Decay (10%)</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(breakdown.time_score * 100)}%`, backgroundColor: COLORS.returned },
                ]}
              />
            </View>
            <Text style={styles.signalValue}>
              {Math.round(breakdown.time_score * 100)}%
            </Text>
          </View>
        </View>
      )}

      {/* Action Footer */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onViewDetails}
        >
          <Text style={styles.secondaryButtonText}>Inspect Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onInitiateClaim}
        >
          <ShieldCheck size={15} color="#FFF" />
          <Text style={styles.primaryButtonText}>Verify & Claim</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  expandText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemBox: {
    flex: 1,
    alignItems: 'center',
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginBottom: 6,
    borderWidth: 1,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  itemImage: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    marginBottom: 6,
    backgroundColor: COLORS.divider,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageFallback: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.divider,
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  itemMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  centerDivider: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  matchVsText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  breakdownContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  signalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 155,
  },
  signalText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.full,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  signalValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
    width: 35,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.sm,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  primaryButton: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOWS.sm,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
});

