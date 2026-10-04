import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  Award,
  CheckCircle,
  Clock,
  LogOut,
  Mail,
  Building,
  Hash,
  ExternalLink,
  Users,
  Sparkles,
  LogIn,
} from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';
import { ItemCard } from '../../src/components/items/ItemCard';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, items, claims, logout, availableDemoUsers, switchDemoUser } = useApp();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="STUDENT PROFILE" subtitle="Campus Identity & Trust Rating" showProfile={false} />
        <View style={styles.notLoggedInCard}>
          <ShieldCheck size={48} color={COLORS.primary} />
          <Text style={styles.notLoggedInTitle}>Not Signed In</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Sign in with your verified campus email or student account to file reports and verify ownership.
          </Text>
          <TouchableOpacity
            style={styles.signInRedirectBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <LogIn size={16} color="#FFF" />
            <Text style={styles.signInRedirectText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userItems = items.filter((i) => i.user_id === currentUser.id);
  const completedHandovers = claims.filter((c) => Boolean(c.handover_confirmed_at)).length;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="STUDENT PROFILE" subtitle="Campus Identity & Trust Rating" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Identity Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }}
            style={styles.avatar}
          />

          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentUser.name}</Text>
              <View style={styles.verifiedTag}>
                <ShieldCheck size={12} color="#FFF" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Hash size={13} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{currentUser.student_id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Mail size={13} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{currentUser.email}</Text>
            </View>

            {currentUser.department && (
              <View style={styles.detailRow}>
                <Building size={13} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{currentUser.department}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Campus Trust Score Meter */}
        <View style={styles.trustScoreCard}>
          <View style={styles.trustHeader}>
            <View style={styles.trustTitleGroup}>
              <Award size={20} color={COLORS.found} />
              <Text style={styles.trustTitle}>Campus Trust Score</Text>
            </View>
            <Text style={styles.trustScoreNum}>{currentUser.trust_score}%</Text>
          </View>

          <View style={styles.scoreBarTrack}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${currentUser.trust_score || 95}%` },
              ]}
            />
          </View>

          <Text style={styles.trustNote}>
            Tier 1 Student: High community reliability. Double-blind verification accuracy rating is in the top 5% on campus.
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{userItems.length}</Text>
            <Text style={styles.statLabel}>Reports Filed</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>{completedHandovers + 1}</Text>
            <Text style={styles.statLabel}>Handovers</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Resolution</Text>
          </View>
        </View>

        {/* Switch Campus Role (Interactive Testing) */}
        <View style={styles.roleSwitchCard}>
          <View style={styles.roleSwitchHeader}>
            <Users size={16} color={COLORS.primary} />
            <Text style={styles.roleSwitchTitle}>Switch Campus Account (For Testing)</Text>
          </View>
          <Text style={styles.roleSwitchDesc}>
            Test the double-blind verification workflow from different perspectives:
          </Text>

          <View style={styles.roleList}>
            {availableDemoUsers.map((u) => {
              const isSelected = u.id === currentUser.id;
              return (
                <TouchableOpacity
                  key={u.id}
                  style={[
                    styles.roleChip,
                    isSelected && styles.roleChipSelected,
                  ]}
                  onPress={() => switchDemoUser(u.id)}
                >
                  <Sparkles size={12} color={isSelected ? '#FFF' : COLORS.primary} />
                  <Text
                    style={[
                      styles.roleChipText,
                      isSelected && styles.roleChipTextSelected,
                    ]}
                  >
                    {u.name} ({u.department?.split(' ')[0] || 'Member'})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* My Reports */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Reported Items ({userItems.length})</Text>
        </View>

        {userItems.length > 0 ? (
          userItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/item/${item.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyReportsBox}>
            <Text style={styles.emptyReportsText}>You have not filed any reports under this account yet.</Text>
          </View>
        )}

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <LogOut size={16} color={COLORS.danger} />
          <Text style={styles.signOutText}>Log Out of RETRIVO</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.found,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  trustScoreCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trustTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trustScoreNum: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.found,
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: COLORS.found,
    borderRadius: RADIUS.full,
  },
  trustNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  roleSwitchCard: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    marginBottom: SPACING.md,
  },
  roleSwitchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roleSwitchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  roleSwitchDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 15,
  },
  roleList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roleChipTextSelected: {
    color: '#FFF',
  },
  sectionHeader: {
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyReportsBox: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  emptyReportsText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: SPACING.md,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  notLoggedInCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: 12,
  },
  notLoggedInTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  notLoggedInSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  signInRedirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginTop: 8,
  },
  signInRedirectText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

