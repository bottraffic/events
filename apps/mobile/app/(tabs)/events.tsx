import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { api } from '@/lib/api';

interface EventRow {
  id: string;
  type: string;
  eventDate: string;
  guestsCount: number;
  status: string;
  totalPrice?: number;
  customer?: { name: string; partnerName?: string };
}

const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  INQUIRY: { label: 'פנייה', bg: '#f1f5f9', fg: '#475569' },
  OPTION: { label: 'אופציה', bg: '#fef3c7', fg: '#b45309' },
  BOOKED: { label: 'סגור', bg: '#d1fae5', fg: '#047857' },
  COMPLETED: { label: 'הסתיים', bg: '#e0f2fe', fg: '#0369a1' },
  CANCELLED: { label: 'בוטל', bg: '#fee2e2', fg: '#b91c1c' },
};

export default function Events() {
  const [events, setEvents] = useState<EventRow[]>([]);
  useEffect(() => {
    api<EventRow[]>('/events').then(setEvents).catch(() => {});
  }, []);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: 16 }}
      data={events}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => {
        const st = STATUS[item.status] ?? STATUS.INQUIRY;
        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>
                {item.customer?.name}
                {item.customer?.partnerName ? ` & ${item.customer.partnerName}` : ''}
              </Text>
              <View style={[styles.badge, { backgroundColor: st.bg }]}>
                <Text style={[styles.badgeText, { color: st.fg }]}>{st.label}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {item.type} · {new Date(item.eventDate).toLocaleDateString('he-IL')} · {item.guestsCount} מוזמנים
            </Text>
            {item.totalPrice ? <Text style={styles.price}>₪{Number(item.totalPrice).toLocaleString()}</Text> : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', color: '#1e293b', fontSize: 16, textAlign: 'right' },
  meta: { color: '#64748b', fontSize: 13, textAlign: 'right', marginTop: 8 },
  price: { color: '#334155', fontSize: 14, fontWeight: '700', textAlign: 'right', marginTop: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
