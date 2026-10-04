import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  Package,
  Eye,
  EyeOff,
  Send,
  X,
} from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';
import { ClaimCard } from '../../src/components/claims/ClaimCard';
import { MatchCard } from '../../src/components/items/MatchCard';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItemById, currentUser, submitClaim, getClaimsForItem, getMatchesForItem } = useApp();

  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [proofAnswer, setProofAnswer] = useState('');
  const [showReporterClue, setShowReporterClue] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const item = getItemById(id || '');

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Item not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = currentUser ? item.user_id === currentUser.id : false;
  const isLost = item.type === 'lost';
  const typeColor = isLost ? COLORS.lost : COLORS.found;
  const typeBg = isLost ? COLORS.lostSoft : COLORS.foundSoft;

  const itemClaims = getClaimsForItem(item.id);
  const itemMatches = getMatchesForItem(item.id);

  const handleClaimSubmit = () => {
    if (!proofAnswer.trim()) {
      const msg = 'Please describe the hidden ownership detail to verify your claim.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Missing Proof', msg);
      return;
    }

    const res = submitClaim(item.id, proofAnswer.trim());
    if (res.success) {
      setClaimModalVisible(false);
      setProofAnswer('');
      setFeedback('Claim submitted successfully! Check the Claims tab to monitor verification.');
      if (Platform.OS === 'web') alert(res.message);
      else Alert.alert('Claim Submitted', res.message);
    } else {
      if (Platform.OS === 'web') alert(res.message);
      else Alert.alert('Notice', res.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Package size={50} color={COLORS.textMuted} />
          </View>
        )}

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>

          <View style={styles.catBadge}>
            <Text style={styles.catText}>{item.category.replace('_', ' ')}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Campus Location Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.cardHeaderTitle}>Campus Venue & Time</Text>
          </View>

          <Text style={styles.locationMain}>{item.campus_location.building}</Text>
          {item.campus_location.floor_or_room && (
            <Text style={styles.locationSub}>{item.campus_location.floor_or_room}</Text>
          )}

          <View style={styles.timeRow}>
            <Clock size={13} color={COLORS.textMuted} />
            <Text style={styles.timeText}>
              Reported on {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Hidden Clue Security Vault Section */}
        <View style={[styles.sectionCard, styles.vaultCard]}>
          <View style={styles.vaultHeader}>
            <Lock size={16} color={COLORS.primaryDark} />
            <Text style={styles.vaultTitle}>RETRIVO Zero-Trust Clue Vault</Text>
          </View>

          {isOwner ? (
            <View>
              <Text style={styles.vaultOwnerNote}>
                You reported this item. This private detail is hidden from all public viewers:
              </Text>
              <View style={styles.clueBox}>
                <View style={styles.clueTop}>
                  <Text style={styles.clueBoxLabel}>Your Registered Secret Detail:</Text>
                  <TouchableOpacity
                    onPress={() => setShowReporterClue(!showReporterClue)}
                    style={styles.revealRow}
                  >
                    {showReporterClue ? (
                      <EyeOff size={13} color={COLORS.primary} />
                    ) : (
                      <Eye size={13} color={COLORS.primary} />
                    )}
                    <Text style={styles.revealLabel}>
                      {showReporterClue ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showReporterClue ? (
                  <Text style={styles.clueAnswerText}>{item.hidden_clue}</Text>
                ) : (
                  <Text style={styles.clueHiddenDots}>••••••••••••••••••••••••••••</Text>
                )}
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.vaultPublicNote}>
                This asset has a confidential identifier (e.g. engraving, sticker, inside damage). Only the true owner can describe it during claim verification.
              </Text>
            </View>
          )}
        </View>

        {/* CTA: Claim or Action */}
        {!isOwner && item.status !== 'returned' && (
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => setClaimModalVisible(true)}
          >
            <ShieldCheck size={18} color="#FFF" />
            <Text style={styles.claimButtonText}>Claim Ownership of This Item</Text>
          </TouchableOpacity>
        )}

        {feedback && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Existing Claims Section (for item owner) */}
        {isOwner && itemClaims.length > 0 && (
          <View style={styles.claimsSection}>
            <Text style={styles.sectionHeading}>
              Active Claims on Your Report ({itemClaims.length})
            </Text>
            {itemClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} item={item} />
            ))}
          </View>
        )}

        {/* Multimodal Matches Section */}
        {itemMatches.length > 0 && (
          <View style={styles.matchesSection}>
            <View style={styles.matchHeaderRow}>
              <Sparkles size={16} color={COLORS.primary} />
              <Text style={styles.sectionHeading}>
                AI Multimodal Match Candidates ({itemMatches.length})
              </Text>
            </View>
            {itemMatches.map((m) => (
              <MatchCard
                key={`${m.lost_item_id}_${m.found_item_id}`}
                match={m}
                onInitiateClaim={() => setClaimModalVisible(true)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Claim Modal: Hidden Ownership Detail Challenge */}
      <Modal
        visible={claimModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setClaimModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <ShieldCheck size={18} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Ownership Verification</Text>
              </View>
              <TouchableOpacity onPress={() => setClaimModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalExplainer}>
              To prevent theft or false claims, answer the secret detail test:
            </Text>

            <View style={styles.questionBox}>
              <Lock size={14} color={COLORS.primaryDark} />
              <Text style={styles.questionText}>
                Describe any private identifying mark, engraving, lock screen, sticker, or contents that only the true owner would know:
              </Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. There is a small blue star sticker under the handle, or the lock screen is a photo of my dog..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={proofAnswer}
              onChangeText={setProofAnswer}
            />

            <TouchableOpacity style={styles.submitModalBtn} onPress={handleClaimSubmit}>
              <Send size={16} color="#FFF" />
              <Text style={styles.submitModalBtnText}>Submit Proof to Reporter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navBtn: {
    padding: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  heroPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  catBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  catText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  locationMain: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  vaultCard: {
    backgroundColor: '#FAF5FF',
    borderColor: COLORS.primaryLight,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  vaultTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  vaultOwnerNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  vaultPublicNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  clueBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clueBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  revealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  revealLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  clueAnswerText: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  clueHiddenDots: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    gap: 8,
    marginVertical: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  feedbackBanner: {
    backgroundColor: COLORS.foundSoft,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  feedbackText: {
    fontSize: 12,
    color: COLORS.found,
    fontWeight: '700',
  },
  claimsSection: {
    marginTop: SPACING.md,
  },
  matchesSection: {
    marginTop: SPACING.md,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalExplainer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  questionBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  questionText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
    lineHeight: 16,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  submitModalBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitModalBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

