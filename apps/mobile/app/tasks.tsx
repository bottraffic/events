import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';

interface Task { id: string; title: string; dueAt?: string; priority: string; done: boolean; }
const PRIO: Record<string, { label: string; color: string }> = {
  URGENT: { label: 'דחוף', color: '#dc2626' }, HIGH: { label: 'גבוה', color: '#f59e0b' },
  MEDIUM: { label: 'רגיל', color: '#6366f1' }, LOW: { label: 'נמוך', color: '#64748b' },
};
const PRIOS = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'MEDIUM' });

  const load = useCallback(() => { api<Task[]>('/tasks').then(setTasks).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = async (t: Task) => {
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    try { await api(`/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ done: !t.done }) }); } catch { load(); }
  };
  const remove = (t: Task) => {
    Alert.alert('מחיקת משימה', `למחוק את "${t.title}"?`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: async () => { setTasks((p) => p.filter((x) => x.id !== t.id)); try { await api(`/tasks/${t.id}`, { method: 'DELETE' }); } catch { load(); } } },
    ]);
  };
  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try { await api('/tasks', { method: 'POST', body: JSON.stringify({ title: form.title, priority: form.priority }) }); setForm({ title: '', priority: 'MEDIUM' }); setAdding(false); load(); }
    catch {} finally { setSaving(false); }
  };

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const data = [...open, ...done];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="משימות" subtitle={`${open.length} פתוחות`} back />
      <FlatList
        data={data}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 14, gap: 8, paddingBottom: 90 }}
        renderItem={({ item: t }) => {
          const p = PRIO[t.priority] ?? PRIO.MEDIUM;
          return (
            <TouchableOpacity style={st.row} onPress={() => toggle(t)} onLongPress={() => remove(t)}>
              <View style={[st.check, t.done && { backgroundColor: C.emerald, borderColor: C.emerald }]}>{t.done ? <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={[st.title, t.done && { textDecorationLine: 'line-through', color: C.inkFaint }]}>{t.title}</Text>
                {t.dueAt ? <Text style={st.meta}>{new Date(t.dueAt).toLocaleString('he-IL')}</Text> : null}
              </View>
              <View style={[st.prio, { backgroundColor: p.color + '22' }]}><Text style={{ color: p.color, fontSize: 11, fontWeight: '700' }}>{p.label}</Text></View>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity style={st.fab} onPress={() => setAdding(true)}><Text style={st.fabT}>＋</Text></TouchableOpacity>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={st.backdrop}>
          <View style={st.sheet}>
            <Text style={st.sheetTitle}>משימה חדשה</Text>
            <TextInput value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="תיאור המשימה *" style={st.input} />
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {PRIOS.map((p) => (
                <TouchableOpacity key={p} onPress={() => setForm({ ...form, priority: p })} style={[st.chip, form.priority === p && { backgroundColor: PRIO[p].color, borderColor: PRIO[p].color }]}>
                  <Text style={form.priority === p ? { color: '#fff', fontWeight: '700', fontSize: 12 } : { color: C.inkMuted, fontSize: 12 }}>{PRIO[p].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <TouchableOpacity style={[st.btn, { backgroundColor: C.bg, flex: 1 }]} onPress={() => setAdding(false)}><Text style={{ color: C.inkSoft, fontWeight: '700' }}>ביטול</Text></TouchableOpacity>
              <TouchableOpacity style={[st.btn, { backgroundColor: C.brand, flex: 1 }]} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>שמור</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14 },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600', color: C.ink, textAlign: 'right' },
  meta: { fontSize: 11, color: C.inkFaint, textAlign: 'right', marginTop: 2 },
  prio: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  fab: { position: 'absolute', bottom: 24, left: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabT: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34, gap: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right', fontSize: 15 },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, flex: 1, alignItems: 'center' },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
});
