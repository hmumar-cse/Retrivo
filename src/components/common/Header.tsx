import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, LogIn } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../../styles/theme';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showProfile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'RETRIVO',
  subtitle = 'Campus Recovery Network',
  showProfile = true,
}) => {
  const router = useRouter();
  const { currentUser } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.badgeRow}>
          <ShieldCheck size={20} color={COLORS.primary} />
          <Text style={styles.brandTitle}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.brandSubtitle}>{subtitle}</Text> : null}
      </View>

      {showProfile && currentUser ? (
        <TouchableOpacity
          style={styles.profileContainer}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Image
            source={{
              uri:
                currentUser.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            }}
            style={styles.avatar}
          />
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>{currentUser.trust_score}%</Text>
          </View>
        </TouchableOpacity>
      ) : showProfile && !currentUser ? (
        <TouchableOpacity
          style={styles.loginBtnHeader}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/login')}
        >
          <LogIn size={13} color={COLORS.primary} />
          <Text style={styles.loginBtnText}>Sign In</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  profileContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  trustBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.found,
    borderRadius: RADIUS.full,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  trustText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  loginBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  loginBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

