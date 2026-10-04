import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import {
  Compass,
  Sparkles,
  Plus,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../../src/styles/theme';
import { useApp } from '../../src/context/AppContext';

export default function TabLayout() {
  const { matches, claims } = useApp();

  const pendingClaimsCount = claims.filter(
    (c) => c.status === 'pending' || (c.status === 'verified' && !c.handover_confirmed_at)
  ).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          borderTopWidth: 1,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Compass color={color} size={focused ? 23 : 21} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'AI Matches',
          tabBarBadge: matches.length > 0 ? matches.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.primary,
            fontSize: 10,
            fontWeight: '800',
            color: '#FFF',
          },
          tabBarIcon: ({ color, focused }) => (
            <Sparkles color={color} size={focused ? 23 : 21} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerFab, focused && styles.centerFabActive]}>
              <Plus color="#FFF" size={24} strokeWidth={3} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: 'Claims',
          tabBarBadge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.found,
            fontSize: 10,
            fontWeight: '800',
            color: '#FFF',
          },
          tabBarIcon: ({ color, focused }) => (
            <ShieldCheck color={color} size={focused ? 23 : 21} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={focused ? 23 : 21} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerFab: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 10 : 8,
    ...SHADOWS.md,
  },
  centerFabActive: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 1.05 }],
  },
});
