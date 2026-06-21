import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { clearSession } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { SectionTitle } from '@/components/ui';

const GROUPS: { title: string; items: { icon: string; label: string; href: string }[] }[] = [
  { title: 'אירועים', items: [
    { icon: '📅', label: 'אירועים', href: '/events' },
    { icon: '✉️', label: 'אישורי הגעה', href: '/rsvp' },
  ] },
  { title: 'תקשורת', items: [
    { icon: '📞', label: 'שיחות', href: '/calls' },
    { icon: '🤖', label: 'עוזר AI קולי', href: '/ai' },
  ] },
  { title: 'מסמכים וכספים', items: [
    { icon: '🧾', label: 'חשבוניות וקבלות', href: '/documents' },
  ] },
  { title: 'מערכת', items: [
    { icon: '🔔', label: 'התראות', href: '/notifications' },
    { icon: '⚙️', label: 'הגדרות', href: '/settings' },
  ] },
];

export default function More() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="עוד" subtitle="כל המודולים" bell />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        {GROUPS.map((g) => (
          <View key={g.title}>
            <SectionTitle>{g.title}</SectionTitle>
            <View style={st.card}>
              {g.items.map((it, i) => (
                <TouchableOpacity key={it.href} onPress={() => router.push(it.href as any)} style={[st.row, i < g.items.length - 1 && st.border]}>
                  <Text style={{ fontSize: 20 }}>{it.icon}</Text>
                  <Text style={st.label}>{it.label}</Text>
                  <Text style={{ color: C.inkFaint, fontSize: 20 }}>‹</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={() => { clearSession(); router.replace('/'); }} style={st.logout}>
          <Text style={{ color: C.rose, fontWeight: '700' }}>התנתקות</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { flex: 1, fontWeight: '600', color: C.ink, textAlign: 'right' },
  logout: { marginTop: 8, backgroundColor: '#fef2f2', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
});
