import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { RSVP_TONE, RSVP_LABEL } from '@/lib/theme';
import { Header } from '@/components/header';
import { Avatar, Badge, StatCard } from '@/components/ui';

interface Guest { id: string; name: string; group: string; size: number; status: string; }

export default function Rsvp() {
  const [guests, setGuests] = useState<Guest[]>([]);
  useEffect(() => { api<Guest[]>('/guests').then(setGuests).catch(() => {}); }, []);
  const sum = (s: string) => guests.filter((g) => g.status === s).reduce((a, g) => a + g.size, 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="אישורי הגעה" subtitle="גל & מאיה · חתונה" back />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 14 }}>
        <StatCard label="אישרו" value={sum('YES')} color={C.emerald} />
        <StatCard label="אולי" value={sum('MAYBE')} color={C.amber} />
        <StatCard label="לא מגיעים" value={sum('NO')} color={C.rose} />
        <StatCard label="ממתינים" value={sum('PENDING')} color={C.inkMuted} />
      </View>
      <FlatList
        data={guests}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 14, paddingTop: 0, gap: 8 }}
        renderItem={({ item: g }) => (
          <View style={st.row}>
            <Avatar name={g.name} size={36} />
            <View style={{ flex: 1 }}><Text style={st.name}>{g.name}</Text><Text style={st.meta}>{g.group} · {g.size} מקומות</Text></View>
            <Badge tone={RSVP_TONE[g.status]}>{RSVP_LABEL[g.status]}</Badge>
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
});
