import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '@/lib/theme';

// Tab routes (registered as Tabs.Screen) — navigated within the tab navigator.
const TAB_ITEMS = [
  { name: 'dashboard', label: 'דשבורד', icon: '📊' },
  { name: 'pipeline', label: 'לידים', icon: '🎯' },
  { name: 'customers', label: 'לקוחות', icon: '👤' },
  { name: 'events', label: 'אירועים', icon: '📅' },
  { name: 'calendar', label: 'יומן', icon: '🗓️' },
];
// Extra destinations (top-level screens) — pushed via router.
const LINK_ITEMS = [
  { href: '/tasks', label: 'משימות', icon: '✅' },
  { href: '/rsvp', label: 'אישורים', icon: '✉️' },
  { href: '/documents', label: 'חשבוניות', icon: '🧾' },
  { href: '/calls', label: 'שיחות', icon: '📞' },
  { href: '/ai', label: 'עוזר AI', icon: '🤖' },
];
const MORE_ITEM = { name: 'more', label: 'עוד', icon: '⋯' };

function Btn({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item} activeOpacity={0.7}>
      <Text style={{ fontSize: 22, opacity: active ? 1 : 0.5 }}>{icon}</Text>
      <Text style={[styles.label, { color: active ? C.brand : C.inkFaint }]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

function ScrollTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const activeName = state.routeNames[state.index];
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 6 }}>
        {TAB_ITEMS.map((t) => <Btn key={t.name} label={t.label} icon={t.icon} active={activeName === t.name} onPress={() => navigation.navigate(t.name)} />)}
        {LINK_ITEMS.map((l) => <Btn key={l.href} label={l.label} icon={l.icon} active={false} onPress={() => router.push(l.href as any)} />)}
        <Btn label={MORE_ITEM.label} icon={MORE_ITEM.icon} active={activeName === MORE_ITEM.name} onPress={() => navigation.navigate(MORE_ITEM.name)} />
      </ScrollView>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <ScrollTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="pipeline" />
      <Tabs.Screen name="customers" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6 },
  item: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, minWidth: 62 },
  label: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
