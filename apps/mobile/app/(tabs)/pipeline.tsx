import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import { STAGES } from '@/lib/mock';

interface Lead {
  id: string;
  name: string;
  source: string;
  score?: number;
  estimatedValue?: number;
  stageId: string;
}

const SOURCE_LABEL: Record<string, string> = {
  FACEBOOK: 'פייסבוק', INSTAGRAM: 'אינסטגרם', GOOGLE_ADS: 'גוגל', TIKTOK: 'טיקטוק',
  WHATSAPP: 'וואטסאפ', WEBSITE: 'אתר', PHONE: 'טלפון', REFERRAL: 'המלצה', OTHER: 'אחר',
};

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const load = useCallback(() => {
    api<Lead[]>('/leads').then(setLeads).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const advance = async (lead: Lead) => {
    const order = STAGES.find((s) => s.id === lead.stageId)?.order ?? 1;
    const next = STAGES.find((s) => s.order === order + 1);
    if (!next) return;
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, stageId: next.id } : l)));
    try {
      await api(`/leads/${lead.id}/stage`, { method: 'PATCH', body: JSON.stringify({ stageId: next.id }) });
    } catch {
      load();
    }
  };

  const sections = STAGES.map((s) => ({
    title: s.name,
    color: s.color,
    data: leads.filter((l) => l.stageId === s.id),
  })).filter((sec) => sec.data.length > 0);

  return (
    <SectionList
      style={styles.screen}
      contentContainerStyle={{ padding: 16 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View style={[styles.dot, { backgroundColor: section.color }]} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onLongPress={() => Alert.alert(item.name, 'לחיצה רגילה מעבירה את הליד לשלב הבא')}
          onPress={() => advance(item)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{SOURCE_LABEL[item.source] ?? item.source}</Text>
          </View>
          {item.estimatedValue ? <Text style={styles.value}>₪{Number(item.estimatedValue).toLocaleString()}</Text> : null}
          {item.score != null ? (
            <Text style={[styles.score, item.score >= 70 && { color: '#10b981' }]}>🔥 {item.score}%</Text>
          ) : null}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontWeight: '700', color: '#334155', fontSize: 15 },
  card: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  name: { fontWeight: '600', color: '#1e293b', fontSize: 15, textAlign: 'right' },
  meta: { color: '#94a3b8', fontSize: 12, textAlign: 'right', marginTop: 2 },
  value: { color: '#475569', fontSize: 13, fontWeight: '600' },
  score: { color: '#64748b', fontSize: 13, fontWeight: '700' },
});
