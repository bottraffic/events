import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Card, StatCard, SectionTitle, Avatar } from '@/components/ui';

const QUICK = [
  { icon: '🎯', label: 'לידים', href: '/pipeline' },
  { icon: '📅', label: 'יומן', href: '/calendar' },
  { icon: '✉️', label: 'אישורי הגעה', href: '/rsvp' },
  { icon: '🧾', label: 'חשבוניות', href: '/documents' },
  { icon: '📞', label: 'שיחות', href: '/calls' },
  { icon: '⚙️', label: 'עוד', href: '/more' },
];

export default function Dashboard() {
  const router = useRouter();
  const [ov, setOv] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(() => { api('/reports/overview').then(setOv).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="שלום דני 👋" subtitle="תמונת מצב להיום" bell />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); setTimeout(() => setRefreshing(false), 500); }} />}>
        {/* Voice assistant CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/ai')} style={st.voice}>
          <View style={st.mic}><Text style={{ fontSize: 22 }}>🎙️</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={st.voiceTitle}>עוזר קולי חכם</Text>
            <Text style={st.voiceSub}>"כמה לידים החודש?" · "מה הפגישות שלי?" — דבר ושאל</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 22 }}>‹</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 }}>
          <StatCard label="לידים החודש" value={ov?.leadsThisMonth ?? '—'} color={C.brand} />
          <StatCard label="עסקאות שנסגרו" value={ov?.closedDeals ?? '—'} color={C.emerald} />
          <StatCard label="הכנסה צפויה" value={ov ? `₪${Number(ov.expectedRevenue).toLocaleString()}` : '—'} color={C.amber} />
          <StatCard label="אחוז המרה" value={ov ? `${ov.conversionRate}%` : '—'} color={C.sky} />
        </View>

        <View>
          <SectionTitle>גישה מהירה</SectionTitle>
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 }}>
            {QUICK.map((q) => (
              <TouchableOpacity key={q.label} onPress={() => router.push(q.href as any)} style={st.quick}>
                <Text style={{ fontSize: 24 }}>{q.icon}</Text>
                <Text style={st.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <SectionTitle>פעילות אחרונה</SectionTitle>
          <Card style={{ padding: 0 }}>
            {[{ w: 'יוסי כהן', t: 'ליד חדש מפייסבוק', tm: 'עכשיו' }, { w: 'אבי רוזן', t: 'חתם על חוזה', tm: 'לפני שעה' }, { w: 'רינה לוי', t: 'הודעת WhatsApp', tm: 'לפני שעתיים' }].map((a, i) => (
              <View key={i} style={[st.actRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }]}>
                <Avatar name={a.w} size={36} />
                <View style={{ flex: 1 }}><Text style={st.actName}>{a.w}</Text><Text style={st.actT}>{a.t}</Text></View>
                <Text style={st.actTm}>{a.tm}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  voice: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: C.brand, borderRadius: 18, padding: 16 },
  mic: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  voiceTitle: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'right' },
  voiceSub: { color: '#e0e7ff', fontSize: 12, textAlign: 'right', marginTop: 2 },
  quick: { width: '31%', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 6 },
  quickLabel: { fontSize: 12, fontWeight: '600', color: C.inkSoft },
  actRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 12 },
  actName: { fontWeight: '600', color: C.ink, textAlign: 'right' },
  actT: { fontSize: 12, color: C.inkFaint, textAlign: 'right' },
  actTm: { fontSize: 11, color: C.inkFaint },
});
