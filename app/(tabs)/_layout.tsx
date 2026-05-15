import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/ui/components/haptic-tab';
import { IconSymbol } from '@/ui/components/icon-symbol';
import { Colors } from '@/ui/theme/theme';
import { useColorScheme } from '@/ui/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
