import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, LogIn, Sparkles, Activity } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../styles/theme';
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
          <View style={styles.brandIconCircle}>
            <ShieldCheck size={18} color="#FFF" />
          </View>
          <Text style={styles.brandTitle}>{title}</Text>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CAMPUS LIVE</Text>
          </View>
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
          <LogIn size={13} color="#FFF" />
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  left: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.foundSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.foundBorder,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.found,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.found,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  profileContainer: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primaryBorder,
  },
  trustBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: COLORS.found,
    borderRadius: RADIUS.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  trustText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  loginBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  loginBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});

