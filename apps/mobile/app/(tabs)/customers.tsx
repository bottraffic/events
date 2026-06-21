import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Avatar, Badge } from '@/components/ui';

interface Cust { id: string; name: string; partner: string; phone: string; email: string; eventType: string; eventDate: string; guests: number; value: number; status: string; }
const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '');
const tone = (s: string) => (s?.includes('VIP') ? 'amber' : s?.includes('פעיל') ? 'emerald' : s?.includes('חם') ? 'rose' : 'slate');

export default function Customers() {
  const [items, setItems] = useState<Cust[]>([]);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', partner: '', phone: '', email: '' });

  const load = useCallback(() => { api<Cust[]>('/customers').then(setItems).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const shown = items.filter((c) => !q || c.name.includes(q) || (c.phone || '').includes(q));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api('/customers', { method: 'POST', body: JSON.stringify({ name: form.name, partnerName: form.partner, partner: form.partner, phone: form.phone, email: form.email }) });
      setForm({ name: '', partner: '', phone: '', email: '' }); setAdding(false); load();
    } catch {} finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="לקוחות" subtitle={`${items.length} לקוחות`} bell />
      <View style={{ padding: 12 }}>
        <TextInput value={q} onChangeText={setQ} placeholder="חיפוש לפי שם או טלפון…" style={st.search} />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 12, paddingTop: 0, gap: 10, paddingBottom: 90 }}
        renderItem={({ item: c }) => (
          <View style={st.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={c.name} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{c.name}{c.partner ? ` & ${c.partner}` : ''}</Text>
                <Text style={st.meta}>{c.eventType || '—'} · {fmt(c.eventDate)} · {c.phone || ''}</Text>
              </View>
              {c.status ? <Badge tone={tone(c.status)}>{c.status}</Badge> : null}
            </View>
            <View style={st.actions}>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.phone}`)} style={st.actBtn}><Text style={st.actT}>📞 חייג</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/972${(c.phone || '').replace(/\D/g, '').replace(/^0/, '')}`)} style={st.actBtn}><Text style={st.actT}>💬 WhatsApp</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${c.email}`)} style={st.actBtn}><Text style={st.actT}>✉️ מייל</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={st.fab} onPress={() => setAdding(true)}><Text style={st.fabT}>＋</Text></TouchableOpacity>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={st.backdrop}>
          <View style={st.sheet}>
            <Text style={st.sheetTitle}>לקוח חדש</Text>
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="שם מלא *" style={st.input} />
            <TextInput value={form.partner} onChangeText={(v) => setForm({ ...form, partner: v })} placeholder="בן/בת זוג" style={st.input} />
            <TextInput value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="טלפון" keyboardType="phone-pad" style={st.input} />
            <TextInput value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="אימייל" keyboardType="email-address" autoCapitalize="none" style={st.input} />
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
  search: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right' },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 },
  name: { fontWeight: '700', color: C.ink, fontSize: 15, textAlign: 'right' },
  meta: { fontSize: 12, color: C.inkFaint, textAlign: 'right', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  actBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  actT: { fontSize: 12, fontWeight: '600', color: C.inkSoft },
  fab: { position: 'absolute', bottom: 24, left: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabT: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34, gap: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'right', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right', fontSize: 15 },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
});
