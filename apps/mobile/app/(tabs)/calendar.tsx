import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { C, TONE } from '@/lib/theme';
import { Header } from '@/components/header';
import { SectionTitle, Badge } from '@/components/ui';

interface Appt { id: string; customerName: string; title: string; type: string; date: string; time: string; }
interface Task { id: string; title: string; dueAt?: string; priority: string; done: boolean; }
const PRI: Record<string, string> = { URGENT: 'rose', HIGH: 'amber', MEDIUM: 'sky', LOW: 'slate' };
const PRIL: Record<string, string> = { URGENT: 'דחוף', HIGH: 'גבוה', MEDIUM: 'בינוני', LOW: 'נמוך' };
const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '');
const fmtT = (iso?: string) => (iso ? new Date(iso).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'ללא תאריך');

export default function Calendar() {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const load = useCallback(() => { api<Appt[]>('/appointments').then(setAppts).catch(() => {}); api<Task[]>('/tasks').then(setTasks).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = async (id: string) => { const t = tasks.find((x) => x.id === id); if (!t) return; setTasks((a) => a.map((x) => (x.id === id ? { ...x, done: !x.done } : x))); await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done: !t.done }) }); };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="יומן ומשימות" subtitle="פגישות ומשימות" bell />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <SectionTitle>פגישות קרובות</SectionTitle>
        {appts.map((a) => (
          <View key={a.id} style={st.card}>
            <View style={[st.dot, { backgroundColor: C.brand }]} />
            <View style={{ flex: 1 }}>
              <Text style={st.title}>{a.title}</Text>
              <Text style={st.meta}>{a.customerName} · {fmt(a.date)} · {a.time}</Text>
            </View>
            <Badge tone="brand">{a.type}</Badge>
          </View>
        ))}

        <SectionTitle>משימות</SectionTitle>
        {tasks.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => toggle(t.id)} style={st.card}>
            <View style={[st.check, t.done && { backgroundColor: C.emerald, borderColor: C.emerald }]}>{t.done && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}</View>
            <View style={{ flex: 1 }}>
              <Text style={[st.title, t.done && { textDecorationLine: 'line-through', color: C.inkFaint }]}>{t.title}</Text>
              <Text style={st.meta}>⏰ {fmtT(t.dueAt)}</Text>
            </View>
            <Badge tone={PRI[t.priority]}>{PRIL[t.priority]}</Badge>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 13 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600', color: C.ink, fontSize: 14, textAlign: 'right' },
  meta: { fontSize: 12, color: C.inkFaint, textAlign: 'right', marginTop: 2 },
});
