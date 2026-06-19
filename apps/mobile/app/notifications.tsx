import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { SectionTitle } from '@/components/ui';
import { speak } from '@/lib/voice';

const ICON: Record<string, string> = { lead: '🎯', task: '⏰', contract: '✍️', message: '💬', rsvp: '✉️', call: '📞', system: '🔔' };
const CATS = [
  { key: 'lead', label: 'לידים חדשים' },
  { key: 'message', label: 'הודעות WhatsApp/SMS' },
  { key: 'rsvp', label: 'אישורי הגעה' },
  { key: 'contract', label: 'חתימת חוזים' },
  { key: 'task', label: 'תזכורות משימות' },
  { key: 'call', label: 'שיחות' },
];

export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(Object.fromEntries(CATS.map((c) => [c.key, true])));
  const [readAloud, setReadAloud] = useState(false);
  useEffect(() => { api('/notifications').then(setItems).catch(() => {}); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="התראות" subtitle="שליטה מלאה" back />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <SectionTitle>חדשות</SectionTitle>
        {items.filter((n) => prefs[n.type] !== false).map((n) => (
          <TouchableOpacity key={n.id} onPress={() => readAloud && speak(`${n.title}. ${n.body}`)} style={st.card}>
            <View style={st.iconBox}><Text style={{ fontSize: 18 }}>{ICON[n.type] ?? '🔔'}</Text></View>
            <View style={{ flex: 1 }}><Text style={st.title}>{n.title}</Text><Text style={st.body}>{n.body}</Text></View>
            <Text style={st.time}>{n.time}</Text>
          </TouchableOpacity>
        ))}

        <SectionTitle>הגדרות התראות (Push)</SectionTitle>
        <View style={st.settings}>
          <View style={[st.srow, st.border]}>
            <Text style={st.slabel}>🔊 הקראת התראות בקול</Text>
            <Switch value={readAloud} onValueChange={setReadAloud} trackColor={{ true: C.brand }} />
          </View>
          {CATS.map((c, i) => (
            <View key={c.key} style={[st.srow, i < CATS.length - 1 && st.border]}>
              <Text style={st.slabel}>{ICON[c.key]} {c.label}</Text>
              <Switch value={prefs[c.key]} onValueChange={(v) => setPrefs((p) => ({ ...p, [c.key]: v }))} trackColor={{ true: C.brand }} />
            </View>
          ))}
        </View>
        <Text style={st.note}>ההתראות נשלחות בו-זמנית לאפליקציה ולאתר. כיבוי קטגוריה מפסיק קבלת התראות מסוג זה.</Text>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  card: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.brand50, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600', color: C.ink, textAlign: 'right' },
  body: { fontSize: 12, color: C.inkFaint, textAlign: 'right', marginTop: 1 },
  time: { fontSize: 11, color: C.inkFaint },
  settings: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden' },
  srow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  slabel: { fontSize: 14, color: C.inkSoft },
  note: { fontSize: 11, color: C.inkFaint, textAlign: 'right', marginTop: 4, lineHeight: 16 },
});
