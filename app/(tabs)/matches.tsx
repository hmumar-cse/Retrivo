import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Brain, Cpu, ArrowUpRight, Zap, Target } from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { MatchCard } from '../../src/components/items/MatchCard';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/styles/theme';

export default function MatchesScreen() {
  const router = useRouter();
  const { matches } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="AI MATCHES" subtitle="Multimodal Similarity Engine" />

      {/* Model explanation pill banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTopRow}>
          <View style={styles.bannerIcon}>
            <Brain size={20} color="#FFF" />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>4-Signal Multimodal Matching Engine</Text>
            <Text style={styles.bannerSubtitle}>
              Continuous AI cross-referencing between reported lost and found campus assets.
            </Text>
          </View>
        </View>

        {/* 4 Weights Breakdown Pills */}
        <View style={styles.weightsRow}>
          <View style={styles.weightPill}>
            <Text style={styles.weightLabel}>Visual CLIP</Text>
            <Text style={styles.weightVal}>40%</Text>
          </View>
          <View style={styles.weightPill}>
            <Text style={styles.weightLabel}>Text Vector</Text>
            <Text style={styles.weightVal}>35%</Text>
          </View>
          <View style={styles.weightPill}>
            <Text style={styles.weightLabel}>Campus Geo</Text>
            <Text style={styles.weightVal}>15%</Text>
          </View>
          <View style={styles.weightPill}>
            <Text style={styles.weightLabel}>Time Decay</Text>
            <Text style={styles.weightVal}>10%</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => `${item.lost_item_id}_${item.found_item_id}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onViewDetails={() => {
              if (item.found_item_id) {
                router.push(`/item/${item.found_item_id}`);
              }
            }}
            onInitiateClaim={() => {
              if (item.found_item_id) {
                router.push(`/item/${item.found_item_id}`);
              }
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Cpu size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No AI Matches Computed Yet</Text>
            <Text style={styles.emptyText}>
              Once you or other campus members report lost and found items, the multimodal matcher will calculate similarity coefficients and surface candidates here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  banner: {
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.sm,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  weightsRow: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  weightPill: {
    flex: 1,
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  weightLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  weightVal: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
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
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
