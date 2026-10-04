import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  QrCode,
} from 'lucide-react-native';
import { ClaimVerification, CampusItem } from '../../types/retrivo';
import { COLORS, SPACING, RADIUS } from '../../styles/theme';
import { useApp } from '../../context/AppContext';

interface ClaimCardProps {
  claim: ClaimVerification;
  item?: CampusItem;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, item }) => {
  const { currentUser, verifyClaim, confirmHandover } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [showTrueClue, setShowTrueClue] = useState(false);
  const [handoverFeedback, setHandoverFeedback] = useState<string | null>(null);

  const isReporter = currentUser ? item?.user_id === currentUser.id : false;
  const isClaimant = currentUser ? claim.claimant_id === currentUser.id : false;

  const handleApprove = () => {
    verifyClaim(claim.id, true);
  };

  const handleReject = () => {
    verifyClaim(claim.id, false);
  };

  const handleConfirmHandover = () => {
    if (!pinInput.trim()) {
      const msg = 'Please enter the 6-digit Handover PIN';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Missing PIN', msg);
      return;
    }

    const result = confirmHandover(claim.id, pinInput);
    setHandoverFeedback(result.message);
    if (result.success) {
      setPinInput('');
    }
  };

  const isVerified = claim.status === 'verified';
  const isReturned = Boolean(claim.handover_confirmed_at);

  return (
    <View style={styles.card}>
      {/* Status banner */}
      <View style={styles.header}>
        <View style={styles.statusRow}>
          {isReturned ? (
            <View style={[styles.statusPill, { backgroundColor: COLORS.returnedSoft }]}>
              <CheckCircle2 size={13} color={COLORS.returned} />
              <Text style={[styles.statusPillText, { color: COLORS.returned }]}>
                HANDOVER COMPLETED
              </Text>
            </View>
          ) : isVerified ? (
            <View style={[styles.statusPill, { backgroundColor: COLORS.foundSoft }]}>
              <ShieldCheck size={13} color={COLORS.found} />
              <Text style={[styles.statusPillText, { color: COLORS.found }]}>
                OWNERSHIP VERIFIED
              </Text>
            </View>
          ) : (
            <View style={[styles.statusPill, { backgroundColor: COLORS.lostSoft }]}>
              <Clock size={13} color={COLORS.lost} />
              <Text style={[styles.statusPillText, { color: COLORS.lost }]}>
                PENDING PROOF REVIEW
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.dateText}>
          {new Date(claim.created_at || Date.now()).toLocaleDateString()}
        </Text>
      </View>

      {/* Item info */}
      <Text style={styles.itemTitle}>{item?.title || 'Reported Campus Asset'}</Text>

      {/* Claimant Details */}
      <View style={styles.claimantInfo}>
        <User size={14} color={COLORS.textSecondary} />
        <Text style={styles.claimantText}>
          Claimant: <Text style={styles.bold}>{claim.claimant?.name || 'Verified Student'}</Text>
          {claim.claimant?.student_id ? ` (${claim.claimant.student_id})` : ''}
        </Text>
      </View>

      {/* Hidden Ownership Challenge & Response Box */}
      <View style={styles.proofContainer}>
        <Text style={styles.proofSectionTitle}>Hidden Detail Ownership Challenge:</Text>

        <View style={styles.proofBox}>
          <Text style={styles.proofLabel}>Claimant's Submitted Proof:</Text>
          <Text style={styles.proofAnswer}>"{claim.proof_answer}"</Text>
        </View>

        {/* If user is the item reporter, they can compare with the true hidden clue */}
        {isReporter && item?.hidden_clue && (
          <View style={styles.hiddenClueCompareBox}>
            <View style={styles.revealRow}>
              <Text style={styles.trueClueLabel}>Your Private Hidden Clue (Secret):</Text>
              <TouchableOpacity
                onPress={() => setShowTrueClue(!showTrueClue)}
                style={styles.revealBtn}
              >
                {showTrueClue ? (
                  <EyeOff size={13} color={COLORS.primary} />
                ) : (
                  <Eye size={13} color={COLORS.primary} />
                )}
                <Text style={styles.revealText}>
                  {showTrueClue ? 'Hide' : 'Reveal'}
                </Text>
              </TouchableOpacity>
            </View>

            {showTrueClue ? (
              <Text style={styles.trueClueText}>{item.hidden_clue}</Text>
            ) : (
              <Text style={styles.hiddenPlaceholder}>••••••••••••••••••••••••••••••••</Text>
            )}
          </View>
        )}
      </View>

      {/* Review Actions for Reporter */}
      {!isVerified && !isReturned && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={handleReject}
          >
            <ShieldAlert size={14} color={COLORS.danger} />
            <Text style={[styles.btnText, { color: COLORS.danger }]}>Decline Claim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.approveBtn]}
            onPress={handleApprove}
          >
            <ShieldCheck size={14} color="#FFF" />
            <Text style={[styles.btnText, { color: '#FFF' }]}>Verify Ownership</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Handover Verification Protocol */}
      {isVerified && !isReturned && (
        <View style={styles.handoverContainer}>
          <View style={styles.handoverHeader}>
            <KeyRound size={16} color={COLORS.primary} />
            <Text style={styles.handoverTitle}>Physical Handover Verification</Text>
          </View>

          <Text style={styles.handoverExplainer}>
            Meet safely on campus (e.g. Campus Security or Library Desk). Show or enter the One-Time Handover PIN to conclude the return:
          </Text>

          {/* Secure One-Time PIN Display */}
          <View style={styles.pinDisplayBox}>
            <Text style={styles.pinLabel}>ONE-TIME HANDOVER PIN</Text>
            <Text style={styles.pinCode}>{claim.handover_code || '492-183'}</Text>
            <Text style={styles.pinSubtext}>
              {isClaimant
                ? 'Share this PIN with the finder during physical exchange'
                : 'Ask the claimant for this PIN to verify identity'}
            </Text>
          </View>

          {/* Confirmation Input */}
          <View style={styles.verifyInputRow}>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter PIN (e.g. 849-216)"
              placeholderTextColor={COLORS.textMuted}
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.confirmPinBtn}
              onPress={handleConfirmHandover}
            >
              <Text style={styles.confirmPinBtnText}>Confirm Handover</Text>
            </TouchableOpacity>
          </View>

          {handoverFeedback && (
            <Text style={styles.feedbackText}>{handoverFeedback}</Text>
          )}
        </View>
      )}

      {/* Completed Handover Stamp */}
      {isReturned && (
        <View style={styles.completedBox}>
          <CheckCircle2 size={16} color={COLORS.returned} />
          <Text style={styles.completedText}>
            Handover confirmed on {new Date(claim.handover_confirmed_at || '').toLocaleDateString()}. Asset successfully restored to owner!
          </Text>
        </View>
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  claimantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  claimantText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  proofContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  proofSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  proofBox: {
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  proofLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  proofAnswer: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
  },
  hiddenClueCompareBox: {
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  revealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trueClueLabel: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  revealText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  trueClueText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  hiddenPlaceholder: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.sm,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  approveBtn: {
    backgroundColor: COLORS.primary,
  },
  handoverContainer: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  handoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  handoverTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  handoverExplainer: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  pinDisplayBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginBottom: SPACING.sm,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  pinCode: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 4,
    marginVertical: 4,
  },
  pinSubtext: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  verifyInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pinInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  confirmPinBtn: {
    backgroundColor: COLORS.found,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPinBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 6,
    fontWeight: '600',
  },
  completedBox: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.returnedSoft,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.returned,
    flex: 1,
  },
});

