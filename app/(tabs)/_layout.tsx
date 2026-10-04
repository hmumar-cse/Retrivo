import React from 'react';
import { Tabs } from 'expo-router';
import {
  Compass,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { COLORS } from '../../src/styles/theme';
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'AI Matches',
          tabBarBadge: matches.length > 0 ? matches.length : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.primary, fontSize: 10 },
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={size + 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: 'Claims',
          tabBarBadge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.found, fontSize: 10 },
          tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

