import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { ShieldCheck, CheckCircle2, Clock, Inbox, KeyRound } from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { ClaimCard } from '../../src/components/claims/ClaimCard';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/styles/theme';

export default function ClaimsScreen() {
  const { claims, items } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      if (filter === 'pending') return c.status === 'pending';
      if (filter === 'verified') return c.status === 'verified';
      return true;
    });
  }, [claims, filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="VERIFICATION"
        subtitle="Traceable Handover Protocol"
      />

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <ShieldCheck size={18} color={COLORS.found} />
        <Text style={styles.infoText}>
          Every return is verified through double-blind secret clues and finalized via a 6-digit Handover PIN.
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'verified'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab === 'all'
                  ? `All Claims (${claims.length})`
                  : tab === 'pending'
                  ? 'Pending Review'
                  : 'Ready for Handover'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredClaims}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: claim }) => {
          const matchedItem = items.find((i) => i.id === claim.item_id);
          return <ClaimCard claim={claim} item={matchedItem} />;
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <KeyRound size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Claims in This Category</Text>
            <Text style={styles.emptySubtitle}>
              When someone files an ownership claim or when you claim an item from the feed, it will appear here for verification.
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: SPACING.md,
    marginBottom: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.foundSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.foundBorder,
    ...SHADOWS.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
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
    lineHeight: 18,
  },
});

