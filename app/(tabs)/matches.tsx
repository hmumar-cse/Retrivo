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
import { Sparkles, Brain, Cpu, ArrowUpRight } from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { MatchCard } from '../../src/components/items/MatchCard';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';

export default function MatchesScreen() {
  const router = useRouter();
  const { matches } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="AI MATCHES" subtitle="Multimodal Similarity Engine" />

      {/* Model explanation pill banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Brain size={20} color={COLORS.primary} />
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>4-Signal Multimodal Matching</Text>
          <Text style={styles.bannerSubtitle}>
            Continuous pairing of Lost vs Found assets using Text Embeddings (35%), Visual Features (40%), Campus Spatial Proximity (15%), and Temporal Decay (10%).
          </Text>
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
            <Cpu size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No AI Matches Computed Yet</Text>
            <Text style={styles.emptyText}>
              Once you or other students report lost and found items, the multimodal matcher will calculate similarity coefficients and surface candidates here.
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
    flexDirection: 'row',
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    gap: 12,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 60,
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
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

