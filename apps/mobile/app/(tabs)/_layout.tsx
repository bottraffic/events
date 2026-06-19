import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { C } from '@/lib/theme';

function icon(emoji: string) {
  return ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.brand,
        tabBarInactiveTintColor: C.inkFaint,
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6, borderTopColor: C.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'דשבורד', tabBarIcon: icon('📊') }} />
      <Tabs.Screen name="pipeline" options={{ title: 'לידים', tabBarIcon: icon('🎯') }} />
      <Tabs.Screen name="customers" options={{ title: 'לקוחות', tabBarIcon: icon('👤') }} />
      <Tabs.Screen name="calendar" options={{ title: 'יומן', tabBarIcon: icon('📅') }} />
      <Tabs.Screen name="more" options={{ title: 'עוד', tabBarIcon: icon('⋯') }} />
      <Tabs.Screen name="events" options={{ href: null }} />
    </Tabs>
  );
}
