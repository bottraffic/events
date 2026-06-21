import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';

interface EventRow {
  id: string; type: string; eventDate: string; guestsCount: number; status: string;
  totalPrice?: number; customer?: { name: string; partnerName?: string };
}
interface Cust { id: string; name: string; }

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  INQUIRY: { label: 'פנייה', bg: '#f1f5f9', fg: '#475569' },
  OPTION: { label: 'אופציה', bg: '#fef3c7', fg: '#b45309' },
  BOOKED: { label: 'סגור', bg: '#d1fae5', fg: '#047857' },
  COMPLETED: { label: 'הסתיים', bg: '#e0f2fe', fg: '#0369a1' },
  CANCELLED: { label: 'בוטל', bg: '#fee2e2', fg: '#b91c1c' },
};
const TYPES = ['חתונה', 'בר מצווה', 'בת מצווה', 'ברית', 'אירוע חברה', 'יום הולדת'];

export default function Events() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [customers, setCustomers] = useState<Cust[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerId: '', customerName: '', type: 'חתונה', eventDate: '', guestsCount: '', totalPrice: '' });

  const load = useCallback(() => {
    api<EventRow[]>('/events').then(setEvents).catch(() => {});
    api<Cust[]>('/customers').then(setCustomers).catch(() => {});
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    if (!form.customerName.trim() || !form.eventDate.trim()) return;
    setSaving(true);
    try {
      await api('/events', { method: 'POST', body: JSON.stringify({ customerId: form.customerId || undefined, customerName: form.customerName, type: form.type, eventDate: form.eventDate, guestsCount: Number(form.guestsCount) || 0, totalPrice: Number(form.totalPrice) || 0 }) });
      setForm({ customerId: '', customerName: '', type: 'חתונה', eventDate: '', guestsCount: '', totalPrice: '' }); setAdding(false); load();
    } catch {} finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <FlatList
        style={styles.screen}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => {
          const st = STATUS[item.status] ?? STATUS.INQUIRY;
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.customer?.name}{item.customer?.partnerName ? ` & ${item.customer.partnerName}` : ''}</Text>
                <View style={[styles.badge, { backgroundColor: st.bg }]}><Text style={[styles.badgeText, { color: st.fg }]}>{st.label}</Text></View>
              </View>
              <Text style={styles.meta}>{item.type} · {item.eventDate ? new Date(item.eventDate).toLocaleDateString('he-IL') : '—'} · {item.guestsCount} מוזמנים</Text>
              {item.totalPrice ? <Text style={styles.price}>₪{Number(item.totalPrice).toLocaleString()}</Text> : null}
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setAdding(true)}><Text style={styles.fabT}>＋</Text></TouchableOpacity>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>אירוע חדש</Text>
            <TextInput value={form.customerName} onChangeText={(v) => setForm({ ...form, customerName: v, customerId: '' })} placeholder="שם הלקוח *" style={styles.input} />
            {customers.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {customers.slice(0, 12).map((c) => (
                  <TouchableOpacity key={c.id} onPress={() => setForm({ ...form, customerId: c.id, customerName: c.name })} style={[styles.chip, form.customerId === c.id && styles.chipOn]}>
                    <Text style={form.customerId === c.id ? styles.chipTOn : styles.chipT}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {TYPES.map((t) => (
                <TouchableOpacity key={t} onPress={() => setForm({ ...form, type: t })} style={[styles.chip, form.type === t && styles.chipOn]}>
                  <Text style={form.type === t ? styles.chipTOn : styles.chipT}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput value={form.eventDate} onChangeText={(v) => setForm({ ...form, eventDate: v })} placeholder="תאריך (YYYY-MM-DD) *" style={styles.input} />
            <TextInput value={form.guestsCount} onChangeText={(v) => setForm({ ...form, guestsCount: v })} placeholder="מס׳ מוזמנים" keyboardType="numeric" style={styles.input} />
            <TextInput value={form.totalPrice} onChangeText={(v) => setForm({ ...form, totalPrice: v })} placeholder="סכום ₪" keyboardType="numeric" style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#f1f5f9', flex: 1 }]} onPress={() => setAdding(false)}><Text style={{ color: '#475569', fontWeight: '700' }}>ביטול</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#6366f1', flex: 1 }]} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>שמור</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', color: '#1e293b', fontSize: 16, textAlign: 'right' },
  meta: { color: '#64748b', fontSize: 13, textAlign: 'right', marginTop: 8 },
  price: { color: '#334155', fontSize: 14, fontWeight: '700', textAlign: 'right', marginTop: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, left: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabT: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34, gap: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', textAlign: 'right' },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right', fontSize: 15 },
  chip: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipT: { color: '#64748b', fontSize: 12 },
  chipTOn: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
});
