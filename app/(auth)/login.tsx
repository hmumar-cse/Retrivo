import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  User,
  Hash,
  Building,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';
import { useApp } from '../../src/context/AppContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup, availableDemoUsers, switchDemoUser } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('samira.patel@campus.edu');
  const [password, setPassword] = useState('campuspassword123');

  // Sign up fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);

    if (mode === 'signin') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        router.replace('/(tabs)');
      } else {
        setErrorMessage(res.message);
      }
    } else {
      if (!name.trim() || !studentId.trim() || !email.trim()) {
        setLoading(false);
        setErrorMessage('Please fill in your Name, Student ID, and Campus Email.');
        return;
      }
      const res = await signup({
        student_id: studentId.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
        department: department.trim() || 'Student',
      });
      setLoading(false);
      if (res.success) {
        router.replace('/(tabs)');
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  const handleDemoLogin = (userId: string) => {
    switchDemoUser(userId);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Logo & Header */}
          <View style={styles.brandBox}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={36} color="#FFF" />
            </View>
            <Text style={styles.brandName}>RETRIVO</Text>
            <Text style={styles.brandTagline}>Campus Lost, Found & AI Recovery</Text>

            <View style={styles.ssoBadge}>
              <GraduationCap size={14} color={COLORS.primary} />
              <Text style={styles.ssoText}>Campus Zero-Trust Network</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Mode Switcher */}
            <View style={styles.tabSwitch}>
              <TouchableOpacity
                style={[styles.switchBtn, mode === 'signin' && styles.switchBtnActive]}
                onPress={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
              >
                <Text style={[styles.switchText, mode === 'signin' && styles.switchTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.switchBtn, mode === 'signup' && styles.switchBtnActive]}
                onPress={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
              >
                <Text style={[styles.switchText, mode === 'signup' && styles.switchTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Sign Up extra fields */}
            {mode === 'signup' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <View style={styles.inputWrapper}>
                    <User size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Alex Morgan"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Student / Staff ID Number *</Text>
                  <View style={styles.inputWrapper}>
                    <Hash size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={studentId}
                      onChangeText={setStudentId}
                      placeholder="e.g. STU-2024-5519"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Department / Major</Text>
                  <View style={styles.inputWrapper}>
                    <Building size={16} color={COLORS.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={department}
                      onChangeText={setDepartment}
                      placeholder="e.g. Computer Science"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Campus Email Address *</Text>
              <View style={styles.inputWrapper}>
                <Mail size={16} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@university.edu"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter secure password"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Submit Action */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {mode === 'signin' ? 'Sign In to Campus Network' : 'Complete Registration'}
                  </Text>
                  <ArrowRight size={16} color="#FFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Fast Demo Role Switcher */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR TEST PRESET CAMPUS ROLES</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.demoSection}>
              {availableDemoUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.demoUserCard}
                  onPress={() => handleDemoLogin(user.id)}
                >
                  <View style={styles.demoUserLeft}>
                    <Sparkles size={14} color={COLORS.primary} />
                    <View>
                      <Text style={styles.demoUserName}>{user.name}</Text>
                      <Text style={styles.demoUserRole}>
                        {user.department || user.student_id} • {user.trust_score}% Trust
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.demoActionText}>Login →</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.footerNote}>
            Powered by Supabase Auth & PostgreSQL. Private clues protected by Row-Level Security.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  ssoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 8,
  },
  ssoText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.md,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  switchBtnActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  switchTextActive: {
    color: COLORS.textPrimary,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xs,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 8,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  demoSection: {
    gap: 8,
  },
  demoUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  demoUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  demoUserRole: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  demoActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    lineHeight: 16,
  },
});

