import { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { C, TONE } from '@/lib/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function StatCard({ label, value, color = C.brand }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: string }) {
  const t = TONE[tone] ?? TONE.slate;
  return (
    <View style={[s.badge, { backgroundColor: t.bg }]}>
      <Text style={[s.badgeText, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

export function Avatar({ name, size = 40 }: { name?: string; size?: number }) {
  const safe = (name ?? '').trim() || '?';
  const initials = safe.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  const hue = [...safe].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `hsl(${hue},65%,55%)`, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={s.section}>{children}</Text>;
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16 },
  stat: { flex: 1, minWidth: '45%', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14 },
  statLabel: { fontSize: 12, color: C.inkMuted, textAlign: 'right' },
  statValue: { fontSize: 24, fontWeight: '800', textAlign: 'right', marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  section: { fontSize: 13, fontWeight: '700', color: C.inkSoft, textAlign: 'right', marginBottom: 8, marginTop: 4 },
});
