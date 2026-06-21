import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
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
const SOURCES = ['WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'PHONE', 'REFERRAL', 'OTHER'];

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', source: 'WHATSAPP', estimatedValue: '' });

  const load = useCallback(() => { api<Lead[]>('/leads').then(setLeads).catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const advance = async (lead: Lead) => {
    const order = STAGES.find((s) => s.id === lead.stageId)?.order ?? 1;
    const next = STAGES.find((s) => s.order === order + 1);
    if (!next) return;
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, stageId: next.id } : l)));
    try {
      await api(`/leads/${lead.id}/stage`, { method: 'PATCH', body: JSON.stringify({ stageId: next.id }) });
    } catch { load(); }
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api('/leads', { method: 'POST', body: JSON.stringify({ name: form.name, phone: form.phone, source: form.source, estimatedValue: Number(form.estimatedValue) || 0 }) });
      setForm({ name: '', phone: '', source: 'WHATSAPP', estimatedValue: '' }); setAdding(false); load();
    } catch {} finally { setSaving(false); }
  };

  const sections = STAGES.map((s) => ({
    title: s.name, color: s.color, data: leads.filter((l) => l.stageId === s.id),
  })).filter((sec) => sec.data.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <SectionList
        style={styles.screen}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: section.color }]} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => Alert.alert(item.name, 'לחיצה רגילה מעבירה את הליד לשלב הבא')} onPress={() => advance(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{SOURCE_LABEL[item.source] ?? item.source}</Text>
            </View>
            {item.estimatedValue ? <Text style={styles.value}>₪{Number(item.estimatedValue).toLocaleString()}</Text> : null}
            {item.score != null ? <Text style={[styles.score, item.score >= 70 && { color: '#10b981' }]}>🔥 {item.score}%</Text> : null}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setAdding(true)}><Text style={styles.fabT}>＋</Text></TouchableOpacity>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>ליד חדש</Text>
            <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="שם *" style={styles.input} />
            <TextInput value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="טלפון" keyboardType="phone-pad" style={styles.input} />
            <TextInput value={form.estimatedValue} onChangeText={(v) => setForm({ ...form, estimatedValue: v })} placeholder="שווי משוער ₪" keyboardType="numeric" style={styles.input} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 }}>
              {SOURCES.map((s) => (
                <TouchableOpacity key={s} onPress={() => setForm({ ...form, source: s })} style={[styles.chip, form.source === s && styles.chipOn]}>
                  <Text style={form.source === s ? styles.chipTOn : styles.chipT}>{SOURCE_LABEL[s]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#f1f5f9', flex: 1 }]} onPress={() => setAdding(false)}><Text style={{ color: '#475569', fontWeight: '700' }}>ביטול</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#6366f1', flex: 1 }]} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>שמור</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontWeight: '700', color: '#334155', fontSize: 15 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  name: { fontWeight: '600', color: '#1e293b', fontSize: 15, textAlign: 'right' },
  meta: { color: '#94a3b8', fontSize: 12, textAlign: 'right', marginTop: 2 },
  value: { color: '#475569', fontSize: 13, fontWeight: '600' },
  score: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, left: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabT: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34, gap: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', textAlign: 'right', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, textAlign: 'right', fontSize: 15 },
  chip: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipT: { color: '#64748b', fontSize: 12 },
  chipTOn: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
});
