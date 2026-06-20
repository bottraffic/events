import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/lib/api';
import { C } from '@/lib/theme';
import { Header } from '@/components/header';
import { Avatar, SectionTitle, Badge } from '@/components/ui';
import { registerForPush } from '@/lib/push';

export default function Settings() {
  const [me, setMe] = useState<any>(null);
  const [push, setPush] = useState(true);
  const [logo, setLogo] = useState<string | null>(null);
  const [venue, setVenue] = useState('אולמי דמו');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/auth/me').then(setMe).catch(() => {});
    api('/tenant').then((t: any) => { setLogo(t.logoUrl ?? null); if (t.name) setVenue(t.name); }).catch(() => {});
  }, []);

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.6, base64: true,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const dataUrl = `data:image/jpeg;base64,${res.assets[0].base64}`;
    setSaving(true);
    try { await api('/tenant/logo', { method: 'PATCH', body: JSON.stringify({ logo: dataUrl }) }); setLogo(dataUrl); }
    catch {} finally { setSaving(false); }
  };
  const removeLogo = async () => {
    try { await api('/tenant/logo/remove', { method: 'PATCH' }); } catch {}
    setLogo(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="הגדרות" back />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <View style={st.profile}>
          <Avatar name={me?.name ?? 'דני מנהל'} size={56} />
          <View style={{ flex: 1 }}><Text style={st.name}>{me?.name ?? 'דני מנהל'}</Text><Text style={st.email}>admin@demo.simcha.io</Text></View>
          <Badge tone="brand">מנהל מערכת</Badge>
        </View>

        <SectionTitle>מיתוג האולם</SectionTitle>
        <View style={[st.card, { padding: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 14 }]}>
          <View style={st.logoBox}>
            {logo ? <Image source={{ uri: logo }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              : <Text style={{ fontSize: 30, fontWeight: '800', color: '#cbd5e1' }}>{venue.charAt(0)}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[st.label, { fontWeight: '700', marginBottom: 2 }]}>לוגו האולם</Text>
            <Text style={{ fontSize: 11, color: C.inkFaint, marginBottom: 10, textAlign: 'right' }}>יוצג בהזמנות, מסמכים ובאתר</Text>
            <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
              <TouchableOpacity onPress={pickLogo} disabled={saving} style={st.btn}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.btnTxt}>{logo ? 'החלף לוגו' : 'העלה לוגו'}</Text>}
              </TouchableOpacity>
              {logo && <TouchableOpacity onPress={removeLogo} style={st.btnGhost}><Text style={{ color: C.rose, fontWeight: '700' }}>הסר</Text></TouchableOpacity>}
            </View>
          </View>
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
          <View style={[st.row, st.border]}><Text style={st.label}>אולם</Text><Text style={st.val}>{venue}</Text></View>
          <View style={[st.row, st.border]}><Text style={st.label}>חבילה</Text><Text style={st.val}>Pro</Text></View>
          <View style={st.row}><Text style={st.label}>גרסה</Text><Text style={st.val}>events360 1.0</Text></View>
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
  logoBox: { width: 76, height: 76, borderRadius: 16, borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  btn: { backgroundColor: C.brand, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  btnGhost: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, justifyContent: 'center' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 14, color: C.inkSoft, textAlign: 'right' },
  val: { fontSize: 14, color: C.inkFaint, fontWeight: '600' },
});
