import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Avatar, SectionTitle, Badge } from '@/components/ui';
import { registerForPush } from '@/lib/push';

export default function Settings() {
  const [me, setMe] = useState<any>(null);
  const [push, setPush] = useState(true);
  useEffect(() => { api('/auth/me').then(setMe).catch(() => {}); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="הגדרות" back />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <View style={st.profile}>
          <Avatar name={me?.name ?? 'דני מנהל'} size={56} />
          <View style={{ flex: 1 }}><Text style={st.name}>{me?.name ?? 'דני מנהל'}</Text><Text style={st.email}>admin@demo.simcha.io</Text></View>
          <Badge tone="brand">מנהל מערכת</Badge>
        </View>

        <SectionTitle>התראות Push</SectionTitle>
        <View style={st.card}>
          <View style={st.row}>
            <Text style={st.label}>קבלת התראות במכשיר</Text>
            <Switch value={push} onValueChange={(v) => { setPush(v); if (v) registerForPush(); }} trackColor={{ true: C.brand }} />
          </View>
        </View>

        <SectionTitle>אודות</SectionTitle>
        <View style={st.card}>
          <View style={[st.row, st.border]}><Text style={st.label}>אולם</Text><Text style={st.val}>אולמי דמו</Text></View>
          <View style={[st.row, st.border]}><Text style={st.label}>חבילה</Text><Text style={st.val}>Pro</Text></View>
          <View style={st.row}><Text style={st.label}>גרסה</Text><Text style={st.val}>SIMCHA OS 1.0</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}
const st = StyleSheet.create({
  profile: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16 },
  name: { fontWeight: '800', color: C.ink, fontSize: 16, textAlign: 'right' },
  email: { fontSize: 12, color: C.inkFaint, textAlign: 'right' },
  card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 14, color: C.inkSoft },
  val: { fontSize: 14, color: C.inkFaint, fontWeight: '600' },
});
