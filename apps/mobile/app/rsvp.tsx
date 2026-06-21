import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { RSVP_TONE, RSVP_LABEL } from '@/lib/theme';
import { Header } from '@/components/header';
import { Avatar, Badge, StatCard } from '@/components/ui';

interface Guest { id: string; name: string; group: string; size: number; status: string; }
const CYCLE: Record<string, string> = { PENDING: 'YES', YES: 'MAYBE', MAYBE: 'NO', NO: 'PENDING' };

export default function Rsvp() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', size: '1' });

  const load = useCallback(() => { api<Guest[]>('/guests').then(setGuests).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const sum = (s: string) => guests.filter((g) => g.status === s).reduce((a, g) => a + (g.size || 1), 0);

  const cycle = async (g: Guest) => {
    const next = CYCLE[g.status] ?? 'YES';
    setGuests((prev) => prev.map((x) => (x.id === g.id ? { ...x, status: next } : x)));
    try { await api(`/guests/${g.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) }); } catch { load(); }
  };
  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api('/guests', { method: 'POST', body: JSON.stringify({ name: form.name, partySize: Number(form.size) || 1, size: Number(form.size) || 1 }) });
      setForm({ name: '', size: '1' }); setAdding(false); load();
    } catch {} finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="אישורי הגעה" subtitle="הקש על אורח לשינוי סטטוס" back />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 14 }}>
        <StatCard label="אישרו" value={sum('YES')} color={C.emerald} />
        <StatCard label="אולי" value={sum('MAYBE')} color={C.amber} />
        <StatCard label="לא מגיעים" value={sum('NO')} color={C.rose} />
        <StatCard label="ממתינים" value={sum('PENDING')} color={C.inkMuted} />
      </View>
      <FlatList
        data={guests}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 14, paddingTop: 0, gap: 8, paddingBottom: 90 }}
        renderItem={({ item: g }) => (
          <TouchableOpacity style={st.row} onPress={() => cycle(g)}>
            <Avatar name={g.name} size={36} />
            <View style={{ flex: 1 }}><Text style={st.name}>{g.name}</Text><Text style={st.meta}>{g.group} · {g.size} מקומות</Text></View>
            <Badge tone={RSVP_TONE[g.status]}>{RSVP_LABEL[g.status]}</Badge>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={st.fab} onPress={() => setAdding(true)}><Text style={st.fabT}>＋</Text></TouchableOpacity>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={st.backdrop}>
          <View style={st.sheet}>
            <Text style={st.sheetTitle}>אורח חדש</Text>
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="שם האורח *" style={st.input} />
            <TextInput value={form.size} onChangeText={(v) => setForm({ ...form, size: v })} placeholder="מס׳ מקומות" keyboardType="numeric" style={st.input} />
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12 },
  name: { fontWeight: '600', color: C.ink, textAlign: 'right' },
  meta: { fontSize: 12, color: C.inkFaint, textAlign: 'right' },
  fab: { position: 'absolute', bottom: 24, left: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabT: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34, gap: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right', fontSize: 15 },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
});
