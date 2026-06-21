import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Badge, StatCard } from '@/components/ui';

interface Doc { id: string; number: string; type: string; customerName: string; subtotal?: number; vat?: number; total: number; status: string; }
const DOC_TYPES = ['חשבונית מס/קבלה', 'חשבונית מס', 'קבלה', 'חשבונית עסקה', 'חשבונית זיכוי'];

export default function Documents() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'חשבונית מס/קבלה', customerName: '', amount: '' });

  const load = useCallback(() => { api<Doc[]>('/documents').then(setDocs).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const total = docs.reduce((a, d) => a + d.total, 0);

  const amount = Number(form.amount) || 0;
  const vat = form.type === 'קבלה' ? 0 : Math.round(amount * 0.18);

  const save = async () => {
    if (!form.customerName.trim() || !amount) return;
    setSaving(true);
    try {
      await api('/documents', { method: 'POST', body: JSON.stringify({ type: form.type, customerName: form.customerName, amount }) });
      setForm({ type: 'חשבונית מס/קבלה', customerName: '', amount: '' }); setAdding(false); load();
    } catch {} finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="חשבוניות וקבלות" subtitle="הנפקת מסמכים" back />
      <View style={{ flexDirection: 'row', gap: 10, padding: 14 }}>
        <StatCard label="מסמכים" value={docs.length} color={C.brand} />
        <StatCard label="סך הכנסות" value={`₪${total.toLocaleString()}`} color={C.emerald} />
      </View>
      <FlatList
        data={docs}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: 14, paddingTop: 0, gap: 8, paddingBottom: 90 }}
        renderItem={({ item: d }) => (
          <View style={st.row}>
            <View style={{ flex: 1 }}>
              <Text style={st.num}>{d.number}</Text>
              <Text style={st.meta}>{d.type} · {d.customerName}</Text>
            </View>
            <View style={{ alignItems: 'flex-start', gap: 4 }}>
              <Text style={st.total}>₪{d.total.toLocaleString()}</Text>
              <Badge tone="emerald">הונפק</Badge>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={st.fab} onPress={() => setAdding(true)}><Text style={st.fabT}>＋</Text></TouchableOpacity>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={st.backdrop}>
          <View style={st.sheet}>
            <Text style={st.sheetTitle}>מסמך חדש</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {DOC_TYPES.map((t) => (
                <TouchableOpacity key={t} onPress={() => setForm({ ...form, type: t })} style={[st.chip, form.type === t && st.chipOn]}>
                  <Text style={form.type === t ? st.chipTOn : st.chipT}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput value={form.customerName} onChangeText={(v) => setForm({ ...form, customerName: v })} placeholder="שם הלקוח *" style={st.input} />
            <TextInput value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} placeholder="סכום לפני מע״מ ₪ *" keyboardType="numeric" style={st.input} />
            <View style={st.calc}>
              <Text style={st.calcRow}>סכום: ₪{amount.toLocaleString()}</Text>
              <Text style={st.calcRow}>מע״מ (18%): ₪{vat.toLocaleString()}</Text>
              <Text style={[st.calcRow, { fontWeight: '800', color: C.ink }]}>סה״כ: ₪{(amount + vat).toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <TouchableOpacity style={[st.btn, { backgroundColor: C.bg, flex: 1 }]} onPress={() => setAdding(false)}><Text style={{ color: C.inkSoft, fontWeight: '700' }}>ביטול</Text></TouchableOpacity>
              <TouchableOpacity style={[st.btn, { backgroundColor: C.brand, flex: 1 }]} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>הנפק</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14 },
  num: { fontWeight: '700', color: C.ink, textAlign: 'right' },
  meta: { fontSize: 12, color: C.inkFaint, textAlign: 'right', marginTop: 2 },
  total: { fontWeight: '800', color: C.ink, fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, left: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabT: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34, gap: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.ink, textAlign: 'right' },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right', fontSize: 15 },
  calc: { backgroundColor: C.bg, borderRadius: 12, padding: 12, gap: 3 },
  calcRow: { fontSize: 13, color: C.inkSoft, textAlign: 'right' },
  chip: { borderWidth: 1, borderColor: C.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: C.brand, borderColor: C.brand },
  chipT: { color: C.inkMuted, fontSize: 12 },
  chipTOn: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
});
