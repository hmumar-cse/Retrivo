import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { ShieldCheck, CheckCircle2, Clock, Inbox } from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { ClaimCard } from '../../src/components/claims/ClaimCard';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';

export default function ClaimsScreen() {
  const { claims, items, currentUser } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="VERIFICATION"
        subtitle="Traceable Handover Protocol"
      />

      <View style={styles.infoBanner}>
        <ShieldCheck size={18} color={COLORS.found} />
        <Text style={styles.infoText}>
          Every exchange is gated by double-blind hidden clue verification and confirmed via a 6-digit secure Handover PIN.
        </Text>
      </View>

      <FlatList
        data={claims}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: claim }) => {
          const matchedItem = items.find((i) => i.id === claim.item_id);
          return <ClaimCard claim={claim} item={matchedItem} />;
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Inbox size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Active Claims</Text>
            <Text style={styles.emptySubtitle}>
              When someone files an ownership claim on an item you found, or when you claim an item from the feed, it will appear here for verification.
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
    borderColor: '#A7F3D0',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: 8,
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
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

