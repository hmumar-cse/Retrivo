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
} from 'lucide-react-native';
import { MatchResult } from '../../types/retrivo';
import { COLORS, SPACING, RADIUS } from '../../styles/theme';

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

  // Determine badge styling based on score (0-10)
  const isHighMatch = match_score >= 8.5;
  const isMediumMatch = match_score >= 6.0 && match_score < 8.5;
  const scoreColor = isHighMatch ? COLORS.found : isMediumMatch ? COLORS.lost : COLORS.textMuted;
  const scoreBg = isHighMatch ? COLORS.foundSoft : isMediumMatch ? COLORS.lostSoft : COLORS.divider;

  return (
    <View style={styles.card}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.scoreRow}>
          <View style={[styles.scoreBadge, { backgroundColor: scoreBg }]}>
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
            {expanded ? 'Hide Breakdown' : 'View AI Breakdown'}
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
          <View style={[styles.typePill, { backgroundColor: COLORS.lostSoft }]}>
            <Text style={[styles.typePillText, { color: COLORS.lost }]}>LOST</Text>
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
            <MapPin size={11} color={COLORS.textMuted} />
            <Text style={styles.itemMeta} numberOfLines={1}>
              {lost_item.campus_location.building}
            </Text>
          </View>
        </View>

        {/* Center Arrow */}
        <View style={styles.centerDivider}>
          <View style={styles.arrowCircle}>
            <ArrowRight size={14} color={COLORS.primary} />
          </View>
        </View>

        {/* Found Item */}
        <View style={styles.itemBox}>
          <View style={[styles.typePill, { backgroundColor: COLORS.foundSoft }]}>
            <Text style={[styles.typePillText, { color: COLORS.found }]}>FOUND</Text>
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
            <MapPin size={11} color={COLORS.textMuted} />
            <Text style={styles.itemMeta} numberOfLines={1}>
              {found_item.campus_location.building}
            </Text>
          </View>
        </View>
      </View>

      {/* Multimodal Score Breakdown (Expandable) */}
      {expanded && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Multimodal Signal Breakdown</Text>

          <View style={styles.signalRow}>
            <View style={styles.signalLabel}>
              <FileText size={13} color={COLORS.textSecondary} />
              <Text style={styles.signalText}>Text & Semantic Match</Text>
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
              <Text style={styles.signalText}>Visual Feature Match</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(breakdown.image_score * 100)}%` },
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
              <Text style={styles.signalText}>Location Proximity</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(breakdown.location_score * 100)}%` },
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
              <Text style={styles.signalText}>Time Temporal Decay</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(breakdown.time_score * 100)}%` },
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
          <ShieldCheck size={14} color="#FFF" />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expandText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  comparisonGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  itemBox: {
    flex: 1,
    alignItems: 'center',
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginBottom: 6,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm,
    marginBottom: 6,
    backgroundColor: COLORS.divider,
  },
  imageFallback: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.divider,
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  itemMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  centerDivider: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
    width: 140,
  },
  signalText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 6,
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
    fontWeight: '700',
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
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  primaryButton: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});

