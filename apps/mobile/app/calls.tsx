import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Avatar, Badge } from '@/components/ui';

interface Call { id: string; name: string; number: string; status: string; dur: string; prob: number; }
const ST: Record<string, { l: string; t: string }> = { ANSWERED: { l: 'נענתה', t: 'emerald' }, MISSED: { l: 'לא נענתה', t: 'rose' }, DISCONNECTED: { l: 'נותקה', t: 'amber' } };

export default function Calls() {
  const [calls, setCalls] = useState<Call[]>([]);
  useEffect(() => { api<Call[]>('/calls').then(setCalls).catch(() => {}); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="שיחות" subtitle="Call Tracking · AI" back />
      <FlatList
        data={calls}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 14, gap: 8 }}
        renderItem={({ item: c }) => (
          <View style={st.row}>
            <Avatar name={c.name} size={38} />
            <View style={{ flex: 1 }}><Text style={st.name}>{c.name}</Text><Text style={st.meta}>{c.number} · {c.dur}</Text></View>
            <Badge tone={ST[c.status]?.t}>{ST[c.status]?.l}</Badge>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.number}`)} style={st.call}><Text style={{ fontSize: 16 }}>📞</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12 },
  name: { fontWeight: '600', color: C.ink, textAlign: 'right' },
  meta: { fontSize: 12, color: C.inkFaint, textAlign: 'right' },
  call: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.brand50, alignItems: 'center', justifyContent: 'center' },
});
