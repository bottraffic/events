import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Badge, StatCard } from '@/components/ui';

interface Doc { id: string; number: string; type: string; customerName: string; total: number; status: string; }

export default function Documents() {
  const [docs, setDocs] = useState<Doc[]>([]);
  useEffect(() => { api<Doc[]>('/documents').then(setDocs).catch(() => {}); }, []);
  const total = docs.reduce((a, d) => a + d.total, 0);
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
        contentContainerStyle={{ padding: 14, paddingTop: 0, gap: 8 }}
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
    </View>
  );
}
const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 13 },
  num: { fontWeight: '700', color: C.ink, textAlign: 'right' },
  meta: { fontSize: 12, color: C.inkFaint, textAlign: 'right', marginTop: 2 },
  total: { fontWeight: '800', color: C.ink },
});
