import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
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
  Camera,
  Edit3,
  Phone,
  X,
  Check,
  User,
} from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';
import { ItemCard } from '../../src/components/items/ItemCard';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', // Student woman
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', // Student man with curls
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', // Officer Ramirez / Professional
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', // Student woman smiling
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', // Student man jacket
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', // Student with glasses
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400', // Casual student
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', // Student portrait
];

export default function ProfileScreen() {
  const router = useRouter();
  const {
    currentUser,
    items,
    claims,
    logout,
    updateProfile,
    availableDemoUsers,
    switchDemoUser,
  } = useApp();

  // Edit Profile Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenEditModal = () => {
    if (currentUser) {
      setName(currentUser.name || '');
      setStudentId(currentUser.student_id || '');
      setDepartment(currentUser.department || '');
      setPhoneNumber(currentUser.phone_number || '');
      setAvatarUrl(
        currentUser.avatar_url ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
      );
      setCustomUrl('');
      setModalVisible(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      const msg = 'Name cannot be empty.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Invalid Input', msg);
      return;
    }

    setSaving(true);
    const finalAvatar = customUrl.trim() ? customUrl.trim() : avatarUrl;

    const res = await updateProfile({
      name: name.trim(),
      student_id: studentId.trim(),
      department: department.trim(),
      phone_number: phoneNumber.trim(),
      avatar_url: finalAvatar,
    });

    setSaving(false);
    setModalVisible(false);

    if (Platform.OS === 'web') alert(res.message);
    else Alert.alert('Success', res.message);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header
          title="STUDENT PROFILE"
          subtitle="Campus Identity & Trust Rating"
          showProfile={false}
        />
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
          {/* Avatar with Camera badge */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.85}
            onPress={handleOpenEditModal}
          >
            <Image
              source={{
                uri:
                  currentUser.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              }}
              style={styles.avatar}
            />
            <View style={styles.cameraBadge}>
              <Camera size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{currentUser.name}</Text>
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
              <Text style={styles.detailText} numberOfLines={1}>{currentUser.email}</Text>
            </View>

            {currentUser.department && (
              <View style={styles.detailRow}>
                <Building size={13} color={COLORS.textMuted} />
                <Text style={styles.detailText} numberOfLines={1}>{currentUser.department}</Text>
              </View>
            )}

            {currentUser.phone_number && (
              <View style={styles.detailRow}>
                <Phone size={13} color={COLORS.textMuted} />
                <Text style={styles.detailText}>{currentUser.phone_number}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit Profile Action Button */}
        <TouchableOpacity
          style={styles.editProfileBtn}
          activeOpacity={0.85}
          onPress={handleOpenEditModal}
        >
          <Edit3 size={15} color={COLORS.primary} />
          <Text style={styles.editProfileBtnText}>Edit Profile & Photo</Text>
        </TouchableOpacity>

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

      {/* ========================================================= */}
      {/* EDIT PROFILE & AVATAR PICKER MODAL */}
      {/* ========================================================= */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Edit3 size={18} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Edit Profile & Photo</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Live Avatar Preview */}
              <View style={styles.avatarPreviewSection}>
                <Image
                  source={{ uri: customUrl.trim() ? customUrl.trim() : avatarUrl }}
                  style={styles.largePreviewAvatar}
                />
                <Text style={styles.previewHint}>Tap an avatar below or paste a custom photo URL</Text>
              </View>

              {/* Avatar Preset Gallery */}
              <Text style={styles.inputSectionHeading}>CHOOSE AVATAR PRESET</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarPresetsRow}
              >
                {AVATAR_PRESETS.map((preset, index) => {
                  const isSelected = avatarUrl === preset && !customUrl.trim();
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.presetAvatarBox,
                        isSelected && styles.presetAvatarBoxSelected,
                      ]}
                      onPress={() => {
                        setAvatarUrl(preset);
                        setCustomUrl('');
                      }}
                    >
                      <Image source={{ uri: preset }} style={styles.presetAvatarImg} />
                      {isSelected && (
                        <View style={styles.presetSelectedBadge}>
                          <Check size={12} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Custom Image URL Option */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Or Custom Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/my-photo.jpg"
                  placeholderTextColor={COLORS.textMuted}
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  autoCapitalize="none"
                />
              </View>

              {/* Name Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputWithIcon}>
                  <User size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.inputInner}
                    placeholder="Your Full Name"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Student ID */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Student / Roll Number</Text>
                <View style={styles.inputWithIcon}>
                  <Hash size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.inputInner}
                    placeholder="e.g. STU-2024-9102"
                    placeholderTextColor={COLORS.textMuted}
                    value={studentId}
                    onChangeText={setStudentId}
                  />
                </View>
              </View>

              {/* Department */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department / Academic Unit</Text>
                <View style={styles.inputWithIcon}>
                  <Building size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.inputInner}
                    placeholder="e.g. Computer Science & Engineering"
                    placeholderTextColor={COLORS.textMuted}
                    value={department}
                    onChangeText={setDepartment}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone Number</Text>
                <View style={styles.inputWithIcon}>
                  <Phone size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.inputInner}
                    placeholder="e.g. +1 (555) 234-8891"
                    placeholderTextColor={COLORS.textMuted}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveProfileBtn}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Check size={16} color="#FFF" />
                    <Text style={styles.saveProfileBtnText}>Save Profile Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
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
    marginBottom: SPACING.sm,
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: 5,
    borderWidth: 2,
    borderColor: COLORS.card,
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
    flexShrink: 1,
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
    flexShrink: 1,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
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
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    maxHeight: '90%',
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalScroll: {
    paddingBottom: SPACING.md,
  },
  avatarPreviewSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  largePreviewAvatar: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginBottom: 6,
  },
  previewHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  inputSectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  avatarPresetsRow: {
    gap: 10,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  presetAvatarBox: {
    position: 'relative',
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 2,
  },
  presetAvatarBoxSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  presetAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
  },
  presetSelectedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    gap: 8,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  saveProfileBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  saveProfileBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
