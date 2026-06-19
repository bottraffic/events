import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { C } from '@/lib/theme';

export function Header({ title, subtitle, back, bell, right }: { title: string; subtitle?: string; back?: boolean; bell?: boolean; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.row}>
        {back ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}><Text style={styles.icon}>›</Text></TouchableOpacity>
        ) : <View style={styles.iconBtn} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ?? (bell ? (
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={styles.dot} />
          </TouchableOpacity>
        ) : <View style={styles.iconBtn} />)}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  row: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  icon: { fontSize: 30, color: C.inkSoft, transform: [{ scaleX: -1 }] },
  title: { fontSize: 20, fontWeight: '800', color: C.ink, textAlign: 'right' },
  subtitle: { fontSize: 12, color: C.inkMuted, textAlign: 'right', marginTop: 1 },
  dot: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: C.rose, borderWidth: 1.5, borderColor: '#fff' },
});
