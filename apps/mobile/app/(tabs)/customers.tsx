import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Avatar, Badge } from '@/components/ui';

interface Cust { id: string; name: string; partner: string; phone: string; email: string; eventType: string; eventDate: string; guests: number; value: number; status: string; }
const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('he-IL') : '');
const tone = (s: string) => (s.includes('VIP') ? 'amber' : s.includes('פעיל') ? 'emerald' : s.includes('חם') ? 'rose' : 'slate');

export default function Customers() {
  const [items, setItems] = useState<Cust[]>([]);
  const [q, setQ] = useState('');
  useFocusEffect(useCallback(() => { api<Cust[]>('/customers').then(setItems).catch(() => {}); }, []));
  const shown = items.filter((c) => !q || c.name.includes(q) || (c.phone || '').includes(q));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="לקוחות" subtitle={`${items.length} לקוחות`} bell />
      <View style={{ padding: 12 }}>
        <TextInput value={q} onChangeText={setQ} placeholder="חיפוש לפי שם או טלפון…" style={st.search} />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 12, paddingTop: 0, gap: 10 }}
        renderItem={({ item: c }) => (
          <View style={st.card}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
              <Avatar name={c.name} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{c.name}{c.partner ? ` & ${c.partner}` : ''}</Text>
                <Text style={st.meta}>{c.eventType} · {fmt(c.eventDate)} · {c.guests} מוזמנים</Text>
              </View>
              <Badge tone={tone(c.status)}>{c.status}</Badge>
            </View>
            <View style={st.actions}>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.phone}`)} style={st.actBtn}><Text style={st.actT}>📞 חייג</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/972${(c.phone || '').replace(/\D/g, '').replace(/^0/, '')}`)} style={st.actBtn}><Text style={st.actT}>💬 WhatsApp</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${c.email}`)} style={st.actBtn}><Text style={st.actT}>✉️ מייל</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const st = StyleSheet.create({
  search: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right' },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 },
  name: { fontWeight: '700', color: C.ink, fontSize: 15, textAlign: 'right' },
  meta: { fontSize: 12, color: C.inkFaint, textAlign: 'right', marginTop: 2 },
  actions: { flexDirection: 'row-reverse', gap: 8, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  actBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  actT: { fontSize: 12, fontWeight: '600', color: C.inkSoft },
});
